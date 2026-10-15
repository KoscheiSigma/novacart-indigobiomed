import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './utils/ThemeContext';
import OrdersView   from './pages/OrdersView';
import ProductsView from './pages/ProductsView';
import CustomersView from './pages/CustomersView';
import './App.css';
import { CurrencyProvider } from './utils/CurrencyContext';

export default function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"          element={<Navigate to="/orders" replace />} />
            <Route path="/orders"    element={<OrdersView />} />
            <Route path="/products"  element={<ProductsView />} />
            <Route path="/customers" element={<CustomersView />} />
            <Route path="*"          element={<Navigate to="/orders" replace />} />
          </Routes>
        </BrowserRouter>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
