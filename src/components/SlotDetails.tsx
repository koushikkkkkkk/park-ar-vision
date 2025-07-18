import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ParkingSlot } from '@/types/parking';
import { Car, Zap, Accessibility, MapPin, Clock, Route } from 'lucide-react';

interface SlotDetailsProps {
  slot: ParkingSlot;
  userPosition?: { x: number; y: number };
}

export const SlotDetails: React.FC<SlotDetailsProps> = ({ slot, userPosition }) => {
  const getSlotIcon = () => {
    switch (slot.type) {
      case 'electric':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'disabled':
        return <Accessibility className="w-4 h-4 text-blue-400" />;
      default:
        return <Car className="w-4 h-4" />;
    }
  };

  const getSlotTypeColor = () => {
    switch (slot.type) {
      case 'electric':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'disabled':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const calculateDistance = () => {
    if (!userPosition) return null;
    const distance = Math.sqrt(
      Math.pow(slot.x - userPosition.x, 2) + Math.pow(slot.y - userPosition.y, 2)
    );
    return Math.round(distance * 10); // Convert to meters (approximate)
  };

  const estimateWalkTime = () => {
    const distance = calculateDistance();
    if (!distance) return null;
    return Math.max(1, Math.round(distance / 50)); // Approximate walking speed
  };

  const distance = calculateDistance();
  const walkTime = estimateWalkTime();

  return (
    <Card className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center ${getSlotTypeColor()}`}>
            {getSlotIcon()}
          </div>
          <div>
            <h3 className="font-bold text-lg">Slot {slot.number}</h3>
            <p className="text-sm text-muted-foreground">Section {slot.section}</p>
          </div>
        </div>
        <Badge variant="outline" className={getSlotTypeColor()}>
          {slot.type === 'electric' ? 'Electric' : slot.type === 'disabled' ? 'Accessible' : 'Regular'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {distance && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <div>
              <div className="text-sm font-medium">{distance}m away</div>
              <div className="text-xs text-muted-foreground">Distance</div>
            </div>
          </div>
        )}
        
        {walkTime && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <div>
              <div className="text-sm font-medium">{walkTime} min walk</div>
              <div className="text-xs text-muted-foreground">Estimated</div>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Route className="w-4 h-4 text-primary" />
          <div>
            <div className="text-sm font-medium">Floor {slot.floor}</div>
            <div className="text-xs text-muted-foreground">Level</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-primary" />
          <div>
            <div className="text-sm font-medium capitalize">{slot.status}</div>
            <div className="text-xs text-muted-foreground">Status</div>
          </div>
        </div>
      </div>

      {slot.type === 'electric' && (
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-yellow-400">EV charging available</span>
        </div>
      )}

      {slot.type === 'disabled' && (
        <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <Accessibility className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-400">Wheelchair accessible</span>
        </div>
      )}
    </Card>
  );
};