import { Button } from "./ui/button";

const ErrorComponent = ({
  error,
  fetchError,
  clearError,
}: {
  error: string | null;
  fetchError?: string | null;
  clearError: () => void;
}) => {
  return (
    <div className="text-red-500 sm:text-xl font-bold text-center flex flex-col gap-4 items-center justify-center h-screen">
      Error: {error || fetchError}
      <Button onClick={() => clearError()}>Clear Error</Button>
    </div>
  );
};

export default ErrorComponent;
