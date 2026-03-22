import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary";

type Base = {
  children: ReactNode;
  variant?: ButtonVariant;
};

type LinkButton = Base & {
  href: string;
  target?: string;
  rel?: string;
};

type NativeButton = Base & {
  href?: undefined;
  onClick?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
};

export default function Button(props: LinkButton | NativeButton) {
  const { children, variant = "primary" } = props;
  const className = variant === "secondary" ? "button secondary" : "button";

  if ("href" in props && props.href) {
    const { href, target, rel } = props;
    return (
      <a className={className} href={href} target={target} rel={rel}>
        {children}
      </a>
    );
  }

  const b = props as NativeButton;
  return (
    <button
      type="button"
      className={className}
      onClick={b.onClick}
      disabled={b.disabled}
      aria-label={b["aria-label"]}
    >
      {children}
    </button>
  );
}
