import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-dvh flex-col bg-background px-4 py-8 safe-top safe-bottom">
      <div className="mx-auto w-full max-w-sm flex-1 flex flex-col">
        <Link to="/" className="mb-8 flex items-center gap-2 self-start">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading font-bold">
            र
          </div>
          <span className="font-heading text-lg font-bold">
            reSell <span className="text-primary">Nepal</span>
          </span>
        </Link>

        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex-1">{children}</div>

        {footer && <div className="mt-8 text-center text-sm">{footer}</div>}
      </div>
    </div>
  );
};
