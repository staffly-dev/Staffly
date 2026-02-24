"use client";
import React from "react";
import Link from "next/link";
import { Rocket, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section>
      <div className="relative pt-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl text-center sm:mx-auto lg:mr-auto lg:mt-0 lg:w-4/5">
            <h1 className="mt-8 text-balance text-4xl font-semibold md:text-5xl xl:text-6xl xl:[line-height:1.125]">
              Simplify the way you manage
            </h1>
            <p className="mx-auto mt-8 hidden max-w-2xl text-wrap text-lg sm:block">
              Because you deserve a solution that drives growth not holds you
              back.
            </p>

            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" variant="outline" asChild>
                <Link href="#">
                  <Rocket className="relative size-4" />
                  <span className="text-nowrap">Start Building</span>
                </Link>
              </Button>
              <Button size="lg" asChild>
                <Link href="#">
                  <Zap className="relative size-4" />
                  <span className="text-nowrap">Get Started</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="relative mt-16">
          <div
            aria-hidden
            className="bg-linear-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
          />
          <div className="relative mx-auto max-w-6xl overflow-hidden px-4">
            <Image
              className="z-2 border-border/25 relative rounded-2xl border"
              src="/imgs/frame.png"
              alt="app screen"
              width={2796}
              height={2008}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
