import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/axoria-logo.svg" alt="Axoria" className="h-12 w-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="text-muted-foreground mt-1">Get started with Axoria</p>
        </div>
        <SignUp
          fallbackRedirectUrl="/onboarding"
          forceRedirectUrl="/onboarding"
          appearance={{
            elements: {
              rootBox: 'mx-auto w-full',
              cardBox: 'shadow-none border border-border rounded-xl w-full',
              card: 'shadow-none w-full',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 'border border-border rounded-lg hover:bg-accent',
              formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg',
              footerActionLink: 'text-primary hover:text-primary/80',
              formFieldInput: 'border-border rounded-lg',
            },
          }}
        />
      </div>
    </div>
  );
}
