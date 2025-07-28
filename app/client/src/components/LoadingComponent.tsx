const LoadingComponent = () => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 dark:border-white border-gray-900 "></div>
    </div>
  );
};

export default LoadingComponent;
