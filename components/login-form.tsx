"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Define form schema with zod
const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);

    try {
      // In a real application, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

      // Mock authentication logic
      const demoUsers = {
        "patient@example.com": {
          route: "/patient/portal",
          password: "password123",
        },
        "test@example.com": {
          route: "/patient/portal",
          password: "password123",
        },
      };

      const user = demoUsers[data.email as keyof typeof demoUsers];

      if (user && user.password === data.password) {
        // Success notification
        toast({
          title: "Login successful",
          description: "Redirecting to your dashboard...",
          variant: "default",
        });

        // In a real application, you would save the auth token here
        localStorage.setItem("isAuthenticated", "true");

        // Redirect to dashboard
        setTimeout(() => {
          router.push(user.route);
        }, 1000);
      } else {
        // Error notification
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
        form.setError("root", {
          message: "Invalid email or password",
        });
      }
    } catch (error) {
      // Error notification for unexpected errors
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      <Card className="bg-gray-800/90 backdrop-blur-sm shadow-xl border-gray-700">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-white">
            Welcome back
          </CardTitle>
          <CardDescription className="text-gray-300">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@example.com"
                        className="bg-gray-700/80 border-gray-600 text-white placeholder:text-gray-400"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-gray-200">Password</FormLabel>
                      <Link
                        href="/patient/forgot-password"
                        className="text-sm font-medium text-blue-400 hover:text-blue-300"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        className="bg-gray-700/80 border-gray-600 text-white"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              {form.formState.errors.root && (
                <div className="text-sm font-medium text-red-500 dark:text-red-400">
                  {form.formState.errors.root.message}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t border-gray-700 pt-4">
          <div className="text-center text-sm text-gray-300">
            <span>Don&apos;t have an account? </span>
            <Link
              href="/patient/register"
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              Sign up
            </Link>
          </div>
          <Link
            href="/"
            className="flex items-center justify-center text-sm text-gray-300 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
