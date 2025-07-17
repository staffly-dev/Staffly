"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaChevronLeft } from "react-icons/fa6";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgetPasswordSchema,
  type ForgetFormData,
} from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

export default function ForgetPasswordPage() {
  const { resetPasswordRequest, resetPasswordRequestError } = useAuth();
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<ForgetFormData>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  const onSubmit = async (data: ForgetFormData) => {
    try {
      await resetPasswordRequest(data.email);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div>
      <Link href="/login">
        <div className="flex gap-1 items-center mb-8">
          <FaChevronLeft className="w-4 h-4" />
          <h2 className="text-2l font-regular">Back</h2>
        </div>
      </Link>

      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Forgot Password</h2>
          <p className="text-muted-foreground mt-1">
            Enter your registered email address. we&apos;ll send you a code to
            reset your password.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {resetPasswordRequestError && (
            <p className="text-sm text-red-500 mt-1">
              {(resetPasswordRequestError as any).response?.data?.message ||
                "Error: Check your network"}
            </p>
          )}
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Email Address"
                className="h-12"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full h-12 text-base font-medium",
              isSubmitting && "bg-primary/50"
            )}
          >
            {isSubmitting ? "Sending..." : "Send Code"}
          </Button>
        </form>
      </div>
    </div>
  );
}
