/**
 * OrdersView.js — Orders Overview page
 *
 * This page shows:
 *   - Stat cards: total revenue, total orders, unique customers
 *   - A bar/line chart of monthly revenue over time
 *   - A bar chart of revenue by city/state
 *   - A date range filter
 *
 * The data fetching is already wired up.
 * Your job: implement the UI — charts, stat cards, and layout.
 *
 * Useful libraries already installed:
 *   - recharts: BarChart, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Navbar from '../components/Navbar';
import { getSummary, getOrders, getCities } from '../utils/api';
import { useCurrency, CURRENCIES } from '../utils/CurrencyContext';

export default function OrdersView() {
  const [startDate, setStartDate] = useState('2022-01-01');
  const [endDate,   setEndDate]   = useState('2022-12-31');
  const [summary,   setSummary]   = useState(null);
  const [orders,    setOrders]    = useState([]);
  const [cities,    setCities]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const { currency } = useCurrency();
  const { symbol, rate } = CURRENCIES[currency];

  function formatCurrency(val) {
    if (val == null) return `${symbol}0.00`;
    const converted = Number(val) * rate;
    return `${symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function formatCompactCurrency(val) {
    if (!val) return `${symbol}0`;
    const converted = val * rate;
    if (converted >= 1_000_000) return `${symbol}${(converted / 1_000_000).toFixed(1)}M`;
    if (converted >= 1_000)     return `${symbol}${(converted / 1_000).toFixed(0)}K`;
    return `${symbol}${converted.toFixed(2)}`;
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, o, c] = await Promise.all([
        getSummary(),
        getOrders(startDate, endDate),
        getCities(startDate, endDate),
      ]);
      setSummary(s);
      setOrders(o);
      setCities(c);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="page">

        {/* ── Filter bar ─────────────────────────────────────────────────── */}
        <div className="filter-bar">
          <label>From</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <label>To</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <button className="btn-apply" onClick={loadData}>Apply</button>
        </div>

        {/* ── Error state ────────────────────────────────────────────────── */}
        {error && (
          <div style={{ color: '#C62828', padding: 16, background: '#FFEBEE', borderRadius: 8, marginBottom: 16 }}>
            Error: {error}
          </div>
        )}

        {/* ── Loading state ──────────────────────────────────────────────── */}
        {loading && <div className="loading">Loading orders data…</div>}

        {/* ── TODO: Build the UI here ────────────────────────────────────── */}
        {!loading && !error && (
          <>
            {/* ── Stat cards ─────────────────────────────────────────────── */}
            <div className="stat-row">
              <div className="stat-box">
                <div className="label">Total Revenue</div>
                <div className="value">{summary ? formatCurrency(summary.total_revenue) : '$0.00'}</div>
              </div>
              <div className="stat-box">
                <div className="label">Total Orders</div>
                <div className="value">{summary ? Number(summary.total_orders).toLocaleString() : 0}</div>
              </div>
              <div className="stat-box">
                <div className="label">Unique Customers</div>
                <div className="value">{summary ? Number(summary.unique_customers).toLocaleString() : 0}</div>
              </div>
            </div>

            {/* ── Monthly revenue chart ───────────────────────────────────── */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="section-title" style={{ marginBottom: 16 }}>Monthly Revenue</div>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orders} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month_name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                    <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} tickFormatter={formatCompactCurrency} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [formatCurrency(value), 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Revenue by city chart ───────────────────────────────────── */}
            <div className="card">
              <div className="section-title" style={{ marginBottom: 16 }}>Revenue by City (Top 10)</div>
              <div style={{ width: '100%', height: 360 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={cities.slice(0, 10).map(c => ({ ...c, location: `${c.city}, ${c.state}` }))}
                    margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} tickFormatter={formatCompactCurrency} />
                    <YAxis type="category" dataKey="location" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} width={120} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [formatCurrency(value), 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="var(--blue)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
