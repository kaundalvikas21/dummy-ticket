import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function UserLayout({ children }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">{children}</main>
      <Footer />
    </>
  );
}
