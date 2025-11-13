"use client";

import { useState, useEffect } from "react";
import { SkeletonCard, SkeletonCardContent, SkeletonCardHeader } from "@/components/ui/skeleton-card";
import { SkeletonForm, SkeletonFormText, SkeletonFormActions } from "@/components/ui/skeleton-form";
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
      <>
        {/* Hero Section Skeleton */}
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
          <div className="text-center">
            <div className="h-12 w-48 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 w-64 bg-gray-200 rounded mx-auto mb-8 animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded-lg mx-auto animate-pulse"></div>
          </div>
        </div>

        {/* Contact Form Skeleton */}
        <div className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                  <div className="h-8 w-32 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
                  <div className="h-4 w-64 bg-gray-200 rounded mx-auto animate-pulse"></div>
                </div>
                <SkeletonForm fields={4} />
                <SkeletonFormActions />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info Skeleton */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 w-80 bg-gray-200 rounded mx-auto animate-pulse"></div>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i}>
                    <SkeletonCardHeader />
                    <SkeletonCardContent />
                  </SkeletonCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
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
