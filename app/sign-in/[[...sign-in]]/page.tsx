"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, LineChart, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { LanguageSelector } from "@/components/layout/language-selector";
import { useI18n } from "@/lib/i18n/context";

type ClerkSignInError = {
  errors?: Array<{ code?: string; longMessage?: string; message?: string }>;
  message?: string;
};

function getSignInError(error: unknown): ClerkSignInError {
  if (typeof error !== "object" || error === null) return {};
  const record = error as Record<string, unknown>;
  const errors = Array.isArray(record.errors)
    ? record.errors.flatMap((item) => {
        if (typeof item !== "object" || item === null) return [];
        const value = item as Record<string, unknown>;
        return [{
          code: typeof value.code === "string" ? value.code : undefined,
          longMessage: typeof value.longMessage === "string" ? value.longMessage : undefined,
          message: typeof value.message === "string" ? value.message : undefined,
        }];
      })
    : undefined;
  return {
    errors,
    message: typeof record.message === "string" ? record.message : undefined,
  };
}

export default function SignInPage() {
  const { dict } = useI18n();
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { setActive, client } = useClerk();
  const router = useRouter();
  const redirected = useRef(false);

  useEffect(() => {
    if (isUserLoaded && isSignedIn && !redirected.current) {
      redirected.current = true;
      router.replace("/");
    }
  }, [isUserLoaded, isSignedIn, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!client?.signIn) {
        throw new Error("Clerk is not available. Please try again.");
      }

      const result = await client.signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/");
        return;
      }

      setError(`${dict.signIn.unexpectedState}: ${result.status}`);
    } catch (caught: unknown) {
      const clerkError = getSignInError(caught);
      const firstError = clerkError.errors?.[0];
      if (firstError?.code === "session_exists") {
        router.replace("/");
        return;
      }
      setError(
        firstError?.longMessage ??
          firstError?.message ??
          clerkError.message ??
          dict.signIn.couldntSignIn,
      );
    } finally {
      setLoading(false);
    }
  }

  if (!isUserLoaded) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-[#1f3d36]" aria-label={dict.signIn.loading}>
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-[#2b4d44] px-10 py-8 shadow-2xl">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[#c8f5a8] text-[#1f3d36]">
            <LineChart aria-hidden="true" className="size-6" />
          </span>
          <p className="text-sm text-[#d7e5dc]">{dict.signIn.loading}</p>
          <span className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
            <span className="block h-full w-1/2 animate-pulse rounded-full bg-[#c8f5a8] motion-reduce:animate-none" />
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="relative isolate flex min-h-svh items-center justify-center overflow-hidden px-4 py-8 sm:px-8 lg:py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-36 -top-44 size-[34rem] rounded-full bg-[#adc5b7]/10 blur-3xl" />
        <div className="absolute -bottom-48 -left-40 size-[34rem] rounded-full bg-[#c8f5a8]/[0.07] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(rgba(200,245,168,0.26)_0.7px,transparent_0.8px)] [background-size:22px_22px] [mask-image:linear-gradient(135deg,#000,transparent_70%)]" />
      </div>

      <div className="absolute right-4 top-4 z-10 sm:right-8 sm:top-7">
        <LanguageSelector />
      </div>

      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/[0.11] bg-[#17342d]/80 shadow-[0_32px_100px_rgba(5,22,17,0.35)] backdrop-blur-xl lg:min-h-[650px] lg:grid-cols-[1.06fr_0.94fr]">
        <section className="relative flex flex-col justify-between overflow-hidden border-b border-white/10 p-7 sm:p-10 lg:border-b-0 lg:border-r lg:p-14">
          <div aria-hidden="true" className="absolute -right-16 top-20 size-80 rounded-full border border-[#c8f5a8]/[0.08]" />
          <div aria-hidden="true" className="absolute -right-4 top-32 size-56 rounded-full border border-[#c8f5a8]/[0.08]" />

          <div className="relative z-[1]">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-[#c8f5a8] text-[#1f3d36] shadow-[0_8px_28px_rgba(200,245,168,0.18)]">
                <LineChart aria-hidden="true" className="size-5" strokeWidth={2} />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold tracking-tight text-[#f2f5ef]">Alphaca</span>
                <span className="block text-sm font-medium text-[#adc5b7]">Capital</span>
              </span>
              <span className="ml-2 hidden h-px flex-1 bg-gradient-to-r from-white/15 to-transparent sm:block" />
            </div>

            <div className="mt-12 max-w-xl sm:mt-20 lg:mt-24">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c8f5a8]/20 bg-[#c8f5a8]/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d5f2c2]">
                <span className="size-1.5 rounded-full bg-[#c8f5a8]" />
                {dict.signIn.liveSystem}
              </p>
              <h1 className="max-w-lg text-4xl font-medium leading-[1.08] tracking-[-0.045em] text-[#f2f5ef] sm:text-5xl lg:text-[3.5rem]">
                {dict.signIn.brandHeadline}
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-[#b4c8bc] sm:text-lg sm:leading-8">
                {dict.signIn.description}
              </p>
            </div>
          </div>

          <div className="relative z-[1] mt-12 grid gap-3 sm:grid-cols-3 lg:mt-16">
            {[dict.signIn.focusPortfolio, dict.signIn.focusStrategies, dict.signIn.focusRisk].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-3 py-3.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#c8f5a8]/10 text-[#c8f5a8]">
                  {index === 0 ? <LineChart aria-hidden="true" className="size-4" /> : index === 1 ? <ArrowRight aria-hidden="true" className="size-4" /> : <ShieldCheck aria-hidden="true" className="size-4" />}
                </span>
                <span className="text-xs font-medium text-[#d4e1d8]">{item}</span>
              </div>
            ))}
          </div>
          <p className="relative z-[1] mt-7 text-[11px] tracking-wide text-[#8da799]">
            © 2026 Alphaca Capital · {process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0"}
          </p>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-10 lg:p-14" aria-labelledby="signin-title">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <span className="mb-5 flex size-11 items-center justify-center rounded-2xl border border-[#c8f5a8]/20 bg-[#c8f5a8]/[0.08] text-[#c8f5a8]">
                <LockKeyhole aria-hidden="true" className="size-5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#adc5b7]">{dict.signIn.secureWorkspace}</p>
              <h2 id="signin-title" className="mt-2 text-2xl font-semibold tracking-tight text-[#f2f5ef] sm:text-3xl">{dict.signIn.signIn}</h2>
              <p className="mt-2 text-sm leading-6 text-[#b4c8bc]">{dict.signIn.formDescription}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.12em] text-[#d4e1d8]">{dict.signIn.email}</label>
                <div className="flex h-12 items-center gap-3 rounded-xl border border-white/[0.13] bg-[#102820]/65 px-4 transition-colors focus-within:border-[#c8f5a8]/55 focus-within:bg-[#102820]">
                  <Mail aria-hidden="true" className="size-4 shrink-0 text-[#91aa9b]" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    inputMode="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "signin-error" : undefined}
                    className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm text-[#f2f5ef] outline-none placeholder:text-[#80988b] focus:ring-0"
                    placeholder={dict.signIn.emailPlaceholder}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.12em] text-[#d4e1d8]">{dict.signIn.password}</label>
                <div className="flex h-12 items-center gap-3 rounded-xl border border-white/[0.13] bg-[#102820]/65 px-4 transition-colors focus-within:border-[#c8f5a8]/55 focus-within:bg-[#102820]">
                  <LockKeyhole aria-hidden="true" className="size-4 shrink-0 text-[#91aa9b]" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "signin-error" : undefined}
                    className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm text-[#f2f5ef] outline-none placeholder:text-[#80988b] focus:ring-0"
                    placeholder={dict.signIn.passwordPlaceholder}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? dict.signIn.hidePassword : dict.signIn.showPassword}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#adc5b7] transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    {showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
                  </button>
                </div>
              </div>

              <div id="clerk-captcha" />

              {error && (
                <div id="signin-error" role="alert" aria-live="assertive" className="rounded-xl border border-rose-300/20 bg-rose-300/[0.08] px-4 py-3 text-sm leading-5 text-rose-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#c8f5a8] px-5 py-3 text-sm font-semibold text-[#1f3d36] shadow-[0_10px_28px_rgba(200,245,168,0.12)] transition-colors hover:bg-[#d7fac0] disabled:cursor-wait disabled:opacity-65"
              >
                {loading ? (
                  <>
                    <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-[#1f3d36]/25 border-t-[#1f3d36] motion-reduce:animate-none" />
                    {dict.signIn.entering}
                  </>
                ) : (
                  <>
                    {dict.signIn.signIn}
                    <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 flex items-start gap-3 border-t border-white/[0.09] pt-5">
              <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#adc5b7]" />
              <p className="text-xs leading-5 text-[#9db4a7]">{dict.signIn.securityNote}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
