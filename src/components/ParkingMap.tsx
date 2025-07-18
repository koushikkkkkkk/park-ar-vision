import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ParkingSlot } from '@/types/parking';
import { SlotDetails } from '@/components/SlotDetails';
import { Car, Navigation, Zap, Accessibility, Check, X, Filter } from 'lucide-react';

interface ParkingMapProps {
  slots: ParkingSlot[];
  selectedSlot?: string;
  onSlotSelect?: (slotId: string | null) => void;
  onSlotConfirm?: (slotId: string) => void;
  userPosition?: { x: number; y: number };
  routingTo?: string;
  isARMode?: boolean;
  isConfirming?: boolean;
}

export const ParkingMap: React.FC<ParkingMapProps> = ({
  slots,
  selectedSlot,
  onSlotSelect,
  onSlotConfirm,
  userPosition,
  routingTo,
  isARMode = false,
  isConfirming = false
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

  const handleSlotClick = (slot: ParkingSlot) => {
    if (slot.status !== 'available' && slot.status !== 'assigned') return;
    
    // If clicking the same slot that's already selected, deselect it
    if (selectedSlot === slot.id) {
      onSlotSelect?.(null);
    } else if (slot.status === 'available') {
      // Only allow selecting available slots
      onSlotSelect?.(slot.id);
    }
  };

  // Generate realistic parking lot layout
  const gridCols = 12;
  const gridRows = 10;

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

        {/* Generate realistic parking layout */}
        {Array.from({ length: gridCols * gridRows }, (_, index) => {
          const x = index % gridCols;
          const y = Math.floor(index / gridCols);
          
          // Create realistic driving lanes and parking sections
          const isMainDrivingLane = y === 4; // Main horizontal lane
          const isVerticalLane = x === 3 || x === 8; // Vertical lanes
          const isEntrance = (x === 0 && y === 4) || (x === 11 && y === 4);
          const isCornerSpace = (x === 3 && y === 4) || (x === 8 && y === 4);
          
          // Define parking sections
          const getSection = () => {
            if (x < 3) return 'A';
            if (x > 3 && x < 8) return 'B'; 
            if (x > 8) return 'C';
            return '';
          };
          
          if (isEntrance) {
            return (
              <div 
                key={`entrance-${index}`}
                className="bg-gradient-to-r from-primary/20 to-transparent rounded border-2 border-primary/40 flex items-center justify-center relative"
              >
                <span className="text-xs font-bold text-primary">
                  {x === 0 ? 'ENTRY' : 'EXIT'}
                </span>
              </div>
            );
          }
          
          if (isMainDrivingLane || isVerticalLane || isCornerSpace) {
            return (
              <div 
                key={`lane-${index}`}
                className="bg-muted/10 rounded border border-dashed border-muted/30 flex items-center justify-center relative"
              >
                {isMainDrivingLane && !isVerticalLane && !isCornerSpace && (
                  <div className="flex space-x-1">
                    <div className="w-0.5 h-6 bg-muted/40 rounded"></div>
                    <div className="w-0.5 h-6 bg-muted/40 rounded"></div>
                  </div>
                )}
                {isVerticalLane && !isMainDrivingLane && (
                  <div className="flex flex-col space-y-1">
                    <div className="w-6 h-0.5 bg-muted/40 rounded"></div>
                    <div className="w-6 h-0.5 bg-muted/40 rounded"></div>
                  </div>
                )}
              </div>
            );
          }

          // Generate slot with section-based numbering
          const section = getSection();
          const sectionIndex = Math.floor(Math.random() * 99) + 1;
          const slotTypes = ['regular', 'electric', 'disabled'];
          const randomType = slotTypes[Math.floor(Math.random() * slotTypes.length)];
          const isElectric = randomType === 'electric' && Math.random() > 0.85;
          const isDisabled = randomType === 'disabled' && Math.random() > 0.9;
          
          const slot = slots.find(s => s.x === x && s.y === y) || {
            id: `slot-${section}${sectionIndex}`,
            lotId: 'lot-1',
            number: `${section}${sectionIndex.toString().padStart(2, '0')}`,
            status: Math.random() > 0.65 ? 'occupied' : 'available',
            x,
            y,
            floor: 1,
            type: isElectric ? 'electric' : isDisabled ? 'disabled' : 'regular',
            section,
            distanceFromEntrance: Math.abs(x - 0) + Math.abs(y - 4) // Distance from entrance
          } as ParkingSlot;

          return (
            <div
              key={slot.id}
              className={getSlotClass(slot)}
              style={{ aspectRatio: '1' }}
              onClick={() => handleSlotClick(slot)}
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

      {/* Slot Confirmation with Details */}
      {selectedSlot && !routingTo && (
        <div className="mt-6 space-y-4">
          <SlotDetails 
            slot={slots.find(s => s.id === selectedSlot)!} 
            userPosition={userPosition}
          />
          <Card className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold">Ready to Confirm?</h3>
                <p className="text-sm text-muted-foreground">
                  This slot will be reserved for you and navigation will begin
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSlotSelect?.(null)}
                  disabled={isConfirming}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => selectedSlot && onSlotConfirm?.(selectedSlot)}
                  disabled={isConfirming}
                  className="glow-primary"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {isConfirming ? 'Confirming...' : 'Confirm & Navigate'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Enhanced Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
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
        <Card className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {slots.filter(s => s.type === 'electric').length}
          </div>
          <div className="text-sm text-muted-foreground">Electric</div>
        </Card>
        <Card className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {slots.filter(s => s.type === 'disabled').length}
          </div>
          <div className="text-sm text-muted-foreground">Accessible</div>
        </Card>
      </div>

      {/* Section Quick Nav */}
      <div className="flex gap-2 mt-4 justify-center">
        {['A', 'B', 'C'].map(section => (
          <Button
            key={section}
            variant="outline"
            size="sm"
            className="glass-card"
            onClick={() => {
              const sectionSlots = slots.filter(s => s.section === section && s.status === 'available');
              if (sectionSlots.length > 0) {
                const nearestSlot = sectionSlots.reduce((closest, slot) => 
                  slot.distanceFromEntrance < closest.distanceFromEntrance ? slot : closest
                );
                onSlotSelect?.(nearestSlot.id);
              }
            }}
          >
            Section {section} ({slots.filter(s => s.section === section && s.status === 'available').length})
          </Button>
        ))}
      </div>
    </div>
  );
};