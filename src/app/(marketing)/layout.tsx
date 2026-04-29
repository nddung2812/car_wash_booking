import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <link
        rel="preload"
        as="image"
        href="/banner1.webp"
        fetchPriority="high"
      />
      <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
      <Header />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
