import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

// 🔥 Pointing directly to our new Express server
const API_URL = 'http://localhost:5000/api';

// ==========================================
// TANSTACK QUERY HOOKS (Wired to PostgreSQL)
// ==========================================

export const useStations = () => {
  return useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/stations`);
      if (!res.ok) throw new Error("Failed to fetch stations");
      return res.json();
    },
    // Auto-refreshes map data every 5 seconds
    refetchInterval: 5000 
  });
};

export const useMyBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/bookings`);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
    // Instantly updates the UI shortly after you make a payment
    refetchInterval: 3000 
  });
};

// 🔥 PHASE 3: REAL FINANCIAL LEDGER
export const useMyTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/transactions`);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
    // Auto-updates the History tab when a payment goes through
    refetchInterval: 3000 
  });
};

// 🔥 PHASE 3: REAL WALLET BALANCE
export const useMyProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/users/me`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    // Watch your balance drop in real-time!
    refetchInterval: 3000 
  });
};

// ==========================================
// GRACEFUL SOCKET STUB
// ==========================================
// We keep this hook so App.tsx doesn't break, but we disable the 
// actual socket connection until we build out true WebSockets later in Phase 3.
export const useNetworkSocket = () => {
  useEffect(() => {
    console.log("⚡ Grid Telemetry initialized (TanStack Polling active instead of WebSockets).");
  }, []);
  
  return null; 
};
