import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ParkingSlot } from '@/types/parking';
import { Car, Navigation, Zap, Accessibility } from 'lucide-react';

interface ParkingMapProps {
  slots: ParkingSlot[];
  selectedSlot?: string;
  onSlotSelect?: (slotId: string) => void;
  userPosition?: { x: number; y: number };
  routingTo?: string;
  isARMode?: boolean;
}

export const ParkingMap: React.FC<ParkingMapProps> = ({
  slots,
  selectedSlot,
  onSlotSelect,
  userPosition,
  routingTo,
  isARMode = false
}) => {
  const [animatingSlots, setAnimatingSlots] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (routingTo) {
      const interval = setInterval(() => {
        setAnimatingSlots(prev => {
          const newSet = new Set(prev);
          if (newSet.has(routingTo)) {
            newSet.delete(routingTo);
          } else {
            newSet.add(routingTo);
          }
          return newSet;
        });
      }, 800);

      return () => clearInterval(interval);
    }
  }, [routingTo]);

  const getSlotIcon = (slot: ParkingSlot) => {
    switch (slot.type) {
      case 'electric':
        return <Zap className="w-3 h-3" />;
      case 'disabled':
        return <Accessibility className="w-3 h-3" />;
      default:
        return <Car className="w-3 h-3" />;
    }
  };

  const getSlotClass = (slot: ParkingSlot) => {
    const baseClass = "relative flex items-center justify-center border-2 rounded-lg transition-all duration-300 cursor-pointer transform hover:scale-105";
    const isAnimating = animatingSlots.has(slot.id);
    const isSelected = selectedSlot === slot.id;
    
    let statusClass = "";
    switch (slot.status) {
      case 'available':
        statusClass = `slot-available ${isAnimating ? 'animate-pulse-glow' : ''}`;
        break;
      case 'occupied':
        statusClass = "slot-occupied";
        break;
      case 'assigned':
        statusClass = `slot-assigned ${isAnimating ? 'animate-pulse-glow' : ''}`;
        break;
      case 'reserved':
        statusClass = "slot-reserved";
        break;
    }

    const selectedClass = isSelected ? "ring-4 ring-primary scale-110" : "";
    
    return `${baseClass} ${statusClass} ${selectedClass}`;
  };

  // Generate grid layout
  const gridCols = 10;
  const gridRows = 8;

  return (
    <div className={`glass-card p-6 ${isARMode ? 'animate-scan' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-glow">Parking Map</h2>
        {isARMode && (
          <Badge variant="outline" className="glow-primary">
            <Navigation className="w-4 h-4 mr-2" />
            AR Mode
          </Badge>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 slot-available rounded border-2"></div>
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 slot-occupied rounded border-2"></div>
          <span className="text-sm">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 slot-assigned rounded border-2"></div>
          <span className="text-sm">Assigned</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 slot-reserved rounded border-2"></div>
          <span className="text-sm">Reserved</span>
        </div>
      </div>

      {/* Parking Grid */}
      <div 
        className="grid gap-2 mx-auto max-w-2xl relative"
        style={{ 
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gridTemplateRows: `repeat(${gridRows}, 1fr)`
        }}
      >
        {/* User position indicator */}
        {userPosition && (
          <div
            className="absolute w-6 h-6 bg-primary rounded-full border-4 border-white animate-pulse z-10 flex items-center justify-center"
            style={{
              left: `${(userPosition.x / gridCols) * 100}%`,
              top: `${(userPosition.y / gridRows) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}

        {/* Generate parking slots */}
        {Array.from({ length: gridCols * gridRows }, (_, index) => {
          const x = index % gridCols;
          const y = Math.floor(index / gridCols);
          
          // Skip some positions for driving lanes
          const isDrivingLane = (x === 2 || x === 5 || x === 7) && (y === 2 || y === 5);
          
          if (isDrivingLane) {
            return (
              <div 
                key={`lane-${index}`}
                className="bg-muted/20 rounded border border-muted/30 flex items-center justify-center"
              >
                <div className="w-1 h-8 bg-muted/50 rounded"></div>
              </div>
            );
          }

          const slot = slots.find(s => s.x === x && s.y === y) || {
            id: `slot-${index}`,
            lotId: 'lot-1',
            number: `A${index.toString().padStart(2, '0')}`,
            status: Math.random() > 0.7 ? 'occupied' : 'available',
            x,
            y,
            floor: 1,
            type: 'regular'
          } as ParkingSlot;

          return (
            <div
              key={slot.id}
              className={getSlotClass(slot)}
              style={{ aspectRatio: '1' }}
              onClick={() => onSlotSelect?.(slot.id)}
            >
              {getSlotIcon(slot)}
              <span className="absolute bottom-0 text-xs font-mono">
                {slot.number}
              </span>
              
              {/* Routing path indicator */}
              {routingTo === slot.id && (
                <div className="absolute inset-0 border-4 border-primary rounded-lg animate-pulse">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Your Slot
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Card className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {slots.filter(s => s.status === 'available').length}
          </div>
          <div className="text-sm text-muted-foreground">Available</div>
        </Card>
        <Card className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-red-400">
            {slots.filter(s => s.status === 'occupied').length}
          </div>
          <div className="text-sm text-muted-foreground">Occupied</div>
        </Card>
      </div>
    </div>
  );
};