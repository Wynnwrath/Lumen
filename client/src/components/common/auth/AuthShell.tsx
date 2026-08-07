import type { ReactNode } from "react";

// Two-column auth layout: left brand/banner panel + right form.
interface AuthShellProps {
  left?: ReactNode;
  children: ReactNode;
}

export const AuthShell = ({ left, children }: AuthShellProps) => (
  <div className="min-h-screen grid lg:grid-cols-2 bg-background text-on-background">
    <div className="hidden lg:flex flex-col justify-between p-8 bg-primary text-on-primary">{left}</div>
    <div className="flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">{children}</div>
    </div>
  </div>
);
