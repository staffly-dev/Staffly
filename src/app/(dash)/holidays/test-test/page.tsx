import Link from "next/link";
import React from "react";

export default function page() {
  return <div>
    <h1>test</h1>
    <Link href="/holidays/test-test/test2">test2 link</Link>
    <Link href="/holidays">holidays link</Link>
  </div>;
}
