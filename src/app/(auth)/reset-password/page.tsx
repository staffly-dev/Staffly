"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import arrowLeft from "/public/icons/arrow-left.svg";
import { Input } from "@/components/ui/input";

export default function ForgetPasswordPage() {
  return (
    <div className="m-auto lg:m-0 lg:w-[45%] px-2 md:px-6 lg:px-8 py-6">
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
          <h2 className="text-3xl font-bold">Forgot Password</h2>
          <p className="text-muted-foreground mt-1">
            Enter your registered email address. we&apos;ll send you a code to
            reset your password.
          </p>
        </div>

        <form className="space-y-4">
          <div className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email Address"
                className="h-12"
              />
            </div>
          </div>
          {/* <Link href="/reset-password"> */}
            <Button className="w-full h-12 text-base font-medium">
              Send OTP
            </Button>
          {/* </Link> */}
        </form>
      </div>
    </div>
  );
}
