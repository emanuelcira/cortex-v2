import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import {
  PROJECT_TYPES, STAGES, PROJECT_ROLES, SKILLS,
  DURATIONS, GOALS, LOCATIONS,
} from "../lib/constants";
import Layout from "../components/Layout";

export default function CreateProject() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    project_type: "",
    stage: "",
    roles_needed: [] as string[],
    skills_needed: [] as string[],
    hours_per_week: 10,
    duration: "",
    goal: "",
    location: "",
  });

  const toggleArrayField = (field: "roles_needed" | "skills_needed", value: string) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((v) => v !== value)
        : [...f[field], value],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.project_type || !form.stage || !form.roles_needed.length || !form.duration || !form.goal || !form.location) {
      setError("All fields are required");
      return;
    }
    setSaving(true);
    try {
      const { id } = await api.createProject(form);
      navigate(`/projects/${id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-xl font-semibold text-gray-900">Post a Project</h1>
        <p className="mt-1 text-sm text-gray-500">Define your project to find the right collaborators.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-xl border border-gray-200 bg-white p-6">
          {error && <p className="text-sm text-red-600">{error}</p>}

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Project Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              placeholder="e.g. Invoice SaaS MVP"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </label>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700">Project Type</legend>
            <div className="mt-2 flex gap-2">
              {PROJECT_TYPES.map((t) => (
                <ToggleButton
                  key={t.value}
                  active={form.project_type === t.value}
                  onClick={() => setForm((f) => ({ ...f, project_type: t.value }))}
                >
                  {t.label}
                </ToggleButton>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700">Stage</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <ToggleButton
                  key={s.value}
                  active={form.stage === s.value}
                  onClick={() => setForm((f) => ({ ...f, stage: s.value }))}
                >
                  {s.label}
                </ToggleButton>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700">Roles Needed</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {PROJECT_ROLES.map((r) => (
                <ToggleButton
                  key={r.value}
                  active={form.roles_needed.includes(r.value)}
                  onClick={() => toggleArrayField("roles_needed", r.value)}
                >
                  {r.label}
                </ToggleButton>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700">Skills Needed</legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SKILLS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleArrayField("skills_needed", s)}
                  className={`rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                    form.skills_needed.includes(s)
                      ? "border-accent-500 bg-accent-50 text-accent-700"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Time Commitment (hours/week)</span>
            <input
              type="number"
              min={1}
              max={80}
              value={form.hours_per_week}
              onChange={(e) => setForm((f) => ({ ...f, hours_per_week: Number(e.target.value) }))}
              required
              className="mt-1 block w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </label>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700">Duration</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <ToggleButton
                  key={d.value}
                  active={form.duration === d.value}
                  onClick={() => setForm((f) => ({ ...f, duration: d.value }))}
                >
                  {d.label}
                </ToggleButton>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700">Goal</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <ToggleButton
                  key={g.value}
                  active={form.goal === g.value}
                  onClick={() => setForm((f) => ({ ...f, goal: g.value }))}
                >
                  {g.label}
                </ToggleButton>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700">Location</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {LOCATIONS.map((l) => (
                <ToggleButton
                  key={l.value}
                  active={form.location === l.value}
                  onClick={() => setForm((f) => ({ ...f, location: l.value }))}
                >
                  {l.label}
                </ToggleButton>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={saving}
            className="mt-2 rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Posting..." : "Post project"}
          </button>
        </form>
      </div>
    </Layout>
  );
}

function ToggleButton({
  active, onClick, children,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-accent-500 bg-accent-50 text-accent-700"
          : "border-gray-300 text-gray-600 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}
