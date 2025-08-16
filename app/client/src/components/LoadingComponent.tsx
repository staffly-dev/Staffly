import { cn } from "@/lib/utils";
import { Logo } from "./global/logo";

const LoadingComponent = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center w-full h-[calc(100vh-10rem)] relative",
        className
      )}
    >
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 text-center dark:border-white border-gray-900 ">
        <Logo className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
};

export default LoadingComponent;
