"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Dummy registration logic
    if (name && email && password) {
      alert(`User registered with Name: ${name}, Email: ${email}`);
      // Redirect to login page or dashboard after successful registration
      router.push("/login");
    } else {
      alert("All fields are required");
    }

    // Clear form fields
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-gray-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-orange-400">Register</CardTitle>
          <CardDescription className="text-gray-300">
            Create a new account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-gray-300">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-gray-700 text-white placeholder-gray-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-700 text-white placeholder-gray-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-700 text-white placeholder-gray-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              >
                Register
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              <Link
                href="/login"
                passHref
                className="text-orange-400 underline underline-offset-4"
              >
                Already have an account? Login
              </Link>
            </div>
            <div className="mt-4 text-center text-sm">
              <Link
                href="/"
                passHref
                className="text-orange-400 flex items-center justify-center font-semibold hover:text-white border border-gray-700 rounded-md p-1 w-1/2 mx-auto"
              >
                <ArrowLeft /> Back to home
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
