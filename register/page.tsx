"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      router.push("/login");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">Create an account</h2>
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="mt-1 block w-full rounded border border-gray-300 p-2"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 block w-full rounded border border-gray-300 p-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="mt-1 block w-full rounded border border-gray-300 p-2"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
} 