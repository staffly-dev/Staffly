import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const ErrorComponent = ({
  error,
  fetchError,
  clearError,
  className,
}: {
  error: string | null;
  fetchError?: string | null;
  clearError: () => void;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "text-red-500 sm:text-xl font-bold text-center flex flex-col gap-4 items-center justify-center",
        className
      )}
    >
      {error || fetchError}
      <Button onClick={() => clearError()}>Clear Error</Button>
    </div>
  );
};

export default ErrorComponent;
