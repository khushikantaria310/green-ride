import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'], 
  reconnectionDelay: 1000,
});

// 🛠️ Improved fetch helper to catch real server errors (like Insufficient Balance)
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Network error");
  return data;
};

export const useStations = () => {
  return useQuery({
    queryKey: ['stations'],
    queryFn: () => fetchWithAuth('/stations'),
  });
};

export const useMyBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => fetchWithAuth('/bookings'),
    retry: false
  });
};

export const useMyTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => fetchWithAuth('/transactions'),
    retry: false
  });
};

export const useMyProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => fetchWithAuth('/users/me'),
    retry: false
  });
};

// 🔥 NEW: Mutation to actually CREATE a booking in the DB
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stationId: string) => fetchWithAuth('/bookings', {
      method: 'POST',
      body: JSON.stringify({ stationId }),
    }),
    onSuccess: () => {
      // Refresh everything so the map and wallet update instantly
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['stations'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success("Node Secured! Your battery is reserved.");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });
};

export const useAdminStats = (isAdmin: boolean) => {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: () => fetchWithAuth('/admin/stats'),
    enabled: isAdmin,
    retry: false
  });
};

export const useNetworkSocket = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    socket.on('connect', () => console.log('⚡ Connected to GreenRide Live Grid'));

    socket.on('grid_update', (data) => {
      console.log('🔄 Grid update received:', data.message);
      queryClient.invalidateQueries({ queryKey: ['stations'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    });

    return () => {
      socket.off('connect');
      socket.off('grid_update');
    };
  }, [queryClient]);
  
  return null; 
};
