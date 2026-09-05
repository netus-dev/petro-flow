import { Suspense } from "react";
import { LoginContent } from "@/src/features/auth/presentation/components/login-content";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginPageFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-12 w-full max-w-sm animate-pulse rounded-lg bg-muted" />
    </main>
  );
}
