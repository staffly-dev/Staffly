import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold">Sign In</h1>
      <p className="text-lg">Sign in to your account</p>
      <form className="flex flex-col gap-4 mt-8">
        <label className="flex flex-col gap-2">
          <span className="text-lg">Email</span>
          <input
            type="email"
            className="p-2 border border-solid border-black/[.08] rounded"
            placeholder="Email address"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-lg">Password</span>
          <input
            type="password"
            className="p-2 border border-solid border-black/[.08] rounded"
            placeholder="Password"
          />
        </label>
        <Button
          type="submit"
          className="bg-black/[.08] dark:bg-white/[.145] hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] px-4 py-2 rounded"
        >
          Sign In
        </Button>
        <Link href="/sign-up">Don&apos;t have an account? Sign up</Link>
      </form>
    </div>
  );
}
