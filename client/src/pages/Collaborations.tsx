import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import Layout from "../components/Layout";

export default function Collaborations() {
  const [collabs, setCollabs] = useState<{ asCollaborator: any[]; asOwner: any[] }>({
    asCollaborator: [],
    asOwner: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCollaborations()
      .then(setCollabs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const all = [
    ...collabs.asOwner.map((c) => ({ ...c, role_label: `Owner (with ${c.collaborator_name})` })),
    ...collabs.asCollaborator.map((c) => ({ ...c, role_label: `Collaborator (with ${c.owner_name})` })),
  ];

  const active = all.filter((c) => c.project_status === "active");
  const past = all.filter((c) => c.project_status !== "active");

  return (
    <Layout>
      <h1 className="text-xl font-semibold text-gray-900">Collaborations</h1>
      <p className="mt-1 text-sm text-gray-500">Your active and past project collaborations.</p>

      {loading ? (
        <p className="mt-8 text-sm text-gray-400">Loading...</p>
      ) : all.length === 0 ? (
        <p className="mt-8 text-sm text-gray-400">No collaborations yet. Browse projects or post your own.</p>
      ) : (
        <>
          {active.length > 0 && (
            <section className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Active</h2>
              <div className="mt-3 space-y-3">
                {active.map((c) => (
                  <CollabCard key={c.collaboration_id} collab={c} />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Past</h2>
              <div className="mt-3 space-y-3">
                {past.map((c) => (
                  <CollabCard key={c.collaboration_id} collab={c} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </Layout>
  );
}

function CollabCard({ collab }: { collab: any }) {
  const statusStyles: Record<string, string> = {
    active: "bg-green-50 text-green-700",
    completed: "bg-gray-100 text-gray-600",
    dropped: "bg-red-50 text-red-600",
  };

  return (
    <Link
      to={`/collaborations/${collab.collaboration_id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">{collab.project_name}</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {collab.role_label} &middot; {collab.hours_per_week} hrs/week &middot; {collab.goal}
          </p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[collab.project_status] || ""}`}>
          {collab.project_status}
        </span>
      </div>
    </Link>
  );
}
