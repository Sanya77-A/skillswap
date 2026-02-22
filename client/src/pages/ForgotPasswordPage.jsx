import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { api } from "../utils/api";

const schema = z.object({ email: z.string().email() });

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data) => {
    try {
      await api.post("/auth/forgot-password", data);
      setSent(true);
      toast.success("If the email exists, a reset link was sent.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">Check your email for the reset link.</p>
        <Link to="/login" className="mt-4 inline-block text-primary-600 dark:text-primary-400">Back to Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-6">Forgot Password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" {...register("email")} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <button type="submit" className="w-full py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700">Send reset link</button>
      </form>
      <p className="mt-4 text-center">
        <Link to="/login" className="text-primary-600 dark:text-primary-400">Back to Login</Link>
      </p>
    </div>
  );
}
