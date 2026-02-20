import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import Layout from "../components/Layout";
import {
  PROJECT_TYPES, STAGES, PROJECT_ROLES, SKILLS,
  DURATIONS, GOALS, LOCATIONS,
} from "../lib/constants";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Send request (non-owner)
  const [sendingTo, setSendingTo] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);

  const isOwner = project?.owner_id === user?.id;

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.getProject(Number(id)),
      api.getOutgoingRequests(),
    ])
      .then(([p, outgoing]) => {
        setProject(p);
        // Check if user already has a request for this project
        const found = outgoing.find((r: any) => r.project_id === p.id);
        if (found) setExistingRequest(found);

        if (p.owner_id === user?.id && p.status === "open") {
          api.getMatches(Number(id)).then(setMatches).catch(() => { });
        }
      })
      .catch(() => navigate("/projects"))
      .finally(() => setLoading(false));
  }, [id, user?.id]);

  const openEditForm = () => {
    setEditForm({
      name: project.name,
      project_type: project.project_type,
      stage: project.stage,
      roles_needed: project.roles_needed,
      skills_needed: project.skills_needed,
      hours_per_week: project.hours_per_week,
      duration: project.duration,
      goal: project.goal,
      location: project.location,
    });
    setEditing(true);
  };

  const toggleEditArray = (field: "roles_needed" | "skills_needed", value: string) => {
    setEditForm((f: any) => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((v: string) => v !== value)
        : [...f[field], value],
    }));
  };

  const saveEdit = async () => {
    if (!editForm.name || !editForm.project_type || !editForm.stage ||
      !editForm.roles_needed.length || !editForm.hours_per_week ||
      !editForm.duration || !editForm.goal || !editForm.location) return;
    setSaving(true);
    try {
      await api.updateProject(Number(id), editForm);
      const updated = await api.getProject(Number(id));
      setProject(updated);
      setEditing(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const sendRequest = async (recipientId: number) => {
    try {
      await api.sendRequest({ project_id: Number(id), message });
      setMatches((m) => m.filter((u) => u.id !== recipientId));
      setMessage("");
      setSendingTo(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const sendCollabRequest = async () => {
    setSendingRequest(true);
    try {
      await api.sendRequest({ project_id: Number(id), message });
      setRequestSent(true);
      setMessage("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingRequest(false);
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

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              by {project.owner_name} &middot; {project.project_type} &middot;{" "}
              {project.stage?.replace(/_/g, " ")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={project.status} />
            {isOwner && !editing && (project.status === "open" || project.status === "active") && (
              <button
                onClick={openEditForm}
                className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Inline Edit Form */}
        {editing && editForm && (
          <div className="mt-5 rounded-xl border border-accent-200 bg-accent-50 p-5 space-y-5">
            <p className="text-sm font-semibold text-accent-900">Editing project</p>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Project Name</span>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm((f: any) => ({ ...f, name: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </label>

            <fieldset>
              <legend className="text-sm font-medium text-gray-700">Project Type</legend>
              <div className="mt-2 flex gap-2">
                {PROJECT_TYPES.map((t) => (
                  <ToggleButton key={t.value} active={editForm.project_type === t.value}
                    onClick={() => setEditForm((f: any) => ({ ...f, project_type: t.value }))}>
                    {t.label}
                  </ToggleButton>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium text-gray-700">Stage</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {STAGES.map((s) => (
                  <ToggleButton key={s.value} active={editForm.stage === s.value}
                    onClick={() => setEditForm((f: any) => ({ ...f, stage: s.value }))}>
                    {s.label}
                  </ToggleButton>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium text-gray-700">Roles Needed</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {PROJECT_ROLES.map((r) => (
                  <ToggleButton key={r.value} active={editForm.roles_needed.includes(r.value)}
                    onClick={() => toggleEditArray("roles_needed", r.value)}>
                    {r.label}
                  </ToggleButton>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium text-gray-700">Skills Needed</legend>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SKILLS.map((s) => (
                  <button key={s} type="button"
                    onClick={() => toggleEditArray("skills_needed", s)}
                    className={`rounded-md border px-2 py-1 text-xs font-medium transition-colors ${editForm.skills_needed.includes(s)
                        ? "border-accent-500 bg-accent-50 text-accent-700"
                        : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                      }`}>
                    {s}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Time Commitment (hrs/week)</span>
              <input type="number" min={1} max={80} value={editForm.hours_per_week}
                onChange={(e) => setEditForm((f: any) => ({ ...f, hours_per_week: Number(e.target.value) }))}
                className="mt-1 block w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </label>

            <fieldset>
              <legend className="text-sm font-medium text-gray-700">Duration</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {DURATIONS.map((d) => (
                  <ToggleButton key={d.value} active={editForm.duration === d.value}
                    onClick={() => setEditForm((f: any) => ({ ...f, duration: d.value }))}>
                    {d.label}
                  </ToggleButton>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium text-gray-700">Goal</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {GOALS.map((g) => (
                  <ToggleButton key={g.value} active={editForm.goal === g.value}
                    onClick={() => setEditForm((f: any) => ({ ...f, goal: g.value }))}>
                    {g.label}
                  </ToggleButton>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium text-gray-700">Location</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {LOCATIONS.map((l) => (
                  <ToggleButton key={l.value} active={editForm.location === l.value}
                    onClick={() => setEditForm((f: any) => ({ ...f, location: l.value }))}>
                    {l.label}
                  </ToggleButton>
                ))}
              </div>
            </fieldset>

            <div className="flex gap-2 pt-1">
              <button
                onClick={saveEdit}
                disabled={saving}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!editing && (
          <>
            {/* Project Details */}
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

            {/* Owner status controls */}
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

            {/* Owner: matched collaborators */}
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
                                <span key={s}
                                  className={`rounded-md px-1.5 py-0.5 text-xs ${project.skills_needed.includes(s)
                                      ? "bg-accent-50 font-medium text-accent-700"
                                      : "bg-gray-50 text-gray-500"
                                    }`}>
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
                                <button onClick={() => sendRequest(m.id)}
                                  className="rounded-lg bg-gray-900 px-3 py-1 text-xs font-medium text-white hover:bg-gray-800">
                                  Send
                                </button>
                                <button onClick={() => { setSendingTo(null); setMessage(""); }}
                                  className="text-xs text-gray-400 hover:text-gray-600">
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => setSendingTo(m.id)}
                                className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800">
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

            {/* Non-owner: send request */}
            {!isOwner && project.status === "open" && (
              <div className="mt-8">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Interested in collaborating?
                </h2>
                {existingRequest ? (
                  <div className={`mt-3 rounded-xl border p-4 ${existingRequest.status === "accepted"
                      ? "border-green-200 bg-green-50"
                      : existingRequest.status === "declined"
                        ? "border-gray-200 bg-gray-50"
                        : "border-yellow-200 bg-yellow-50"
                    }`}>
                    {existingRequest.status === "pending" && (
                      <>
                        <p className="text-sm font-medium text-yellow-900">Request sent — waiting for response</p>
                        <p className="mt-1 text-xs text-yellow-700">
                          {project.owner_name} will review your request and get back to you.
                        </p>
                      </>
                    )}
                    {existingRequest.status === "accepted" && (
                      <>
                        <p className="text-sm font-medium text-green-900">Request accepted!</p>
                        <p className="mt-1 text-xs text-green-700">You're now collaborating on this project.</p>
                      </>
                    )}
                    {existingRequest.status === "declined" && (
                      <>
                        <p className="text-sm font-medium text-gray-700">Request declined</p>
                        <p className="mt-1 text-xs text-gray-500">{project.owner_name} wasn't able to accept at this time.</p>
                      </>
                    )}
                  </div>
                ) : requestSent ? (
                  <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="text-sm font-medium text-green-900">Request sent!</p>
                    <p className="mt-1 text-xs text-green-700">
                      {project.owner_name} will review your request and respond soon.
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-sm text-gray-600 mb-3">
                      Send a collaboration request to {project.owner_name}
                    </p>
                    <textarea
                      placeholder="Why are you interested in this project? (optional)"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none"
                      rows={3}
                    />
                    <button
                      onClick={sendCollabRequest}
                      disabled={sendingRequest}
                      className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                      {sendingRequest ? "Sending..." : "Request to Collaborate"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${active
          ? "border-accent-500 bg-accent-50 text-accent-700"
          : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
        }`}>
      {children}
    </button>
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
