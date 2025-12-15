import BenefitsSection from "@/components/pages/services/benefits-sec";
import HeroSection from "@/components/pages/services/hero-services";
import MainServices from "@/components/pages/services/main-services";
import { createClient } from "@/lib/supabase/client"

export const metadata = {
    title: "Services | Dummy Ticket",
    description: "Explore our wide range of travel services designed to simplify your visa application process.",
}

export default async function ServicesPage() {
    const supabase = createClient()
    const { data: servicePlans } = await supabase
        .from("service_plans")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true })

    return (
        <>
            <HeroSection />
            <MainServices servicePlans={servicePlans || []} />
            <BenefitsSection />
        </>
    )
}
