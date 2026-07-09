export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: "hsl(222, 47%, 11%)" }}>
      {children}
    </div>
  );
}
