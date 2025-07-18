export interface ParkingSlot {
  id: string;
  lotId: string;
  number: string;
  status: 'available' | 'occupied' | 'assigned' | 'reserved';
  x: number;
  y: number;
  floor: number;
  type: 'regular' | 'disabled' | 'electric' | 'compact';
  assignedTo?: string;
  occupiedSince?: Date;
  assignedAt?: Date;
}

export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  totalSlots: number;
  availableSlots: number;
  floors: number;
  qrCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface UserSession {
  id: string;
  userId: string;
  lotId: string;
  slotId?: string;
  entryTime: Date;
  exitTime?: Date;
  status: 'entered' | 'assigned' | 'parked' | 'shopping' | 'returning' | 'exited';
  qrToken: string;
}

export interface ARRoute {
  id: string;
  sessionId: string;
  waypoints: Array<{
    x: number;
    y: number;
    floor: number;
    instruction: string;
    direction: 'forward' | 'left' | 'right' | 'straight';
  }>;
  estimatedTime: number;
  distance: number;
}