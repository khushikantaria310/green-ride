import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import BookingOverlay from '../components/BookingOverlay';

// Mock data for our simulated battery node
const mockStation = {
  id: 4,
  name: "Bandra Terminal",
  available_slots: 8,
  distance_km: 2.5
};

describe('BookingOverlay Component', () => {
  // 🧹 CRITICAL FIX: This clears the simulated screen after each test
  // so the buttons from Test 1 don't interfere with Test 2!
  afterEach(() => {
    cleanup();
  });

  it('renders the station data correctly', () => {
    render(
      <BookingOverlay 
        station={mockStation} 
        onClose={vi.fn()} 
        onConfirm={vi.fn()} 
      />
    );

    expect(screen.getByText('Bandra Terminal')).toBeDefined();
    const batteryIcons = screen.getAllByText('🔋');
    expect(batteryIcons).toHaveLength(8);
  });

  it('calls the onClose function when the cancel button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <BookingOverlay 
        station={mockStation} 
        onClose={handleClose} 
        onConfirm={vi.fn()} 
      />
    );

    const cancelButton = screen.getByRole('button', { name: '✕' });
    fireEvent.click(cancelButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls the onConfirm function when the reserve button is clicked', () => {
    const handleConfirm = vi.fn();
    render(
      <BookingOverlay 
        station={mockStation} 
        onClose={vi.fn()} 
        onConfirm={handleConfirm} 
      />
    );

    const reserveButton = screen.getByRole('button', { name: /authorize swap/i });
    fireEvent.click(reserveButton);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });
});
