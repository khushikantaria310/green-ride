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
    // 🔥 Replaces Socket.io: Auto-refreshes map data every 5 seconds!
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
    // 🔥 Instantly updates the UI shortly after you make a payment
    refetchInterval: 3000 
  });
};

// ==========================================
// PHASE 2 FALLBACKS (To prevent UI crashes)
// ==========================================

export const useMyTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      return []; // We will build the transaction DB in Phase 3
    }
  });
};

export const useMyProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      // Returns the Admin user we just injected via Prisma Studio
      return {
        email: "admin@greenride.com",
        role: "OPERATOR",
        balance: 2450.00
      }; 
    }
  });
};

// ==========================================
// GRACEFUL SOCKET STUB
// ==========================================
// We keep this hook so App.tsx doesn't break, but we disable the 
// actual socket connection since Express isn't running it yet.
export const useNetworkSocket = () => {
  useEffect(() => {
    console.log("⚡ Grid Telemetry initialized (TanStack Polling active instead of WebSockets).");
  }, []);
  
  return null; 
};
