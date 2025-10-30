import { ContactHero } from "@/components/pages/contact/contact-hero";
import ContactContent from "@/components/pages/contact/contact-content";
import { ContactInfoSection } from "@/components/pages/contact/contact-info-section";

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactContent />
      <ContactInfoSection />
    </>
  );
}
