"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DepartmentNotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="h-[600px] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Department Not Found</h1>
        <p className="text-xl text-hrms-gray mt-4">
          Please check the URL and try again.
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
