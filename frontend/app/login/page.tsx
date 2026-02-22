import { AppAnchorButton, AppPanel } from "@/lib/ui";
import { getApiBaseUrl } from "@/lib/env";

export default function LoginPage() {
  const apiBaseUrl = getApiBaseUrl();
  const loginUrl = `${apiBaseUrl}/auth/google/redirect`;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-100 px-6 py-12 dark:bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(24,24,27,0.08),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(24,24,27,0.05),transparent_40%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.08),transparent_40%)]" />

      <div className="auth-card-reveal relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-zinc-300/70 bg-white/80 shadow-[0_40px_140px_-70px_rgba(24,24,27,0.28)] backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.04] dark:shadow-[0_40px_140px_-70px_rgba(0,0,0,0.8)] md:grid-cols-2">
        <section className="hidden border-r border-zinc-200/70 bg-zinc-100/70 p-10 md:flex md:flex-col md:justify-between dark:border-white/10 dark:bg-white/[0.03]">
          <div>
            <p className="inline-flex rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-white/20 dark:text-zinc-200">
              Laranext Auth
            </p>
            <h1 className="mt-5 text-3xl font-semibold leading-tight text-zinc-900 dark:text-white">
              Sign in untuk akses dashboard SaaS kamu.
            </h1>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
              OAuth Google terintegrasi dengan session cookie httpOnly, rate limit, dan
              monitoring endpoint auth.
            </p>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Fast setup, production-oriented auth flow.
          </p>
        </section>

        <section className="p-8 md:p-10">
          <AppPanel className="border-white/15 bg-white/[0.97] p-8 shadow-none">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Welcome Back
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-900">Sign in</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Continue with your Google account.
            </p>

            <AppAnchorButton
              href={loginUrl}
              variant="outline"
              className="mt-7 w-full rounded-xl border-zinc-300 bg-white px-4 py-3 text-zinc-800 hover:bg-zinc-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="mr-2 h-4 w-4"
                aria-hidden="true"
              >
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.3 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.2-7.9l-6.6 5.1C9.6 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.7-2.5 4.9-4.9 6.3l6.2 5.2C39.8 36.6 44 30.8 44 24c0-1.3-.1-2.4-.4-3.5z" />
              </svg>
              Continue with Google
            </AppAnchorButton>

            <p className="mt-6 text-center text-xs leading-relaxed text-zinc-400">
              Dengan login, kamu setuju melanjutkan ke dashboard yang dilindungi OAuth
              dan cookie session aman.
            </p>
          </AppPanel>
        </section>
      </div>
    </div>
  );
}
