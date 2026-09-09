"use client";
import {useState} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import api from "@/lib/axios";

import {
  Button
} from "@/components/ui";

import InputField from "@/types/inputs";
import useAuthGuard from "@/hooks/useAuthGuard";
import { getDashboardRoute } from "@/utils/getDashboardRoute";

const inputs: InputField[] = [
  {
    label: "Current Password",
    name: "currentPassword",
    type: "password",
  },
  {
    label: "New Password",
    name: "newPassword",
    type: "password",
  },
  {
    label: "Confirm Password",
    name: "confirmPassword",
    type: "password",
  },
]

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const checkingAuth = useAuthGuard();
  
  if (checkingAuth) return null;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.currentPassword.trim() || !formData.newPassword.trim() || !formData.confirmPassword.trim()) {
      setError("Please fill in required field")
      setTimeout(() => setError(""), 3000)
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirm password do not match");
      setTimeout(() => setError(""), 3000)
      return;
    }
    try {
      setLoading(true);
      const response = await api.patch("auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setSuccess(response.data.message);
      const role = localStorage.getItem("role");
      
      router.push(getDashboardRoute(role ?? ""));
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ??
          "Failed to change password"
        );
      } else {
        setError("Failed to change password");
      }
    } finally {
      setLoading(false);
      setTimeout(() => setError(""), 3000)
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="min-w-sm mx-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-sky-100/50 p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Change Password</h1>
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
          {success && <p style={{ color: "green" }}>{success}</p>}        
          <Button
            type="submit"
            loading={loading}
          >
            Change Password
          </Button>
        </div>
      </form>
    </div>
  );
}