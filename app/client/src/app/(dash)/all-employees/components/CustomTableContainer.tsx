export function CustomTableContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="p-0 mb-3 max-h-[calc(100vh-250px)] overflow-y-auto overflow-x-auto [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-hrms-gray/20
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-primary/60"
    >
      <table className="min-w-full divide-y divide-hrms-gray/20">
        {children}
      </table>
    </div>
  );
}
