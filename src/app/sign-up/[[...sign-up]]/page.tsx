import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Interactive3DOrb } from '@/components/3d/Interactive3DOrb';
import { Badge } from '@/components/ui/badge';

export default function SignUpPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#FAFAFC]">
      {/* LEFT 3D INTERACTIVE HERO COLUMN */}
      <div className="hidden lg:flex flex-col relative overflow-hidden border-r border-border/50 bg-gradient-to-br from-blue-50/50 via-slate-50/30 to-[#FAFAFC]">
        <Interactive3DOrb />
      </div>

      {/* RIGHT AUTH FORM COLUMN */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-white overflow-y-auto">
        <div className="flex items-center justify-between w-full max-w-md mx-auto">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <Badge variant="outline" className="text-[10px] gap-1 font-mono bg-primary/5 text-primary border-primary/20">
            <Sparkles className="w-3 h-3 text-primary" /> Free Capacity Account
          </Badge>
        </div>

        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="text-left mb-6 space-y-1.5">
            <div className="flex items-center gap-2 mb-3">
              <img src="/axoria-logo.svg" alt="Axoria" className="h-8 w-8" />
              <span className="font-extrabold text-lg tracking-wider text-foreground">AXORIA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Create your account
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Start building capacity, diagnosing skills, and earning verified certificates today.
            </p>
          </div>

          <div className="min-h-[380px] flex items-center justify-center">
            <SignUp
              fallbackRedirectUrl="/onboarding"
              forceRedirectUrl="/onboarding"
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  cardBox: 'shadow-none border-0 p-0 w-full bg-transparent',
                  card: 'shadow-none p-0 w-full bg-transparent',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton: 'border border-border rounded-xl hover:bg-accent h-10 text-xs font-semibold',
                  formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10 text-xs font-bold shadow-xs',
                  footerActionLink: 'text-primary hover:text-primary/80 font-semibold text-xs',
                  formFieldInput: 'border-border rounded-xl text-xs h-10',
                  formFieldLabel: 'text-xs font-semibold text-foreground',
                },
              }}
            />
          </div>
        </div>

        <div className="w-full max-w-md mx-auto text-center text-[11px] text-muted-foreground">
          © 2026 Axoria Capacity Connect. Built for Smart India Hackathon.
        </div>
      </div>
    </div>
  );
}
