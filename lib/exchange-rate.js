const API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_URL;

export const CURRENCY_SYMBOLS = {
    USD: '$',
    INR: '₹',
    AED: 'د.إ',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
    JPY: '¥',
    CNY: '¥',
    SGD: 'S$',
    SAR: '﷼',
    NZD: 'NZ$',
    KRW: '₩',
    BRL: 'R$',
    ZAR: 'R',
    MXN: 'MX$',
    THB: '฿',
    RUB: '₽',
    HKD: 'HK$'
};

/**
 * Fetches the latest exchange rates for a given base currency.
 * @param {string} baseCurrency - The base currency code (e.g., 'USD').
 * @returns {Promise<Object|null>} - The conversion rates object or null if error.
 */
export async function getExchangeRates(baseCurrency = 'USD') {
    try {
        if (!BASE_URL || !API_KEY) return null;
        const url = `${BASE_URL}/${API_KEY}/latest/${baseCurrency}`;

        const response = await fetch(url, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Exchange Rate API error: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`Exchange Rate API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.conversion_rates;
    } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        return null;
    }
}

/**
 * Converts a price from base currency to target currencies.
 * @param {number} price - The price in base currency.
 * @param {Object} rates - The conversion rates object.
 * @param {string[]} targetCurrencies - Array of target currency codes.
 * @returns {string} - Formatted price string.
 */
export function formatConvertedPrices(price, rates, targetCurrencies = ['INR', 'AED', 'EUR', 'GBP']) {
    if (!rates || !price) return '';

    return targetCurrencies.map(currency => {
        const rate = rates[currency];
        if (!rate) return null;

        const converted = price * rate;

        // Formatting logic based on currency
        // For INR, usually round to no decimals or 2? Example shows "1200 INR" (no decimals)
        // For AED, "70 AED" (no decimals)
        // For EUR, "16 EUR" (no decimals)
        // For GBP, "14.50 GBP" (2 decimals)

        let formattedPrice;
        if (currency === 'GBP') {
            formattedPrice = converted.toFixed(2);
        } else {
            formattedPrice = Math.round(converted).toString();
        }

        return `${formattedPrice} ${currency}`;
    }).filter(Boolean).join(' | ');
}
