"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ContactHero } from "@/components/pages/contact/contact-hero";
import ContactContent from "@/components/pages/contact/contact-content";
import { ContactInfoSection } from "@/components/pages/contact/contact-info-section";

export default function ContactPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch contact settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/contact/settings');
        const result = await response.json();

        if (response.ok) {
          setSettings(result.settings || {});
        } else {
          console.error('Failed to fetch contact settings:', result.error);
        }
      } catch (error) {
        console.error('Error fetching contact settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ContactHero settings={settings} />
      <ContactContent settings={settings} />
      <ContactInfoSection settings={settings} />
    </>
  );
}
