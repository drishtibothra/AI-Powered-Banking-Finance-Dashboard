import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AxiosError } from "axios";
import { signupRequest } from "../features/auth/authApi";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import PasswordInput from "../components/PasswordInput";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signupRequest({ email, password });
      navigate("/login", { state: { justSignedUp: true } });
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      setError(axiosErr.response?.data?.detail || "Signup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Start with one honest number."
      subtitle="Add your income, expenses, and savings — the assistant takes it from there."
    >
      <h2 className="font-display text-2xl text-ink mb-1">Create your account</h2>
      <p className="text-sm text-slate-soft mb-6">Takes less than a minute</p>

      <form onSubmit={handleSubmit} noValidate>
        <FormInput
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordInput
          id="password"
          label="Password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordInput
          id="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && <p role="alert" className="mb-4 text-sm text-negative">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-navy text-white font-medium py-2.5 text-sm
            hover:bg-navy-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2"
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-soft text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-gold font-medium hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}