"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import logo from "/public/imgs/logo.png";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="m-auto lg:m-0 lg:w-[45%] px-2 md:px-6 lg:px-8 py-6">
      <div className="flex gap-3 items-center mb-8">
        <div className="relative w-10 h-10">
          <Image src={logo} alt="HRMS Logo" fill className="object-contain" />
        </div>
        <h1 className="text-2xl font-semibold">HRMS</h1>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Welcome back 👋</h2>
          <p className="text-muted-foreground mt-1">
            Please sign in to your account
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
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="h-12"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                    <line x1="2" y1="2" x2="22" y2="22"></line>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="rounded border-gray-300"
              />
              <label
                htmlFor="remember"
                className="text-sm text-muted-foreground"
              >
                Remember me
              </label>
            </div>
            <Link
              href="/reset-password"
              className="text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button className="w-full h-12 text-base font-medium">Sign In</Button>

          <p className="text-center text-muted-foreground">
            Don&apos;t have an account?
            <Link href="/sign-up" className="text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
