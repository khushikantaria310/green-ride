import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

// 🔥 Initialize the WebSocket Connection explicitly to avoid connection drops
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'], // Force websocket first
  reconnectionDelay: 1000,
});

// Helper to grab the token from the browser's memory
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
      const res = await fetch(`${API_URL}/stations`); // Stations are public!
      if (!res.ok) throw new Error("Failed to fetch stations");
      return res.json();
    },
    // 🔥 Removed refetchInterval! We rely on WebSockets now.
  });
};

export const useMyBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => fetchWithAuth('/bookings'),
    retry: false
    // 🔥 Removed refetchInterval!
  });
};

export const useMyTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => fetchWithAuth('/transactions'),
    retry: false
    // 🔥 Removed refetchInterval!
  });
};

export const useMyProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => fetchWithAuth('/users/me'),
    retry: false
    // 🔥 Removed refetchInterval!
  });
};

// 🔥 THE REAL SOCKET LISTENER
export const useNetworkSocket = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    socket.on('connect', () => {
      console.log('⚡ Connected to GreenRide Live Grid');
    });

    // When the backend shouts "grid_update", we instantly refresh all queries!
    socket.on('grid_update', () => {
      console.log('🔄 Grid state changed! Force refreshing UI...');
      queryClient.invalidateQueries({ queryKey: ['stations'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    });

    return () => {
      socket.off('connect');
      socket.off('grid_update');
    };
  }, [queryClient]);
  
  return null; 
};
