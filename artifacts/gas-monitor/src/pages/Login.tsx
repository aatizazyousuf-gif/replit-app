import React, { useState } from "react";
import { AuthLayout } from "@/layouts/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin, useRegister, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Login() {
  const [activeTab, setActiveTab] = useState("homeowner");
  const [isLogin, setIsLogin] = useState(true);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          queryClient.setQueryData(getGetMeQueryKey(), data.user);
          if (data.user.role === "homeowner") {
            setLocation("/dashboard");
          } else {
            setLocation("/supplier/dashboard");
          }
        },
        onError: () => {
          toast({ title: "Login failed", description: "Invalid credentials.", variant: "destructive" });
        }
      }
    );
  };

  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(
      { data: { ...values, role: activeTab as "homeowner" | "supplier" } },
      {
        onSuccess: (data) => {
          queryClient.setQueryData(getGetMeQueryKey(), data.user);
          if (data.user.role === "homeowner") {
            setLocation("/setup");
          } else {
            setLocation("/supplier/dashboard");
          }
        },
        onError: () => {
          toast({ title: "Registration failed", description: "An error occurred.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <AuthLayout>
      <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-2xl shadow-xl border border-[var(--color-outline-variant)]">
        <Tabs defaultValue="homeowner" onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-2 bg-[var(--color-surface-container)] rounded-lg p-1">
            <TabsTrigger
              value="homeowner"
              className="rounded-md data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-[var(--color-on-primary)] data-[state=active]:shadow-sm transition-all"
            >
              Homeowner
            </TabsTrigger>
            <TabsTrigger
              value="supplier"
              className="rounded-md data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-[var(--color-on-primary)] data-[state=active]:shadow-sm transition-all"
            >
              Supplier
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className={isLogin ? "" : "hidden"}>
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-[var(--color-on-surface)]">Email</Label>
                    <FormControl>
                      <Input type="email" autoComplete="email" placeholder="name@example.com" {...field} className="bg-[var(--color-surface)] border-[var(--color-outline-variant)] focus-visible:ring-[var(--color-primary)]" />
                    </FormControl>
                    <FormMessage className="text-[var(--color-error)]" />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-[var(--color-on-surface)]">Password</Label>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" placeholder="••••••••" {...field} className="bg-[var(--color-surface)] border-[var(--color-outline-variant)] focus-visible:ring-[var(--color-primary)]" />
                    </FormControl>
                    <FormMessage className="text-[var(--color-error)]" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-[var(--color-on-primary)] shadow-md" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </div>

        <div className={isLogin ? "hidden" : ""}>
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <FormField
                control={registerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-[var(--color-on-surface)]">Full Name</Label>
                    <FormControl>
                      <Input type="text" autoComplete="name" placeholder="John Doe" {...field} className="bg-[var(--color-surface)] border-[var(--color-outline-variant)] focus-visible:ring-[var(--color-primary)]" />
                    </FormControl>
                    <FormMessage className="text-[var(--color-error)]" />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-[var(--color-on-surface)]">Email</Label>
                    <FormControl>
                      <Input type="email" autoComplete="email" placeholder="name@example.com" {...field} className="bg-[var(--color-surface)] border-[var(--color-outline-variant)] focus-visible:ring-[var(--color-primary)]" />
                    </FormControl>
                    <FormMessage className="text-[var(--color-error)]" />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-[var(--color-on-surface)]">Password</Label>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" placeholder="••••••••" {...field} className="bg-[var(--color-surface)] border-[var(--color-outline-variant)] focus-visible:ring-[var(--color-primary)]" />
                    </FormControl>
                    <FormMessage className="text-[var(--color-error)]" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-[var(--color-on-primary)] shadow-md" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? "Registering..." : "Create Account"}
              </Button>
            </form>
          </Form>
        </div>

        <div className="mt-6 text-center text-sm">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-[var(--color-secondary)] hover:text-[var(--color-secondary-container)] font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
