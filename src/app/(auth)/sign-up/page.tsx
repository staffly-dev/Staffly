import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function SignUpPage() {
  return (
    <main className="flex items-center justify-center h-full">
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-8 shadow-lg">
        <h1 className="text-2xl font-semibold mb-4">Sign up</h1>
        <form
          className="flex flex-col gap-4"
          action="/api/auth/sign-up"
          method="post"
        >
          <label className="flex flex-col gap-1" htmlFor="email">
            Email
            <input
              className="border border-solid border-zinc-300 dark:border-zinc-600 rounded-lg p-2"
              type="email"
              id="email"
              name="email"
              required
            />
          </label>
          <label className="flex flex-col gap-1" htmlFor="password">
            Password
            <input
              className="border border-solid border-zinc-300 dark:border-zinc-600 rounded-lg p-2"
              type="password"
              id="password"
              name="password"
              required
            />
          </label>
          <Button
            className="bg-blue-500 dark:bg-blue-400 text-white rounded-lg p-2"
            type="submit"
          >
            Sign up
          </Button>
          <Link href="/sign-in">Already have an account? Sign in</Link>
        </form>
      </div>
    </main>
  );
}
