// Display these plans in services & buy-ticket page plans

export const servicePlans = [
  {
    id: "visa-ticket",
    name: "DUMMY TICKET FOR VISA",
    description:
      "Verifiable flight reservation with valid PNR for visa applications. Perfect for embassy submissions.",
    price: 19,
    currencies: "19 USD | 1200 INR | 70 AED | 16 EUR | 14.50 GBP",
    features: [
      "Flight reservation/ itinerary",
      "Verifiable on airline website",
      "Up to 4 changes allowed",
      "Use for visa application/ proof of return",
    ],
    popular: false,
    image: "/airplane-flying-clouds-professional.jpg",
  },
  {
    id: "ticket-hotel",
    name: "DUMMY TICKET & HOTEL",
    description:
      "Complete package with flight reservation and hotel booking for comprehensive visa documentation.",
    price: 35,
    currencies: "35 USD | 2750 INR | 128 AED | 30 EUR | 26.70 GBP",
    features: [
      "Actual reservation from airline/hotel",
      "Verifiable on airline/hotel website",
      "Accommodation up to one month",
      "Up to 4 changes allowed",
      "Use for visa application/ proof of return",
    ],
    popular: true,
    image: "/luxury-hotel-lobby-modern.jpg",
  },
  {
    id: "return-ticket",
    name: "DUMMY RETURN TICKET",
    description:
      "Round-trip flight reservation for proof of return. Accepted by immigration worldwide.",
    price: 15,
    currencies: "15 USD | 990 INR | 55 AED | 14 EUR | 12.50 GBP",
    features: [
      "Return ticket for showing in immigration",
      "Verifiable flight reservation with PNR",
      "Can be used to show as proof of return or onward travel in most countries",
    ],
    popular: false,
    image: "/airport-departure-board-international.jpg",
  },
  {
    id: "ticket-receipt",
    name: "TICKET WITH E-RECEIPT",
    description:"Flight reservation with official e-ticket receipt for enhanced verification and credibility.",
    price: 49,
    currencies: "49 USD | 3850 INR | 180 AED | 42 EUR | 37.50 GBP",
    features: [
      "E-ticket included",
      "Official receipt",
      "Enhanced verification",
      "Premium service with priority support",
    ],
    popular: false,
    image: "/airline-ticket-document-professional.jpg",
  },
  {
    id: "past-dated",
    name: "PAST DATED TICKETS",
    description:"Historical flight reservations for special requirements and backdated documentation needs.",
    price: 35,
    currencies: "35 USD | 2750 INR | 128 AED | 30 EUR | 26.70 GBP",
    features: [
      "Custom dates",
      "Backdated tickets",
      "Special requests handled",
      "Expert support included",
    ],
    popular: false,
    image: "/calendar-travel-planning-professional.jpg",
  },
  {
    id: "hotel-only",
    name: "HOTEL BOOKING ONLY",
    description:"Standalone hotel reservation for visa applications with worldwide hotel coverage.",
    price: 20,
    currencies: "20 USD | 1570 INR | 73 AED | 17 EUR | 15.30 GBP",
    features: [
      "Hotel confirmation",
      "Verifiable booking",
      "Flexible duration",
      "Worldwide hotels available",
    ],
    popular: false,
    image: "/hotel-room-booking-luxury.jpg",
  },
];
