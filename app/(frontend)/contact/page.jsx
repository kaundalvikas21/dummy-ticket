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
        <div className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
              {/* Left Column - Working Hours Skeleton */}
              <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-200">
                {/* Title Section Skeleton */}
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gray-200 animate-pulse"></div>
                  <div className="h-8 md:h-10 w-32 md:w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>

                {/* Description Skeleton */}
                <div className="h-4 w-full bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-6 md:mb-8 animate-pulse"></div>

                {/* Working Hours Grid Skeleton */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-gray-200 py-2.5 px-3 md:py-3 md:px-4 rounded-xl animate-pulse">
                      <div className="text-center">
                        <div className="h-4 w-12 md:w-16 bg-gray-300 rounded mx-auto mb-1"></div>
                        <div className="h-3 w-16 md:w-20 bg-gray-300 rounded mx-auto"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Contact Support Skeleton */}
              <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-200">
                {/* Title Section Skeleton */}
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gray-200 animate-pulse"></div>
                  <div className="h-8 md:h-10 w-36 md:w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>

                {/* Description Skeleton */}
                <div className="h-4 w-full bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-6 md:mb-8 animate-pulse"></div>

                {/* Country Support Grid Skeleton */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-gray-200 p-3 md:p-5 rounded-xl animate-pulse">
                      <div className="h-4 w-16 md:w-20 bg-gray-300 rounded mb-1 md:mb-2"></div>
                      <div className="h-3 w-20 md:w-24 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
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
