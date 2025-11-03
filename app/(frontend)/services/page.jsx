import BenefitsSection from "@/components/pages/services/benefits-sec";
import HeroSection from "@/components/pages/services/hero-services";
import MainServices from "@/components/pages/services/main-services";
import { servicePlans } from "@/lib/constants/servicePlans";

export default function Services(){
    return(
        <>
        <HeroSection />
        <MainServices servicePlans={servicePlans} />
        <BenefitsSection />
        </>
    )
}
