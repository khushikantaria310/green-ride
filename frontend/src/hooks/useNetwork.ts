import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { api } from '../lib/api';

// ==========================================
// TANSTACK QUERY HOOKS (Existing)
// ==========================================

export const useStations = () => {
  return useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      const { data } = await api.get('/api/stations/nearby?lat=12.9716&lon=77.5946');
      return data;
    }
  });
};

export const useStation = (stationId: string | null) => {
  return useQuery({
    queryKey: ['station', stationId],
    queryFn: async () => {
      const { data } = await api.get(`/api/stations/${stationId}`);
      return data;
    },
    enabled: !!stationId, 
  });
};

export const useMyBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data } = await api.get('/api/users/me/bookings');
      return data;
    }
  });
};

export const useMyTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data } = await api.get('/api/users/me/transactions');
      return data;
    }
  });
};

export const useMyProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/api/users/me');
      return data;
    }
  });
};

// ==========================================
// MUTATIONS (4.7 & 4.8 Fixes)
// ==========================================

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: async (stationId: number) => {
      const { data } = await api.post(`/api/bookings?station_id=${stationId}`);
      return data;
    },
    onError: (error: any) => {
      // 🚨 Catches 400 Race Condition Error
      alert(error.response?.data?.detail || "Failed to book station. Someone might have just taken the last slot!");
    }
  });
};

export const useProcessPayment = () => {
  return useMutation({
    mutationFn: async (bookingId: number) => {
      const { data } = await api.post(`/api/payments?booking_id=${bookingId}`);
      return data;
    },
    onError: (error: any) => {
      // 💸 Catches 402 Payment Failure Error
      alert(error.response?.data?.detail || "Payment failed. Please retry.");
    }
  });
};

// ==========================================
// REAL-TIME SOCKET CONNECTION (Hardened)
// ==========================================

export const useNetworkSocket = () => {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(api.defaults.baseURL as string, {
      // 🔥 FIX 2: Enable polling fallback and aggressive reconnection
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity, // Keep trying until the Railway server wakes up
      reconnectionDelay: 2000,        // Wait 2 seconds between attempts
      reconnectionDelayMax: 10000,    // Don't wait longer than 10 seconds
      timeout: 20000,
    });

    // 🔥 FIX 2: Listen for drops and force manual reconnect if server-initiated
    socketRef.current.on('disconnect', (reason) => {
      console.warn(`[Grid Telemetry] Socket disconnected: ${reason}`);
      if (reason === 'io server disconnect' && socketRef.current) {
        socketRef.current.connect();
      }
    });

    socketRef.current.on('availability_update', (updates: any) => {
      queryClient.setQueryData(['stations'], (oldData: any[]) => {
        if (!oldData) return oldData;
        
        if (Array.isArray(updates)) {
           return oldData.map((station) => {
             const update = updates.find((u: any) => u.id === station.id);
             return update ? { ...station, available_slots: update.slots } : station;
           });
        }
        
        return oldData.map((station) => 
          station.id === updates.station_id 
            ? { ...station, available_slots: updates.available_slots }
            : station
        );
      });
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [queryClient]);

  return socketRef.current;
};
