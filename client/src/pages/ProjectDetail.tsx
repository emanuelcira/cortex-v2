import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import Layout from "../components/Layout";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingTo, setSendingTo] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const isOwner = project?.owner_id === user?.id;

  useEffect(() => {
    if (!id) return;
    api.getProject(Number(id))
      .then((p) => {
        setProject(p);
        if (p.owner_id === user?.id && p.status === "open") {
          api.getMatches(Number(id)).then(setMatches).catch(() => {});
        }
      })
      .catch(() => navigate("/projects"))
      .finally(() => setLoading(false));
  }, [id, user?.id]);

  const sendRequest = async (recipientId: number) => {
    try {
      await api.sendRequest({
        project_id: Number(id),
        recipient_id: recipientId,
        message,
      });
      setMatches((m) => m.filter((u) => u.id !== recipientId));
      setMessage("");
      setSendingTo(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const updateStatus = async (status: string) => {
    await api.updateProject(Number(id), { status });
    setProject((p: any) => ({ ...p, status }));
  };

  if (loading) {
    return <Layout><p className="text-sm text-gray-400">Loading...</p></Layout>;
  }

  if (!project) {
    return <Layout><p className="text-sm text-gray-400">Project not found.</p></Layout>;
  }

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              by {project.owner_name} &middot; {project.project_type} &middot;{" "}
              {project.stage?.replace(/_/g, " ")}
            </p>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-white p-5 sm:grid-cols-4">
          <Detail label="Goal" value={project.goal} />
          <Detail label="Commitment" value={`${project.hours_per_week} hrs/week`} />
          <Detail label="Duration" value={project.duration?.replace(/_/g, " ")} />
          <Detail label="Location" value={project.location} />
        </div>

        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Roles Needed</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {project.roles_needed.map((r: string) => (
                <span key={r} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{r}</span>
              ))}
            </div>
          </div>
          {project.skills_needed.length > 0 && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Skills</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {project.skills_needed.map((s: string) => (
                  <span key={s} className="rounded-md bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent-700">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {project.collaborators?.length > 0 && (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Collaborators</span>
            <div className="mt-2 space-y-2">
              {project.collaborators.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{c.name}</span>
                    <span className="ml-2 text-xs text-gray-500">{c.role}</span>
                  </div>
                  <span className={`text-xs font-medium ${c.status === "active" ? "text-green-600" : "text-gray-400"}`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isOwner && (
          <div className="mt-4 flex gap-2">
            {project.status === "open" && (
              <button onClick={() => updateStatus("active")} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Mark Active
              </button>
            )}
            {(project.status === "open" || project.status === "active") && (
              <>
                <button onClick={() => updateStatus("completed")} className="rounded-lg border border-green-300 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50">
                  Mark Completed
                </button>
                <button onClick={() => updateStatus("dropped")} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
                  Drop
                </button>
              </>
            )}
          </div>
        )}

        {isOwner && project.status === "open" && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Matched Collaborators
            </h2>
            {matches.length === 0 ? (
              <p className="mt-3 text-sm text-gray-400">No matches found yet. More users need to sign up.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {matches.map((m) => (
                  <div key={m.id} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {m.name}
                          <span className="ml-2 text-xs text-gray-500">{m.role}</span>
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {m.availability} hrs/week &middot; {m.timezone?.replace(/_/g, " ")} &middot; {m.score}% match
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {m.skills.slice(0, 8).map((s: string) => (
                            <span
                              key={s}
                              className={`rounded-md px-1.5 py-0.5 text-xs ${
                                project.skills_needed.includes(s)
                                  ? "bg-accent-50 font-medium text-accent-700"
                                  : "bg-gray-50 text-gray-500"
                              }`}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        {sendingTo === m.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Brief message (optional)"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              className="w-48 rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-accent-500 focus:outline-none"
                            />
                            <button
                              onClick={() => sendRequest(m.id)}
                              className="rounded-lg bg-gray-900 px-3 py-1 text-xs font-medium text-white hover:bg-gray-800"
                            >
                              Send
                            </button>
                            <button
                              onClick={() => { setSendingTo(null); setMessage(""); }}
                              className="text-xs text-gray-400 hover:text-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSendingTo(m.id)}
                            className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
                          >
                            Request
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "bg-blue-50 text-blue-700",
    active: "bg-green-50 text-green-700",
    completed: "bg-gray-100 text-gray-600",
    dropped: "bg-red-50 text-red-600",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.open}`}>
      {status}
    </span>
  );
}
