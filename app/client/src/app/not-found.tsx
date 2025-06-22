"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-xl text-hrms-gray mt-4">Page Not Found</p>
        <p className="text-hrms-gray/60 mt-2">
          The page you are looking for does not exist.
        </p>
        <Button
          onClick={handleGoBack}
          className="inline-block mt-6 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
}
