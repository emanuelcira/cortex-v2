import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import Layout from "../components/Layout";

export default function Dashboard() {
  const { user } = useAuth();
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [collabs, setCollabs] = useState<{ asCollaborator: any[]; asOwner: any[] }>({
    asCollaborator: [],
    asOwner: [],
  });

  useEffect(() => {
    api.getProjects(true).then(setMyProjects).catch(() => { });
    api.getIncomingRequests().then(setIncomingRequests).catch(() => { });
    api.getOutgoingRequests().then(setOutgoingRequests).catch(() => { });
    api.getCollaborations().then(setCollabs).catch(() => { });
  }, []);

  const handleRequest = async (id: number, status: "accepted" | "declined") => {
    await api.respondToRequest(id, status);
    setIncomingRequests((r) => r.filter((req) => req.id !== id));
    api.getCollaborations().then(setCollabs).catch(() => { });
  };

  const activeCollabs = [
    ...collabs.asOwner.filter((c) => c.project_status === "active"),
    ...collabs.asCollaborator.filter((c) => c.project_status === "active"),
  ];

  const pendingOutgoing = outgoingRequests.filter((r) => r.status === "pending");
  const resolvedOutgoing = outgoingRequests.filter((r) => r.status !== "pending");

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back, {user?.name}.</p>
        </div>

        {incomingRequests.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Incoming Requests
            </h2>
            <div className="mt-3 space-y-3">
              {incomingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {req.sender_name} wants to collaborate on{" "}
                      <span className="font-semibold">{req.project_name}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {req.project_type} &middot; {req.hours_per_week} hrs/week &middot; {req.duration?.replace(/_/g, " ")}
                    </p>
                    {req.message && (
                      <p className="mt-1 text-sm text-gray-600 italic">"{req.message}"</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRequest(req.id, "accepted")}
                      className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRequest(req.id, "declined")}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Active Collaborations
          </h2>
          {activeCollabs.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">No active collaborations yet.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {activeCollabs.map((c) => (
                <Link
                  key={c.collaboration_id}
                  to={`/collaborations/${c.collaboration_id}`}
                  className="block rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300"
                >
                  <p className="text-sm font-medium text-gray-900">{c.project_name}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {c.project_type} &middot; {c.hours_per_week} hrs/week &middot;{" "}
                    with {c.owner_name || c.collaborator_name}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {outgoingRequests.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              My Requests
            </h2>
            <div className="mt-3 space-y-2">
              {pendingOutgoing.length > 0 && pendingOutgoing.map((req) => (
                <Link
                  key={req.id}
                  to={`/projects/${req.project_id}`}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 transition-colors hover:border-gray-300"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{req.project_name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Sent to {req.recipient_name} &middot; waiting for response
                    </p>
                  </div>
                  <RequestStatusBadge status={req.status} />
                </Link>
              ))}
              {resolvedOutgoing.length > 0 && (
                <details className="group">
                  <summary className="cursor-pointer list-none text-xs text-gray-400 hover:text-gray-600 mt-1 select-none">
                    <span className="group-open:hidden">Show {resolvedOutgoing.length} resolved request{resolvedOutgoing.length !== 1 ? "s" : ""}</span>
                    <span className="hidden group-open:inline">Hide resolved</span>
                  </summary>
                  <div className="mt-2 space-y-2">
                    {resolvedOutgoing.map((req) => (
                      <Link
                        key={req.id}
                        to={`/projects/${req.project_id}`}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 transition-colors hover:border-gray-200"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-600">{req.project_name}</p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {req.recipient_name}
                          </p>
                        </div>
                        <RequestStatusBadge status={req.status} />
                      </Link>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              My Projects
            </h2>
            <Link
              to="/projects/new"
              className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              New project
            </Link>
          </div>
          {myProjects.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">
              You haven't posted any projects yet.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {myProjects.map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="block rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {p.project_type} &middot; {p.goal} &middot; {p.hours_per_week} hrs/week
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
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
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || styles.open}`}>
      {status}
    </span>
  );
}

function RequestStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700",
    accepted: "bg-green-50 text-green-700",
    declined: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}
