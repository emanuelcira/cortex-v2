import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import Layout from "../components/Layout";

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects()
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Open Projects</h1>
          <p className="mt-1 text-sm text-gray-500">Browse projects looking for collaborators.</p>
        </div>
        <Link
          to="/projects/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Post a project
        </Link>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-gray-400">Loading...</p>
      ) : projects.length === 0 ? (
        <p className="mt-8 text-sm text-gray-400">No open projects yet. Be the first to post one.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              className="block rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{p.name}</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    by {p.owner_name} &middot; {p.project_type} &middot; {p.stage?.replace(/_/g, " ")}
                  </p>
                </div>
                <span className="rounded-full bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent-700">
                  {p.goal}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                <span>{p.hours_per_week} hrs/week</span>
                <span>{p.duration?.replace(/_/g, " ")}</span>
                <span>{p.location}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {p.roles_needed.map((r: string) => (
                  <span key={r} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {r}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
