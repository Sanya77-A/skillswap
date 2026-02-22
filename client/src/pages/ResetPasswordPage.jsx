import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { api } from "../utils/api";

const schema = z.object({ password: z.string().min(6).max(100) });

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { password: "" },
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error("Invalid reset link");
      return;
    }
    try {
      await api.post("/auth/reset-password", { token, password: data.password });
      setDone(true);
      toast.success("Password reset. You can login now.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">Password reset successful.</p>
        <Link to="/login" className="mt-4 inline-block text-primary-600 dark:text-primary-400">Login</Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center">
        <p className="text-red-500">Invalid or missing reset token.</p>
        <Link to="/forgot-password" className="mt-4 inline-block text-primary-600">Request new link</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">New password (min 6)</label>
          <input type="password" {...register("password")} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>
        <button type="submit" className="w-full py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700">Reset password</button>
      </form>
    </div>
  );
}
