import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      {/* Nav */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <span className="text-lg font-semibold tracking-tight">cortex</span>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-20 pb-24 px-6">
          {/* Subtle grid background */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 60% 30%, rgba(99,102,241,0.06) 0%, transparent 60%)",
            }}
          />

          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
              {/* Left: copy */}
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500 mb-6">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                  No social. No noise. Just execution.
                </div>
                <h1 className="text-5xl font-bold tracking-tight text-gray-900 leading-tight sm:text-6xl">
                  Find people<br />
                  <span className="text-indigo-600">who build.</span>
                </h1>
                <p className="mt-5 text-lg text-gray-500 leading-relaxed max-w-md">
                  Post a structured project, get deterministic matches based on skills, timezone, and availability. Ship together with weekly accountability.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    to="/register"
                    className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors shadow-sm"
                  >
                    Start building →
                  </Link>
                  <a href="#how-it-works" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                    See how it works
                  </a>
                </div>
              </div>

              {/* Right: mock match card */}
              <div className="mt-14 lg:mt-0 flex-shrink-0 w-full lg:w-80">
                <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Top match</span>
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">94% fit</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Alex Chen</p>
                        <p className="text-xs text-gray-500 mt-0.5">Full-Stack · 15 hrs/week · PST</p>
                      </div>
                      <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 flex-shrink-0">
                        A
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {["React", "Node.js", "TypeScript", "PostgreSQL"].map((s) => (
                        <span key={s} className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{s}</span>
                      ))}
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">+3</span>
                    </div>
                    <button className="mt-4 w-full rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700 transition-colors">
                      Send request
                    </button>
                  </div>

                  {/* Second card peek */}
                  <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between opacity-50">
                    <div>
                      <p className="text-xs font-semibold text-gray-700">Mia Torres</p>
                      <p className="text-xs text-gray-400">Designer · 10 hrs/week · CET</p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">87% fit</span>
                  </div>
                  <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between opacity-20">
                    <div>
                      <p className="text-xs font-semibold text-gray-700">Sam Park</p>
                      <p className="text-xs text-gray-400">Developer · 20 hrs/week · EST</p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">81% fit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t border-gray-100 bg-gray-50 py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">How it works</h2>
            <p className="mt-2 text-sm text-gray-500">Three steps. No fluff.</p>

            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              <Step
                number="1"
                title="Post a project"
                description="Define your project structure: type, stage, roles needed, skills, time commitment, and goal. No essays needed."
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />
              <Step
                number="2"
                title="Get matched"
                description="Our deterministic algorithm ranks candidates by skill overlap (40%), timezone proximity (30%), and project-type preference (30%)."
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              />
              <Step
                number="3"
                title="Ship together"
                description="Once matched, track progress with structured weekly check-ins: what's done, what's blocked, what's next."
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>
          </div>
        </section>

        {/* Why Cortex */}
        <section className="py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Why Cortex</h2>
            <p className="mt-2 text-sm text-gray-500">Built for people who want to ship, not network.</p>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <ValueProp
                title="No social overhead"
                description="No feeds. No DMs. No ratings. No profiles with follower counts. Just projects and collaborators."
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                }
              />
              <ValueProp
                title="Deterministic matching"
                description="No black-box AI recommendations. You see the exact match score and why — skills, timezone, preferences."
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />
              <ValueProp
                title="Built-in accountability"
                description="Weekly check-ins keep both parties aligned. Commitments are visible, not forgotten in a chat thread."
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-gray-100 bg-gray-50 py-20 px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Ready to find your collaborator?
            </h2>
            <p className="mt-4 text-gray-500">
              Post a project in minutes. Get matched the same day.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/register"
                className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors shadow-sm"
              >
                Create your account
              </Link>
              <Link
                to="/login"
                className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-6 px-6">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight text-gray-400">cortex</span>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

function Step({ number, title, description, icon }: {
  number: string; title: string; description: string; icon: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white flex-shrink-0">
          {icon}
        </div>
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Step {number}</span>
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function ValueProp({ title, description, icon }: {
  title: string; description: string; icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
