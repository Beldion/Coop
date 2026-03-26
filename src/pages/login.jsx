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
import { Link, useNavigate } from "react-router-dom";
import ErrorLabel from "@/components/ui/error";
import { useAuthStore } from "@/store/useStore";

export default function LoginForm() {
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const { error } = await login(email, password);

    if (error) {
      console.log(error.message);
      setError(error.message);
    } else {
      navigate("/");
    }
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
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Username / Email</Label>
              <Input
                onChange={(e) => {
                  setError(null);
                  setEmail(e.target.value);
                }}
                id="email"
                type="text"
                placeholder="Enter your username or email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                onChange={(e) => {
                  setError(null);
                  setPassword(e.target.value);
                }}
                id="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>
            {error && <ErrorLabel message={error} />}
            <Button type="submit" className="w-full" size="lg">
              Submit
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
