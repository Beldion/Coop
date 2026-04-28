import { useState } from "react";
import { supabase } from "@/lib/supabase";

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
import ErrorLabel from "@/components/ui/error";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const forgotPasswordMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "/reset-password",
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.error("Password reset link sent. Please check your email.");
      setSuccess(true)
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    forgotPasswordMutation.mutate();
  };

  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        {!success && (
          <>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">
                Reset Password
              </CardTitle>
              <CardDescription>
                Enter your email to receive password reset instructions
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Username / Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your username or email"
                    required
                  />
                  {error && <ErrorLabel message={error} />}
                </div>
                <div className="flex flex-col items-center align-center gap-2">
                  <Button
                    type="submit"
                    disabled={forgotPasswordMutation.isPending}
                    className="w-full"
                  >
                    {forgotPasswordMutation.isPending
                      ? "Sending..."
                      : "Send Reset Link"}
                  </Button>
                  <Link
                    to="/login"
                    className="text-sm text-primary hover:underline "
                  >
                    Back to Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </>
        )}
        {success && (
          <div className="flex flex-col items-center gap-6 p-6  ">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-5xl font-bold">Check your email</h1>
              <CardDescription className="max-w-[300px]">
                If an account with that email exists, we’ve sent you a link to
                reset your password.
              </CardDescription>
            </div>
            <div className="w-full flex flex-col items-center gap-2 ">
              <Button className="w-full">
                Check your email for the reset link
              </Button>
              <Link
                to="/login"
                className="text-sm text-primary hover:underline "
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
