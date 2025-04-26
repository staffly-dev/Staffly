"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import arrowLeft from "/public/icons/arrow-left.svg";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { otpSchema, OtpFormData } from "@/lib/validations/auth";
import { useRouter } from "next/navigation";
export default function OtpCode() {
  const [value, setValue] = useState("");
  const { verifyEmail } = useAuth();
  const router = useRouter();

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue: setFormValue,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (data: OtpFormData) => {
    try {
      await verifyEmail(data.otp);
      router.push("/login");
      toast.success("OTP verified successfully!");
    } catch (error) {
      toast.error("" + error);
    }
  };

  return (
    <div>
      <Link href="/login">
        <div className="flex gap-1 items-center mb-8">
          <div className="relative w-5 h-5">
            <Image
              src={arrowLeft}
              alt="HRMS Logo"
              fill
              className="object-contain"
            />
          </div>
          <h2 className="text-2l font-regular">Back</h2>
        </div>
      </Link>

      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Enter OTP</h2>
          <p className="text-muted-foreground mt-1">
            We have share a code of your registered email address
            robertallen@example.com
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                value={value}
                onChange={(value) => {
                  setValue(value);
                  setFormValue("otp", value);
                }}
              >
                <InputOTPGroup className="justify-between gap-4 md:gap-6 mx-auto">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              {errors.otp && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.otp.message}
                </p>
              )}
            </div>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 text-base font-medium"
          >
            {isSubmitting ? "Verifying..." : "Verify"}
          </Button>
        </form>
      </div>
    </div>
  );
}
