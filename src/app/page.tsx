import React from "react";
import Link from "next/link";

export default function page() {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">Home Page (Landing)</h1>
      <nav className="flex gap-4 text-lg">
        <Link href="/sign-in">Sign In</Link>
        <Link href="/sign-up">Sign Up</Link>
        <Link href="/dashboard">Dashboard</Link>
      </nav>
    </div>
  );
}
