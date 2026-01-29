import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-gray-100">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="text-lg font-semibold tracking-tight">cortex</span>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Find people who build.
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Post a project. Get matched with the right collaborator. Ship together.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            No networking. No chatting. Execution only.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-block rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Start building
          </Link>
        </div>

        <div className="mt-20 grid max-w-3xl gap-8 sm:grid-cols-3">
          <div>
            <h3 className="font-semibold text-gray-900">Post a project</h3>
            <p className="mt-1 text-sm text-gray-500">
              Define what you're building, who you need, and the time commitment.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Get matched</h3>
            <p className="mt-1 text-sm text-gray-500">
              See ranked matches based on skills, timezone, and project fit.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Ship together</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commit to working together with weekly check-ins and accountability.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
