"use client";

import { buttonVariants } from "@/components/ui/button";
import { getRoutesFlatten } from "@/lib/docs/routes-config";
import Link from "next/link";

export default function GetStarted() {
  const routes = getRoutesFlatten();
  return (
    <Link
      href={`/docs${routes[0].href}`}
      className={buttonVariants({ className: "px-6", size: "lg" })}
    >
      Get Started
    </Link>
  );
}
