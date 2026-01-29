import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { ROLES, ROLE_LABELS, SKILLS, TIMEZONES, WORK_PREFERENCES } from "../lib/constants";
import Layout from "../components/Layout";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(!user?.profile_complete);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    role: user?.role || "",
    skills: user?.skills || [],
    availability: user?.availability || 10,
    timezone: user?.timezone || "",
    portfolio_github: user?.portfolio_github || "",
    portfolio_figma: user?.portfolio_figma || "",
    portfolio_website: user?.portfolio_website || "",
    work_preference: user?.work_preference || "",
  });

  const toggleSkill = (skill: string) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter((s) => s !== skill)
        : [...f.skills, skill],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.updateProfile(form);
      await refreshUser();
      setEditing(false);
      if (!user?.profile_complete) navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Edit
            </button>
          </div>
          <div className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-6">
            <Row label="Name" value={user?.name} />
            <Row label="Role" value={ROLE_LABELS[user?.role || ""] || user?.role} />
            <Row label="Skills" value={user?.skills?.join(", ") || "None"} />
            <Row label="Availability" value={`${user?.availability} hrs/week`} />
            <Row label="Timezone" value={user?.timezone} />
            <Row label="Wants to work on" value={user?.work_preference} />
            {user?.portfolio_github && <Row label="GitHub" value={user.portfolio_github} link />}
            {user?.portfolio_figma && <Row label="Figma" value={user.portfolio_figma} link />}
            {user?.portfolio_website && <Row label="Website" value={user.portfolio_website} link />}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-xl font-semibold text-gray-900">
          {user?.profile_complete ? "Edit Profile" : "Complete Your Profile"}
        </h1>
        {!user?.profile_complete && (
          <p className="mt-1 text-sm text-gray-500">Fill in your details to start finding collaborators.</p>
        )}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-xl border border-gray-200 bg-white p-6">
          {error && <p className="text-sm text-red-600">{error}</p>}

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </label>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700">Primary Role</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: r }))}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    form.role === r
                      ? "border-accent-500 bg-accent-50 text-accent-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700">Skills</legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SKILLS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className={`rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                    form.skills.includes(s)
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
            <span className="text-sm font-medium text-gray-700">Availability (hours/week)</span>
            <input
              type="number"
              min={1}
              max={80}
              value={form.availability}
              onChange={(e) => setForm((f) => ({ ...f, availability: Number(e.target.value) }))}
              required
              className="mt-1 block w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Timezone</span>
            <select
              value={form.timezone}
              onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            >
              <option value="">Select timezone</option>
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
              ))}
            </select>
          </label>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700">What do you want to work on?</legend>
            <div className="mt-2 flex gap-2">
              {WORK_PREFERENCES.map((wp) => (
                <button
                  key={wp.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, work_preference: wp.value }))}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    form.work_preference === wp.value
                      ? "border-accent-500 bg-accent-50 text-accent-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {wp.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="space-y-3 border-t border-gray-100 pt-5">
            <p className="text-sm font-medium text-gray-700">Portfolio Links</p>
            <input
              type="url"
              placeholder="GitHub URL"
              value={form.portfolio_github}
              onChange={(e) => setForm((f) => ({ ...f, portfolio_github: e.target.value }))}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
            <input
              type="url"
              placeholder="Figma URL"
              value={form.portfolio_figma}
              onChange={(e) => setForm((f) => ({ ...f, portfolio_figma: e.target.value }))}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
            <input
              type="url"
              placeholder="Website URL"
              value={form.portfolio_website}
              onChange={(e) => setForm((f) => ({ ...f, portfolio_website: e.target.value }))}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save profile"}
            </button>
            {user?.profile_complete && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </Layout>
  );
}

function Row({ label, value, link }: { label: string; value?: string; link?: boolean }) {
  return (
    <div className="flex justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-gray-500">{label}</span>
      {link && value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent-600 hover:text-accent-700">
          {value}
        </a>
      ) : (
        <span className="text-sm font-medium text-gray-900">{value || "\u2014"}</span>
      )}
    </div>
  );
}
