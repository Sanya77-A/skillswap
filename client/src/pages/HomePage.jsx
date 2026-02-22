import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Compass, MessageSquare, Calendar, Star, ArrowRight, Zap } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export default function HomePage() {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  return (
    <div className="min-h-[80vh]">
      {/* Hero */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent-2/5 pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent-2/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary tracking-tight mb-6">
            Swap skills.
            <br />
            <span className="text-accent">Learn anything.</span>
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10">
            Exchange skills with peers. Teach React, learn DSA. No money—just knowledge.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <Button asChild size="lg">
                <Link to="/dashboard">Go to Dashboard <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link to="/register">Get started</Link>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-16">
        <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-text-primary text-center mb-10">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { icon: Compass, title: "Match", desc: "Find users who offer what you want and want what you offer." },
            { icon: Zap, title: "Swap", desc: "Send requests, accept or reject, and agree on skill exchange." },
            { icon: MessageSquare, title: "Chat & Sessions", desc: "Real-time chat and book sessions to learn." },
            { icon: Star, title: "Review", desc: "Leave reviews and build your reputation." },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} hover className="p-6">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-text-primary mb-2">{title}</h3>
              <p className="text-text-secondary text-sm">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works - 3 steps */}
      <section className="py-16 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-2xl font-semibold text-text-primary text-center mb-12">
            Three simple steps
          </h2>
          <div className="space-y-8">
            {[
              { step: 1, title: "Add your skills", text: "List what you can teach and what you want to learn." },
              { step: 2, title: "Discover matches", text: "We find peers with complementary skills." },
              { step: 3, title: "Swap & grow", text: "Request a swap, chat, schedule a session, and leave a review." },
            ].map(({ step, title, text }) => (
              <div key={step} className="flex gap-4 items-start">
                <span className="w-10 h-10 rounded-full bg-accent/20 text-accent font-heading font-bold flex items-center justify-center shrink-0">
                  {step}
                </span>
                <div>
                  <h3 className="font-heading font-medium text-text-primary">{title}</h3>
                  <p className="text-text-secondary text-sm mt-1">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="py-16 text-center">
          <Card className="max-w-xl mx-auto p-8 bg-surface border border-border">
            <h2 className="font-heading text-xl font-semibold text-text-primary mb-2">Ready to swap?</h2>
            <p className="text-text-secondary text-sm mb-6">Join SkillSwap and start learning from peers today.</p>
            <Button asChild size="lg">
              <Link to="/register">Create free account</Link>
            </Button>
          </Card>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-heading font-semibold text-text-primary">SkillSwap</span>
          <div className="flex gap-6 text-sm text-text-secondary">
            <Link to="/login" className="hover:text-text-primary transition-colors">Login</Link>
            <Link to="/register" className="hover:text-text-primary transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
