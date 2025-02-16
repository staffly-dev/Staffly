export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-rows-[max-content,1fr] h-screen">
      <h1>Auth layout</h1>
      <main className="p-4">{children}</main>
    </div>
  );
}
