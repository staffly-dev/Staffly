import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import logo from "/public/imgs/logo.png";
import { Input } from "@/components/ui/input";

export default function CongratsPage() {
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
              <Input placeholder="Password" className="h-12" />
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
              href="/forgot-password"
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
