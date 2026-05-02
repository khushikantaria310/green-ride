import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { api } from '../lib/api';

// ==========================================
// 4.3: TANSTACK QUERY HOOKS
// ==========================================

export const useStations = () => {
  return useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      // 🐛 FIX 1: Point directly to your backend's actual nearby route
      const { data } = await api.get('/api/stations/nearby?lat=12.9716&lon=77.5946');
      return data;
    }
  });
};

export const useStation = (stationId: string | null) => {
  return useQuery({
    queryKey: ['station', stationId],
    queryFn: async () => {
      // Adjusted to include the /api/ prefix based on your backend structure
      const { data } = await api.get(`/api/stations/${stationId}`);
      return data;
    },
    enabled: !!stationId, // Only run if we actually have an ID
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

// ==========================================
// 4.2: REAL-TIME SOCKET CONNECTION
// ==========================================

export const useNetworkSocket = () => {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 1. Connect to FastAPI Socket.IO
    socketRef.current = io(api.defaults.baseURL as string, {
      transports: ['websocket'],
    });

    // 2. Listen for Python emitting 'availability_update'
    socketRef.current.on('availability_update', (updates: any) => {
      console.log('⚡ Live node update received:', updates);
      
      // 3. MAGIC: Optimistically update the Map Data Cache!
      queryClient.setQueryData(['stations'], (oldData: any[]) => {
        if (!oldData) return oldData;
        
        // 🐛 FIX 2: Handle the array payload your Python backend sends [{id: 1, slots: 4}]
        if (Array.isArray(updates)) {
           return oldData.map((station) => {
             const update = updates.find((u: any) => u.id === station.id);
             return update ? { ...station, available_slots: update.slots } : station;
           });
        }
        
        // Fallback if backend sends a single object
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
