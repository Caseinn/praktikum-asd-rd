import ToasterProvider from "@/components/shared/toaster-provider";
import DashboardToast from "@/components/shared/dashboard-toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToasterProvider />
      <DashboardToast />
      {children}
    </>
  );
}
