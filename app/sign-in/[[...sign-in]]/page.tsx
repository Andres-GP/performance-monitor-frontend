"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import {
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { useI18n } from "@/lib/i18n/context";

export default function SignInPage() {
  const { dict } = useI18n();
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { setActive, client } = useClerk();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoaded && isSignedIn) {
      router.replace("/");
    }
  }, [isUserLoaded, isSignedIn, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isUserLoaded) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <svg
          className="animate-spin h-8 w-8 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!client || !client.signIn) {
        throw new Error("El cliente de Clerk no está disponible.");
      }

      const result = await client.signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/");
        return;
      }

      setError(`Estado inesperado: ${result.status}. Contacta soporte.`);
    } catch (err: any) {
      console.error("❌ Error en login:", err);
      if (err?.errors?.[0]?.code === "session_exists") {
        router.replace("/");
        return;
      }
      const message =
        err?.errors?.[0]?.longMessage ??
        err?.errors?.[0]?.message ??
        err?.message ??
        "Error al iniciar sesión. Verifica tus datos.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans antialiased selection:bg-white/10">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIyMjgiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyek0zNiAxNHYySDI0di0yaDEyek0xOCAzNHYySDZ2LTJoMTJ6TTE4IDI0djJINnYtMmgxMnpNMTggMTR2Mkg2di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
      <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-white/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-white/5 rounded-full blur-3xl animate-pulse delay-700"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute top-[15%] right-[20%] w-1 h-1 bg-white/40 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)] animate-ping"></div>
      <div className="absolute bottom-[25%] left-[10%] w-1.5 h-1.5 bg-white/30 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)] animate-ping delay-300"></div>
      <div className="absolute top-[40%] right-[5%] w-1 h-1 bg-white/20 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)] animate-ping delay-700"></div>

      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#121212] border border-white/5 rounded-full px-3 py-1.5 mb-4 shadow-lg shadow-black/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400/80"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-medium tracking-wider text-gray-400 uppercase">
              {dict.signIn.liveSystem}
            </span>
          </div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/20"></div>
            <span className="text-3xl font-light text-white tracking-tight">
              📊
            </span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/20"></div>
          </div>
          <h1 className="text-2xl font-light text-white tracking-tight">
            Performance<span className="font-bold">Monitor</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1.5 font-light tracking-wide">
            {dict.signIn.description}
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-2xl blur-sm"></div>
          <div className="relative bg-[#0D0D0D]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl shadow-black/70">
            <form onSubmit={handleSubmit} className="w-full">
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5"
                >
                  {dict.signIn.email}
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3.5 group-focus-within:border-white/20 transition-all duration-300 shadow-lg shadow-black/30">
                    <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white/70 transition-colors" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-0 pl-8 text-sm text-white placeholder:text-gray-500 focus:ring-0 focus:outline-none"
                      placeholder={dict.signIn.email}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider"
                  >
                    {dict.signIn.password}
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3.5 group-focus-within:border-white/20 transition-all duration-300 shadow-lg shadow-black/30">
                    <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white/70 transition-colors" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-0 pl-8 pr-10 text-sm text-white placeholder:text-gray-500 focus:ring-0 focus:outline-none"
                      placeholder={dict.signIn.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none"
                      aria-label={
                        showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5 cursor-pointer" />
                      ) : (
                        <EyeIcon className="w-5 h-5 cursor-pointer" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div id="clerk-captcha" />

              {error && (
                <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-xs font-medium text-center">
                    {error}
                  </p>
                </div>
              )}

              <div className="relative group pt-2">
                <div className="pointer-events-none absolute -inset-0.5 bg-gradient-to-r from-white/10 to-white/5 rounded-xl blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer relative w-full bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-medium py-4 rounded-xl transition-all duration-300 shadow-lg shadow-black/30 flex items-center justify-center gap-3 group overflow-hidden border border-white/5"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>{dict.signIn.entering}</span>
                    </div>
                  ) : (
                    <>
                      <span>{dict.signIn.signIn}</span>
                      <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-[10px] text-gray-500 font-mono tracking-widest">
            © 2026 PERFORMANCE MONITOR •{" "}
            {process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0"}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-1 h-1 rounded-full bg-gray-600/30"></span>
            <span className="w-1 h-1 rounded-full bg-gray-600/30"></span>
            <span className="text-[9px] text-green-400/50 tracking-widest uppercase">
              ● {dict.signIn.onLine}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-600/30"></span>
          </div>
        </div>
      </div>
    </main>
  );
}
