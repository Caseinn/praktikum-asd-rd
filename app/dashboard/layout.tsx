import ToasterProvider from "@/components/shared/toaster-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ToasterProvider />
    </>
  );
}
