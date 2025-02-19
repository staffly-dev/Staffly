"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import arrowLeft from "/public/icons/arrow-left.svg";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function ForgetPasswordPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your password reset logic here

    // After successful password reset, redirect to congrats page
    router.push("/reset/code");
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
          <h2 className="text-3xl font-bold">Forgot Password</h2>
          <p className="text-muted-foreground mt-1">
            Enter your registered email address. we&apos;ll send you a code to
            reset your password.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email Address"
                className="h-12"
              />
            </div>
          </div>
          <Button className="w-full h-12 text-base font-medium">
            Send OTP
          </Button>
        </form>
      </div>
    </div>
  );
}
