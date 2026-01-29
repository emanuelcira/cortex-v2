import { useEffect, useState, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import Layout from "../components/Layout";

export default function CollaborationDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collab, setCollab] = useState<any>(null);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ completed: "", blocked: "", next_steps: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.getCollaboration(Number(id)),
      api.getCheckins(Number(id)),
    ])
      .then(([c, ch]) => {
        setCollab(c);
        setCheckins(ch);
      })
      .catch(() => navigate("/collaborations"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCheckin = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.completed || !form.next_steps) return;
    setSubmitting(true);
    try {
      await api.submitCheckin(Number(id), form);
      const ch = await api.getCheckins(Number(id));
      setCheckins(ch);
      setForm({ completed: "", blocked: "", next_steps: "" });
      setShowForm(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateProjectStatus = async (status: string) => {
    await api.updateProject(collab.project_id, { status });
    setCollab((c: any) => ({ ...c, project_status: status }));
  };

  if (loading) {
    return <Layout><p className="text-sm text-gray-400">Loading...</p></Layout>;
  }

  if (!collab) {
    return <Layout><p className="text-sm text-gray-400">Collaboration not found.</p></Layout>;
  }

  const isOwner = collab.owner_id === user?.id;

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{collab.project_name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {collab.owner_name} + {collab.collaborator_name} &middot; {collab.project_type} &middot; {collab.goal}
          </p>
        </div>

        {/* Project Info */}
        <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-white p-5 sm:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Status</p>
            <p className="mt-0.5 text-sm font-medium text-gray-900">{collab.project_status}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Commitment</p>
            <p className="mt-0.5 text-sm font-medium text-gray-900">{collab.hours_per_week} hrs/week</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Duration</p>
            <p className="mt-0.5 text-sm font-medium text-gray-900">{collab.duration?.replace(/_/g, " ")}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Location</p>
            <p className="mt-0.5 text-sm font-medium text-gray-900">{collab.location}</p>
          </div>
        </div>

        {/* Owner Controls */}
        {isOwner && collab.project_status === "active" && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => updateProjectStatus("completed")}
              className="rounded-lg border border-green-300 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50"
            >
              Mark Completed
            </button>
            <button
              onClick={() => updateProjectStatus("dropped")}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Drop Project
            </button>
          </div>
        )}

        {/* Weekly Check-ins */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Weekly Check-ins
            </h2>
            {collab.project_status === "active" && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                New check-in
              </button>
            )}
          </div>

          {/* Check-in Form */}
          {showForm && (
            <form onSubmit={handleCheckin} className="mt-4 space-y-3 rounded-xl border border-gray-200 bg-white p-5">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">What was completed?</span>
                <textarea
                  value={form.completed}
                  onChange={(e) => setForm((f) => ({ ...f, completed: e.target.value }))}
                  required
                  rows={2}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">What is blocked?</span>
                <textarea
                  value={form.blocked}
                  onChange={(e) => setForm((f) => ({ ...f, blocked: e.target.value }))}
                  rows={2}
                  placeholder="Nothing blocked (optional)"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">What's next?</span>
                <textarea
                  value={form.next_steps}
                  onChange={(e) => setForm((f) => ({ ...f, next_steps: e.target.value }))}
                  required
                  rows={2}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit check-in"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Check-in History */}
          {checkins.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">No check-ins yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {checkins.map((ch) => (
                <div key={ch.id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{ch.user_name}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(ch.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    <CheckinField label="Completed" value={ch.completed} />
                    {ch.blocked && <CheckinField label="Blocked" value={ch.blocked} />}
                    <CheckinField label="Next" value={ch.next_steps} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function CheckinField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-semibold text-gray-400">{label}: </span>
      <span className="text-sm text-gray-700">{value}</span>
    </div>
  );
}
