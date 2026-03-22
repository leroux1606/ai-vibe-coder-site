import type { ReactNode } from "react";

export default function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={["card", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
