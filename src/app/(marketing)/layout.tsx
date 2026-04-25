import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
