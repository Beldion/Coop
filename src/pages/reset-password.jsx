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
import { Link, useNavigate } from "react-router-dom";
import ErrorLabel from "@/components/ui/error";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Password updated successfully.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    },

    onError: (err) => {
      setError(err);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    resetPasswordMutation.mutate();
  };

  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter your email to receive password reset instructions
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                type="password"
                placeholder="Enter your password"
                required
              />
              {error && <ErrorLabel message={error} />}
            </div>
            <div className="flex flex-col items-center align-center gap-2">
              <Button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="w-full"
              >
                {resetPasswordMutation.isPending
                  ? "Updating..."
                  : "Update Password"}
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
      </Card>
    </div>
  );
}
