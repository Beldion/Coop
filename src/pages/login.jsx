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
import ErrorLabel from "@/components/ui/error";

import { useAuthLogin } from "@/api/auth";

export default function LoginForm() {
  const userLogin = useAuthLogin();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    userLogin.mutateAsync({
      email: form.email,
      password: form.password,
    });
  };
  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your username or email to access your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Username / Email</Label>
              <Input
                value={form.email}
                onChange={handleChange}
                id="email"
                name="email"
                type="text"
                placeholder="Enter your username or email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                value={form.password}
                onChange={handleChange}
                name="password"
                id="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>
            {userLogin.isError && (
              <ErrorLabel message={userLogin.error.message} />
            )}
            <Button
              type="submit"
              disabled={userLogin.isPending}
              className="w-full"
              size="lg"
            >
              {userLogin.isPending ? "Logging in..." : "Login"}
            </Button>
            <div className="flex justify-center align-items">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline "
              >
                Forgot your password?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
