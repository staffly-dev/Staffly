"use client";
import { useState } from "react";
import Link from "next/link";
import { LogoWithTitle } from "@/components/global/logo";
import { Menu, X } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import User from "./User";

const menuItems = [
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
];

export default function Header() {
  const [menuState, setMenuState] = useState(false);

  return (
    <header>
      <nav className="fixed z-20 w-full border-b border-dashed bg-white backdrop-blur md:relative dark:bg-zinc-950/50 lg:dark:bg-transparent">
        <div className="m-auto max-w-5xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <LogoWithTitle />
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                {menuState ? (
                  <X className="m-auto size-6 duration-200" />
                ) : (
                  <Menu className="m-auto size-6 duration-200" />
                )}
              </button>
            </div>

            <div
              className={`bg-background mb-6 w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent ${
                menuState ? "block" : "hidden"
              } lg:block`}
            >
              <div className="lg:pr-4">
                <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex w-full items-center space-x-4">
                <ModeToggle />
                <User />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
