export const planConfigId: Record<string, { name: string, type: 'sub' | 'pkg', limit: number, days?: number }> = {
    // Chiavi basate sugli ID Stripe (per integrazioni future)
    "price_1TdpVXPf9BDNyCapRO9apxU0": { name: "Scale", type: 'sub', limit: 50 },
    "price_1TdpUqPf9BDNyCaphUprM3xC": { name: "Growth", type: 'sub', limit: 10 },
    "price_1TdRTrPf9BDNyCapNvDt0Cxt": { name: "Essential", type: 'sub', limit: 3 },
    "price_1TgLu5Pf9BDNyCap2F80yOph": { name: "Solo Start", type: 'sub', limit: 10, days: 30},
    "price_1TdpTlPf9BDNyCapsKtthz8K": { name: "Business flow", type: 'pkg', limit: 12, days: 365 },
    "price_1TdpSEPf9BDNyCapTpA1yPPY": { name: "Flexi pack", type: 'pkg', limit: 5, days: 180 },
    "price_1TdRUfPf9BDNyCap2gvWBsOm": { name: "Quick start", type: 'pkg', limit: 1, days: 14 },
}

export const planConfigName: Record<string, { name: string, type: 'sub' | 'pkg', limit: number, days?: number }> = {
    // Chiavi basate sui nomi nel DB (per far funzionare il tuo codice attuale)
    "Scale": { name: "Scale", type: 'sub', limit: 50 },
    "Growth": { name: "Growth", type: 'sub', limit: 10 },
    "Essential": { name: "Essential", type: 'sub', limit: 3 },
    "Solo Start": { name: "Solo Starer", type: 'sub', limit: 3 },
    "Business flow": { name: "Business flow", type: 'pkg', limit: 12, days: 365 },
    "Flexi pack": { name: "Flexi pack", type: 'pkg', limit: 5, days: 180 },
    "Quick start": { name: "Quick start", type: 'pkg', limit: 1, days: 14 },
};