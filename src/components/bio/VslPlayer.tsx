'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { getImageProps } from 'next/image';
import Arrow from '@/components/ui/Arrow';
import { CTA_LABEL, VSL, cueAt } from './vsl';
import { openCallForm, track, writeWatch } from './events';
import styles from './VslPlayer.module.scss';

/**
 * The founder's 28-second video, played the way video sales pages play it
 * (the hiddengem.media pattern Leshan pointed to), without its tricks:
 *
 * - Once the page has loaded and is idle, it starts muted, with captions,
 *   and says so over the picture: "Your video is playing. Tap to turn on
 *   sound." That tap plays it again from the start, with sound, so nobody
 *   misses the opening line. A Pause button is always on screen too (WCAG
 *   2.2.2: anything that moves for more than 5 seconds can be stopped).
 * - It never starts by itself for people who ask for less motion or less
 *   data, on a 2G/3G connection, or when the browser refuses (iPhone Low
 *   Power Mode): then the poster shows a large Play button that plays it
 *   with sound.
 * - The progress bar is honest (no "fast start" bar), and the captions are
 *   the founder's words with their timing (vsl.ts CUES, the same words as the
 *   transcript and the WebVTT file).
 * - At the end, the ask: "Book my call", or watch again.
 *
 * Phones get the 720p file (2.5 MB), larger screens 1080p (5.9 MB), set by
 * pickSource() on the first play. Nothing
 * downloads before the autoplay attempt or a press: until then the picture
 * is the poster image (next/image, AVIF/WebP), preloaded as the hero's
 * largest image.
 */

type Mode = 'poster' | 'preview' | 'sound' | 'ended';

/** A transparent pixel: phones draw the poster from the stylesheet instead (see below). */
const NO_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * The poster on tablets and larger: next/image's widths and formats (AVIF/WebP),
 * fetched at high priority. Phones get the transparent pixel from the <picture>,
 * and see the poster the stylesheet inlines (scripts/vsl-poster.mjs, ~7 KB AVIF):
 * it paints with the page, without a request of its own.
 */
const { props: posterProps } = getImageProps({
  src: VSL.poster,
  alt: '',
  fill: true,
  sizes: '(min-width: 1024px) 52vw, 92vw',
  loading: 'eager',
  fetchPriority: 'high',
});

const PROGRESS_MARKS = [25, 50, 75] as const;

function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** The captions track's mode, set from outside React's render (the track belongs to the <video>). */
function setTrackMode(textTrack: TextTrack, mode: TextTrackMode): void {
  textTrack.mode = mode;
}

type WebkitVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void; webkitDisplayingFullscreen?: boolean };

/**
 * The file for this screen, set once before the first play: 720p up to 767px
 * wide, 1080p above. Chosen here because WebKit ignores `media` on a video's
 * <source> and would send iPhones the 1080p file.
 */
function pickSource(video: HTMLVideoElement): void {
  if (video.getAttribute('src')) return;
  video.src = window.matchMedia('(max-width: 767px)').matches ? VSL.phone : VSL.desktop;
}

export default function VslPlayer() {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<WebkitVideo>(null);
  const [mode, setMode] = useState<Mode>('poster');
  const modeRef = useRef<Mode>('poster');
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [started, setStarted] = useState(false); // a frame has played: the poster image can go
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState<number>(VSL.duration);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const marksSent = useRef(new Set<number>());
  // The captions choice, for the iPhone fullscreen handler (an event listener reads the latest one).
  const captionsRef = useRef(captionsOn);
  useEffect(() => {
    captionsRef.current = captionsOn;
  }, [captionsOn]);

  const go = useCallback((next: Mode) => {
    modeRef.current = next;
    setMode(next);
  }, []);

  // Muted autoplay, once the page has loaded and the main thread is idle.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const saveData = connection?.saveData === true || window.matchMedia('(prefers-reduced-data: reduce)').matches;
    // On a 2G or 3G connection the preview would spend the visitor's data before they chose to
    // watch (Chromium reports it; elsewhere this is unknown and the preview plays).
    const slow = /(^|-)(2g|3g)$/.test(connection?.effectiveType ?? '');
    if (reduce || saveData || slow) return;

    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const start = () => {
      if (cancelled || modeRef.current !== 'poster') return;
      // Only when the player is at least partly on screen; otherwise the observer below starts it.
      const box = frameRef.current?.getBoundingClientRect();
      if (box && (box.bottom < 0 || box.top > window.innerHeight)) return;
      video.muted = true;
      pickSource(video);
      video
        .play()
        .then(() => {
          if (cancelled || modeRef.current !== 'poster') return;
          go('preview');
          track('vsl_autoplay');
        })
        .catch(() => {
          // Refused (Low Power Mode, a browser setting): the poster's Play button stays.
        });
    };
    const schedule = () => {
      if (typeof window.requestIdleCallback === 'function') idleId = window.requestIdleCallback(start, { timeout: 2000 });
      else timeoutId = window.setTimeout(start, 400);
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });

    // The muted preview plays only while the player is on screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (modeRef.current === 'poster' && entry.isIntersecting && document.readyState === 'complete') start();
        if (modeRef.current !== 'preview') return;
        if (entry.intersectionRatio < 0.25) video.pause();
        else video.play().catch(() => {});
      },
      { threshold: [0, 0.25] },
    );
    if (frameRef.current) observer.observe(frameRef.current);

    return () => {
      cancelled = true;
      window.removeEventListener('load', schedule);
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [go]);

  // Captions are drawn from CUES (vsl.ts) at the current time. The <track> is for the iPhone's
  // own fullscreen player only, where our line cannot show: on while it is up (if captions are on).
  useEffect(() => {
    const video = videoRef.current;
    const textTrack = video?.textTracks[0];
    if (!video || !textTrack) return;
    const onBegin = () => setTrackMode(textTrack, captionsRef.current ? 'showing' : 'disabled');
    const onEnd = () => setTrackMode(textTrack, 'disabled');
    video.addEventListener('webkitbeginfullscreen', onBegin);
    video.addEventListener('webkitendfullscreen', onEnd);
    return () => {
      video.removeEventListener('webkitbeginfullscreen', onBegin);
      video.removeEventListener('webkitendfullscreen', onEnd);
    };
  }, []);

  // Fullscreen: the frame itself where the browser allows it (captions and controls come
  // along), the iPhone's own video fullscreen otherwise.
  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const playWithSound = useCallback(
    (from: string) => {
      const video = videoRef.current;
      if (!video) return;
      const restart = modeRef.current !== 'sound';
      go('sound');
      pickSource(video);
      if (restart) video.currentTime = 0;
      video.muted = false;
      setMuted(false);
      video.play().catch(() => {
        // A browser that refuses sound even after a press: play muted, with captions.
        video.muted = true;
        setMuted(true);
        video.play().catch(() => go('poster'));
      });
      track('vsl_play', { from });
    },
    [go],
  );

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, []);

  const pausePreview = useCallback(() => {
    videoRef.current?.pause();
    go('poster');
    track('vsl_preview_paused');
  }, [go]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const frame = frameRef.current;
    const video = videoRef.current;
    if (!frame || !video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (document.fullscreenEnabled) {
      frame.requestFullscreen().catch(() => {});
    } else {
      video.webkitEnterFullscreen?.();
    }
  }, []);

  const onTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setTime(video.currentTime);
    const total = video.duration || VSL.duration;
    const fraction = Math.min(1, video.currentTime / total);
    writeWatch({ furthest: fraction, withSound: !video.muted && modeRef.current === 'sound' });
    if (modeRef.current !== 'sound') return;
    for (const mark of PROGRESS_MARKS) {
      if (fraction * 100 >= mark && !marksSent.current.has(mark)) {
        marksSent.current.add(mark);
        track('vsl_progress', { percent: mark });
      }
    }
  };

  const onEnded = () => {
    const video = videoRef.current;
    writeWatch({ furthest: 1, withSound: Boolean(video && !video.muted && modeRef.current === 'sound') });
    if (modeRef.current === 'preview') {
      // The muted preview ran to the end without a tap: offer the ask, as after a full watch.
      track('vsl_preview_ended');
    } else {
      track('vsl_complete');
    }
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    go('ended');
  };

  const seek = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value;
    setTime(value);
  };

  const onSeekKey = (event: KeyboardEvent<HTMLInputElement>) => {
    // Space on the slider plays or pauses, as on every video player.
    if (event.key === ' ') {
      event.preventDefault();
      togglePlay();
    }
  };

  const watchAgain = () => {
    marksSent.current.clear();
    playWithSound('replay');
  };

  const cue = cueAt(time);
  const showCaption = captionsOn && cue && mode !== 'ended' && (mode !== 'poster' || started);

  return (
    <div
      ref={frameRef}
      className={styles.frame}
      data-mode={mode}
      data-playing={playing ? '' : undefined}
      data-fullscreen={fullscreen ? '' : undefined}
    >
      <video
        ref={videoRef}
        className={styles.video}
        playsInline
        muted
        preload="none"
        aria-label={VSL.label}
        onPlay={() => setPlaying(true)}
        onPlaying={() => setStarted(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={onTimeUpdate}
        onSeeked={(event) => setTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || VSL.duration)}
        onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
        onEnded={onEnded}
        // A click on the picture: during the muted preview it turns the sound on (as the pill
        // does, the keyboard's way); with the controls showing it plays or pauses.
        onClick={mode === 'preview' ? () => playWithSound('unmute_picture') : mode === 'sound' ? togglePlay : undefined}
      >
        {/* The file is set by pickSource() on the first play; the track serves the iPhone's own fullscreen. */}
        <track kind="captions" src={VSL.captions} srcLang="en" label="English" />
      </video>

      {/* The poster, until the first frame plays. */}
      <picture>
        <source media="(max-width: 767px)" srcSet={NO_IMAGE} />
        <img {...posterProps} alt="" className={styles.poster} data-hidden={started ? '' : undefined} />
      </picture>

      {showCaption ? (
        <p className={styles.caption} aria-hidden="true">
          <span>{cue}</span>
        </p>
      ) : null}

      {mode === 'poster' ? (
        <button type="button" className={styles.bigPlay} onClick={() => playWithSound(started ? 'resume' : 'poster')}>
          <span className={styles.bigPlayIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28" focusable="false">
              <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
            </svg>
          </span>
          <span className={styles.bigPlayText}>
            Watch with sound <span className={styles.bigPlayTime}>{clock(VSL.duration)}</span>
          </span>
        </button>
      ) : null}

      {mode === 'preview' ? (
        <>
          <button type="button" className={styles.unmute} onClick={() => playWithSound('unmute')}>
            <svg className={styles.unmuteIcon} viewBox="0 0 24 24" width="40" height="40" aria-hidden="true" focusable="false">
              <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
              <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className={styles.unmuteTitle}>Your video is playing</span>
            <span className={styles.unmuteHint}>Tap to turn on sound</span>
          </button>
          <button type="button" className={styles.cornerPause} onClick={pausePreview}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
              <path d="M8 5.5h2.8v13H8zM13.2 5.5H16v13h-2.8z" fill="currentColor" />
            </svg>
            <span className={styles.cornerPauseLabel}>Pause</span>
          </button>
        </>
      ) : null}

      {mode === 'sound' ? (
        <div className={styles.controls}>
          <button type="button" className={styles.control} onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
              {playing ? <path d="M8 5.5h2.8v13H8zM13.2 5.5H16v13h-2.8z" fill="currentColor" /> : <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />}
            </svg>
          </button>
          <label className={styles.seek}>
            <span className="visually-hidden">Position in the video</span>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={Math.min(time, duration)}
              onChange={(event) => seek(Number(event.target.value))}
              onKeyDown={onSeekKey}
              aria-valuetext={`${clock(time)} of ${clock(duration)}`}
              style={{ '--fill': `${(Math.min(time, duration) / duration) * 100}%` } as CSSProperties}
            />
          </label>
          <span className={styles.time} aria-hidden="true">
            {clock(time)} / {clock(duration)}
          </span>
          <button
            type="button"
            className={styles.control}
            onClick={() => setCaptionsOn((on) => !on)}
            aria-pressed={captionsOn}
            aria-label="Captions"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
              <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M10.4 10.2a2.2 2.2 0 1 0 0 3.6M16.4 10.2a2.2 2.2 0 1 0 0 3.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <button type="button" className={styles.control} onClick={toggleMute} aria-pressed={muted} aria-label="Mute">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
              <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
              {muted ? (
                <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
          <button
            type="button"
            className={styles.control}
            onClick={toggleFullscreen}
            aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}
          >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
                {fullscreen ? (
                  <path d="M9 4.5V9H4.5M15 4.5V9h4.5M9 19.5V15H4.5M15 19.5V15h4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M4.5 9V4.5H9M19.5 9V4.5H15M4.5 15v4.5H9M19.5 15v4.5H15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
          </button>
        </div>
      ) : null}

      {mode === 'ended' ? (
        <div className={styles.end}>
          <p className={styles.endTitle}>Tell us what you’re building and your deadline.</p>
          <div className={styles.endActions}>
            <button
              type="button"
              className={styles.endPrimary}
              aria-haspopup="dialog"
              onClick={() => openCallForm('vsl_end')}
            >
              {CTA_LABEL}
              <span aria-hidden="true" className={styles.endArrow}>
                <Arrow />
              </span>
            </button>
            <button type="button" className={styles.endAgain} onClick={watchAgain}>
              Watch again
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
