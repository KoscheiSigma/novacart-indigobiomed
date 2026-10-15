import React, {createContext, useContext, useState } from 'react';

// Static conversion rates from USD. Replace with a live API if needed.
export const CURRENCIES = {
    USD: { symbol: '$', rate: 1.0    },
    EUR: { symbol: '€', rate: 0.92   },
    GBP: { symbol: '£', rate: 0.79   },
    CAD: { symbol: 'CA$', rate: 1.35 },
    JPY: { symbol: '¥', rate: 149.50 },
};

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
    const [currency, setCurrency] = useState(
        () => localStorage.getItem('nc-currency') || 'USD'
    );

    function selectCurrency(code) {
        localStorage.setItem('nc-currency', code);
        setCurrency(code);
    }

    return (
        <CurrencyContext.Provider value={{ currency, selectCurrency, currencies: CURRENCIES }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export const useCurrency = () => useContext(CurrencyContext);