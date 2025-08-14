"use client";

import { getRoutesFlatten } from "@/lib/docs/routes-config";
import Anchor from "./anchor";

export default function NavGetStarted() {
  const routes = getRoutesFlatten();
  return (
    <Anchor
      activeClassName="text-primary font-semibold"
      href={`/docs${routes[0].href}`}
    >
      Documentation
    </Anchor>
  );
}
