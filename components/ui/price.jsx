"use client"

import { useCurrency } from "@/contexts/currency-context"

/**
 * A scalable component to display prices consistently across the app.
 * Automatically handles currency conversion, symbol display, and formatting.
 * 
 * @param {number} amount - The amount in USD to be converted and displayed.
 * @param {boolean} showSymbol - Whether to show the currency symbol (default: true).
 * @param {string} className - Optional CSS classes for styling.
 */
export function Price({ amount, showSymbol = true, className = "" }) {
    const { formatPrice } = useCurrency()

    return (
        <span className={className}>
            {formatPrice(amount, showSymbol)}
        </span>
    )
}
