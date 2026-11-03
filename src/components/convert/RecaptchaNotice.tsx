import { RECAPTCHA_ENABLED } from './useContactSubmit';

/**
 * Google's reCAPTCHA notice, in Google's own words. The badge is hidden
 * site-wide (globals.scss), so every form that runs reCAPTCHA shows this
 * beside it instead. Renders nothing when no site key is configured.
 */
export default function RecaptchaNotice({ className }: { className?: string }) {
  if (!RECAPTCHA_ENABLED) return null;
  return (
    <p className={className}>
      This site is protected by reCAPTCHA and the Google{' '}
      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
        Privacy Policy<span className="visually-hidden"> (opens in a new tab)</span>
      </a>{' '}
      and{' '}
      <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
        Terms of Service<span className="visually-hidden"> (opens in a new tab)</span>
      </a>{' '}
      apply.
    </p>
  );
}
