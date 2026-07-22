"use client";

import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

type ForgotPassword = {
  email: string;
};

const formSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

function ForgotPassword() {
  const router = useRouter();

  const form = useForm<ForgotPassword>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const forgotPassMutation = useMutation({
    mutationFn: async (bodyData: { email: string }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyData),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to send email");
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      const encodedEmail = encodeURIComponent(variables.email);
      toast.success(data.message || "OTP sent successfully!");
      router.push(`/verify-otp?email=${encodedEmail}`);
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong");
    },
  });

  const onSubmit = (data: ForgotPassword) => {
    forgotPassMutation.mutate({ email: data.email });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-semibold text-green-700">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-sm">
            Enter your email to recover your password
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="hello@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={forgotPassMutation.isPending}
                className="w-full bg-green-700 hover:bg-green-800"
              >
                {forgotPassMutation.isPending ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ForgotPassword;
