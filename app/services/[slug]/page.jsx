import { notFound } from "next/navigation";
import ServiceDetailClient from "./service-detail-client";
import { servicesData } from "@/data/services";

// Generate static params for all services
export async function generateStaticParams() {
  return servicesData.map((service) => ({
    slug: service.slug,
  }));
}

// Generate metadata for each service (SEO)
export async function generateMetadata({ params }) {
  const { slug } = await params; // ✅ Await params first
  const service = servicesData.find((s) => s.slug === slug);

  if (!service) {
    return {
      title: "Service Not Found",
    };
  }

  return {
    title: `${service.title} | Your Company Name`,
    description: service.description,
    openGraph: {
      title: service.title,
      description: service.description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: service.title,
      description: service.description,
    },
  };
}

// Server Component (default - no "use client")
export default async function ServiceDetailPage({ params }) {
  const { slug } = await params; // ✅ Await params first
  const service = servicesData.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  // Pass data to client component
  return <ServiceDetailClient service={service} />;
}