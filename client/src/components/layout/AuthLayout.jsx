import { Zap } from "lucide-react";

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-[80vh] flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20 py-16 bg-surface-2 border-r border-border">
        <div className="max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-8">
            <Zap className="w-6 h-6 text-accent" />
          </div>
          <h2 className="font-heading text-3xl font-bold text-text-primary mb-4">
            Swap skills with peers
          </h2>
          <p className="text-text-secondary">
            Teach what you know, learn what you need. No money—just knowledge exchange.
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <h2 className="font-heading text-2xl font-bold text-text-primary">SkillSwap</h2>
          </div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary mb-1">{title}</h1>
          {subtitle && <p className="text-text-secondary text-sm mb-6">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
