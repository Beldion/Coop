// import { useState } from "react";
// import { supabase } from "../lib/supabase";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     console.log(email, password);
//     const { error } = await supabase.auth.signUp({
//       email: email.trim(),
//       password,
//     });
//     if (error) {
//       alert(error.message);
//       console.log(error);
//     } else alert("Check your email to confirm signup");
//   };
//   return (
//     <div className="flex w-full items-center justify-center min-h-screen">
//       <form
//         onSubmit={handleLogin}
//         className="flex flex-col gap-4 p-6 border rounded-lg w-80"
//       >
//         <h2 className="text-xl font-bold">Sign up</h2>

//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="border p-2 rounded-sm"
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="border p-2 rounded-sm"
//         />

//         <button className="bg-[#000] text-white p-2 rounded-sm">Signup</button>
//       </form>
//     </div>
//   );
// }

import { useState } from "react";
import { supabase } from "../lib/supabase";

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
import { useNavigate, Link } from "react-router-dom";

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log(email, password);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      alert(error.message);
      console.log(error);
    } else {
      alert("Check your email to confirm signup");
      navigate("/login");
    }
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
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Username / Email</Label>
              <Input
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                type="text"
                placeholder="Enter your username or email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Sign Up
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
