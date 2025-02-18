"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CongratsPage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
      <Card className="w-[400px] text-center p-6">
        <CardContent className="space-y-4 pt-6">
          <div className="relative w-20 h-20 mx-auto">
            <Image
              src="/imgs/congrats.png"
              alt="Success"
              fill
              className="object-contain"
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
              Password Update Successfully
            </h2>
            <p className="text-muted-foreground text-sm">
              Your password has been update successfully!
            </p>
          </div>

          <Button
            className="w-full h-12"
            onClick={() => router.push("/sign-in")}
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
