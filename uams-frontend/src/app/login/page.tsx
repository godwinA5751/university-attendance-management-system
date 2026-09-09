"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import api from "@/lib/axios";
import InputFields from "@/types/loginInputs";
import { getDashboardRoute } from "@/utils/getDashboardRoute";

const inputs: InputFields[] = [
  {
    label: "Staff/Student ID",
    name: "user",
    type: "text",
  },
  {
    label: "Password",
    name: "password",
    type: "password",
  },
];

export default function LoginPage() {
  const [formData, setFormData] = useState({
    user: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.user.trim() || !formData.password.trim()) {
      setError("Please fill in required field");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        identifier: formData.user,
        password: formData.password,
      });

      const { token, user } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);

      if (user.mustChangePassword) {
        router.push("/auth/change-password");
        return;
      }

      router.push(getDashboardRoute(user.role));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Something went wrong");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <main>
      <form
        onSubmit={handleSubmit}
        className="min-w-sm mx-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-sky-100/50 p-6 rounded-2xl shadow-lg"
      >
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <div className="mb-4 flex flex-col gap-4">
          {inputs.map((input) => (
            <input
              key={input.name}
              type={input.type}
              id={input.name}
              name={input.name}
              value={formData[input.name]}
              onChange={handleChange}
              placeholder={input.label}
              required
              className="border border-gray-300 rounded px-4 py-2"
            />
          ))}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {/*{success && <p style={{ color: "green" }}>{success}</p>}        */}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </div>
      </form>
    </main>
  );
}
