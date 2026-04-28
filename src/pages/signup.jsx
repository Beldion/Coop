import { useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function LoginForm() {
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const signupMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success(
        "Signup successful. Please check your email to confirm your account.",
      );
    },
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setMessage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signupMutation.mutate();
  };
  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Register</CardTitle>
          <CardDescription>
            Enter your email and password to create an account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Username / Email</Label>
              <Input
                value={form.email}
                onChange={handleChange}
                name="email"
                id="email"
                type="text"
                placeholder="Enter your username or email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                name="password"
                value={form.password}
                onChange={handleChange}
                id="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>
            {message && <p className="text-green-600 text-sm">{message}</p>}
            {signupMutation.isError && (
              <p className="text-red-500 text-sm">
                {signupMutation.error.message}
              </p>
            )}
            <Button
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full"
            >
              {signupMutation.isPending ? "Creating account..." : "Signup"}
            </Button>
            <div className="flex justify-center align-items">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline "
              >
                Forgot your password?
              </Link>
            </div>

            <div className="flex justify-center align-items gap-1">
              <p> I already have an account?</p>
              <Link
                to="/login"
                className="text-sm text-primary hover:underline "
              >
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
