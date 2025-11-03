"use client"

import { FAQ } from "@/components/pages/home/faq"
import { AffiliateCard } from "@/components/pages/home/affilliate-card"

export function FAQSection({ 
  faqs, 
  showAffiliate = true,
  affiliateConfig = {}
}) {
  return (
    <section className="py-12 md:py-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
          {/* FAQ Section - Takes 2 columns */}
          <div className="lg:col-span-2">
            <FAQ faqs={faqs} />
          </div>

          {/* Affiliate Section - Takes 1 column */}
          {showAffiliate && (
            <aside className="lg:col-span-1">
              <div className="sticky top-24">
                <AffiliateCard {...affiliateConfig} />
              </div>
            </aside>
          )}
        </div>
      </div>
    </section>
  )
}