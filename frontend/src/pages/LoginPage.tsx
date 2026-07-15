import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AxiosError } from "axios";
import type { AppDispatch } from "../app/store";
import { setCredentials } from "../features/auth/authSlice";
import { loginRequest, fetchCurrentUser } from "../features/auth/authApi";
import AuthLayout from "../components/authLayout";
import FormInput from "../components/formInput";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { data } = await loginRequest({ email, password });

      dispatch(
        setCredentials({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          user: { id: 0, email },
        })
      );

      const { data: user } = await fetchCurrentUser();
      dispatch(
        setCredentials({ accessToken: data.access_token, refreshToken: data.refresh_token, user })
      );

      navigate("/dashboard");
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      setError(axiosErr.response?.data?.detail || "Login failed. Check your credentials and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Your money, actually explained."
      subtitle="Log every rupee, ask it anything, and get answers grounded in your real numbers — not guesses."
    >
      <h2 className="font-display text-2xl text-ink mb-1">Welcome back</h2>
      <p className="text-sm text-slate-soft mb-6">Log in to your dashboard</p>

      <form onSubmit={handleSubmit} noValidate>
        <FormInput id="email" label="Email" type="email" autoComplete="email" required
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <FormInput id="password" label="Password" type="password" autoComplete="current-password" required
          value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && <p role="alert" className="mb-4 text-sm text-negative">{error}</p>}

        <button type="submit" disabled={isSubmitting}
          className="w-full rounded-lg bg-navy text-white font-medium py-2.5 text-sm
            hover:bg-navy-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2">
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-soft text-center">
        Don't have an account? <Link to="/signup" className="text-gold font-medium hover:underline">Sign up</Link>
      </p>
    </AuthLayout>
  );
}