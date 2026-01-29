import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(email, password, name);
      navigate("/profile");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 block text-center text-lg font-semibold tracking-tight text-gray-900">
          cortex
        </Link>
        <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Create your account</h2>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <label className="mt-4 block">
            <span className="text-sm font-medium text-gray-700">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </label>
          <label className="mt-3 block">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </label>
          <label className="mt-3 block">
            <span className="text-sm font-medium text-gray-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </label>
          <button
            type="submit"
            className="mt-5 w-full rounded-lg bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Create account
          </button>
          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-accent-600 hover:text-accent-700">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
