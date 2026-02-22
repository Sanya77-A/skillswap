import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { login } from "../features/auth/authSlice";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";

const schema = z.object({ email: z.string().email("Invalid email"), password: z.string().min(1, "Password required") });

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const { loading, error } = useSelector((s) => s.auth);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    setSubmitted(true);
    const result = await dispatch(login(data));
    if (login.fulfilled.match(result)) {
      toast.success("Logged in");
      navigate(from, { replace: true });
    } else {
      toast.error(result.payload || "Login failed");
    }
    setSubmitted(false);
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account">
      <Card className="border border-border">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
            <Input label="Password" type="password" error={errors.password?.message} {...register("password")} />
            <Link to="/forgot-password" className="text-sm text-accent hover:underline block">
              Forgot password?
            </Link>
            <Button type="submit" disabled={loading || submitted} className="w-full" size="lg">
              {loading || submitted ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-6 text-center text-sm text-text-secondary">
        Don't have an account?{" "}
        <Link to="/register" className="text-accent hover:underline font-medium">Register</Link>
      </p>
    </AuthLayout>
  );
}
