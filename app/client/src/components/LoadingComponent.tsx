import { cn } from "@/lib/utils";

const LoadingComponent = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center w-full h-[calc(100vh-10rem)]",
        className
      )}
    >
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 dark:border-white border-gray-900 "></div>
    </div>
  );
};

export default LoadingComponent;
