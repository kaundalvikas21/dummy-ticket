import { supabase } from './supabase';

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
 * Fetches exchange rates from the database.
 * @param {string} baseCurrency - The base currency code (e.g., 'USD').
 * @returns {Promise<Object|null>} - The conversion rates object or null if error.
 */
export async function getExchangeRates(baseCurrency = 'USD') {
    try {
        const { data, error } = await supabase
            .from('exchange_rates')
            .select('target_currency, rate')
            .eq('base_currency', baseCurrency);

        if (error) {
            console.error('Failed to fetch exchange rates from database:', error);
            return null;
        }

        if (!data || data.length === 0) {
            console.warn('No exchange rates found in database. Make sure the cron job has run.');
            return null;
        }

        // Transform array into object format: { INR: 83.2, GBP: 0.78, ... }
        const rates = data.reduce((acc, curr) => {
            acc[curr.target_currency] = Number(curr.rate);
            return acc;
        }, {});

        // Add 1:1 rate for base currency
        rates[baseCurrency] = 1;

        return rates;
    } catch (error) {
        console.error('Failed to get exchange rates:', error);
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

        let formattedPrice;
        if (currency === 'GBP') {
            formattedPrice = converted.toFixed(2);
        } else {
            formattedPrice = Math.round(converted).toString();
        }

        return `${formattedPrice} ${currency}`;
    }).filter(Boolean).join(' | ');
}
