import Link from 'next/link';
import styles from './Button.module.scss';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  fullWidth?: boolean;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
  external?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  href,
  onClick,
  type = 'button',
  fullWidth = false,
  className = '',
  ariaLabel,
  disabled = false,
  external = false,
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    size === 'large' && styles.large,
    size === 'small' && styles.small,
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          className={classes}
          aria-label={ariaLabel}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
