import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'], 
  reconnectionDelay: 1000,
});

const fetchWithAuth = async (endpoint: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
};

export const useStations = () => {
  return useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/stations`);
      if (!res.ok) throw new Error("Failed to fetch stations");
      return res.json();
    }
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

// 🔥 NEW: Fetch Admin Stats (Only runs if isAdmin is true!)
export const useAdminStats = (isAdmin: boolean) => {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: () => fetchWithAuth('/admin/stats'),
    enabled: isAdmin, // Will not even try to fetch if not an Admin
    retry: false
  });
};

export const useNetworkSocket = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    socket.on('connect', () => console.log('⚡ Connected to GreenRide Live Grid'));

    socket.on('grid_update', () => {
      console.log('🔄 Grid state changed! Force refreshing UI...');
      queryClient.invalidateQueries({ queryKey: ['stations'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] }); // Refresh admin stats too!
    });

    return () => {
      socket.off('connect');
      socket.off('grid_update');
    };
  }, [queryClient]);
  
  return null; 
};
