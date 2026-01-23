import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const HEXARATE_URL = process.env.NEXT_PUBLIC_HEXARATE_API_URL;
const BASE_CURRENCY = process.env.NEXT_PUBLIC_BASE_CURRENCY || 'USD';
const TARGET_CURRENCIES = [
    'INR', 'AED', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'SGD',
    'SAR', 'NZD', 'KRW', 'BRL', 'ZAR', 'MXN', 'THB', 'RUB', 'HKD'
];

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('key');

    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const results = [];
        for (const target of TARGET_CURRENCIES) {
            try {
                const response = await fetch(`${HEXARATE_URL}/${BASE_CURRENCY}/${target}/latest`);
                if (!response.ok) {
                    console.error(`Failed to fetch rate for ${target}: ${response.statusText}`);
                    continue;
                }
                const result = await response.json();
                if (result.status_code === 200 && result.data) {
                    results.push({
                        base_currency: BASE_CURRENCY,
                        target_currency: target,
                        rate: result.data.mid,
                        last_updated: new Date().toISOString()
                    });
                }
            } catch (err) {
                console.error(`Error fetching ${target} rate:`, err);
            }
        }

        if (results.length === 0) {
            return NextResponse.json({ error: 'No rates fetched' }, { status: 500 });
        }

        // Upsert rates into Supabase
        const { error } = await supabaseAdmin
            .from('exchange_rates')
            .upsert(results, { onConflict: 'base_currency,target_currency' });

        if (error) {
            console.error('Database update error:', error);
            throw error;
        }

        return NextResponse.json({
            success: true,
            updated: results.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
