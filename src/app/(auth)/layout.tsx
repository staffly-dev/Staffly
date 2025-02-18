export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center min-h-screen p-4">
      <div className="hidden lg:block w-[52%] bg-primary/10 shadow-lg py-12 pl-12 rounded-xl">
        <div className="bg-white ml-auto h-[570px] lg:w-[500px] xl:w-[530px] py-2 pl-2 rounded-lg">
          <div className="auth-bg" />
        </div>
      </div>
      {children}
    </div>
  );
}
