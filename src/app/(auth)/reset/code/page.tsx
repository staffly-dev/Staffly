"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import arrowLeft from "/public/icons/arrow-left.svg";
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

export default function OtpCode() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your password reset logic here

    // After successful password reset, redirect to congrats page
    router.push("/reset/change");
  };

  return (
    <div className="">
      <Link href="/sign-in">
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
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <InputOTP maxLength={5} pattern={REGEXP_ONLY_DIGITS}>
                <InputOTPGroup className="justify-between gap-4 md:gap-6 mx-auto">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
          <Button className="w-full h-12 text-base font-medium">Verify</Button>
        </form>
      </div>
    </div>
  );
}
