import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Navigation, 
  ArrowUp, 
  ArrowLeft, 
  ArrowRight, 
  MapPin, 
  Timer,
  Camera,
  Scan
} from 'lucide-react';
import { ARRoute } from '@/types/parking';

interface ARInterfaceProps {
  route?: ARRoute;
  isActive: boolean;
  onStartNavigation: () => void;
  onStopNavigation: () => void;
  currentStep?: number;
  destinationSlot?: string;
}

export const ARInterface: React.FC<ARInterfaceProps> = ({
  route,
  isActive,
  onStartNavigation,
  onStopNavigation,
  currentStep = 0,
  destinationSlot
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [scanningActive, setScanningActive] = useState(false);

  useEffect(() => {
    if (isActive) {
      setCameraActive(true);
      setScanningActive(true);
    } else {
      setCameraActive(false);
      setScanningActive(false);
    }
  }, [isActive]);

  const currentWaypoint = route?.waypoints[currentStep];
  const totalSteps = route?.waypoints.length || 0;
  const remainingTime = route ? Math.max(0, route.estimatedTime - currentStep * 30) : 0;

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'left':
        return <ArrowLeft className="w-8 h-8" />;
      case 'right':
        return <ArrowRight className="w-8 h-8" />;
      case 'straight':
      case 'forward':
      default:
        return <ArrowUp className="w-8 h-8" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isActive) {
    return (
      <Card className="glass-card p-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <Camera className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold">AR Navigation Ready</h3>
          <p className="text-muted-foreground">
            Start AR navigation to find your assigned parking slot with real-time guidance
          </p>
          <Button 
            onClick={onStartNavigation}
            className="w-full glow-primary"
            size="lg"
          >
            <Navigation className="w-5 h-5 mr-2" />
            Start AR Navigation
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* AR Camera View Simulation */}
      <Card className="glass-card p-4 relative overflow-hidden">
        <div className="aspect-video bg-black/50 rounded-lg relative">
          {/* Simulated camera view */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30">
            {scanningActive && (
              <div className="scan-line absolute inset-0"></div>
            )}
            
            {/* AR Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-32 h-32 border-4 border-primary rounded-full flex items-center justify-center animate-pulse-glow mb-4">
                  {currentWaypoint && getDirectionIcon(currentWaypoint.direction)}
                </div>
                
                {destinationSlot && (
                  <Badge className="bg-primary/90 text-primary-foreground text-lg px-4 py-2">
                    Slot {destinationSlot}
                  </Badge>
                )}
              </div>
            </div>

            {/* Distance indicator */}
            <div className="absolute top-4 left-4 right-4">
              <div className="glass-card p-2 text-center">
                <div className="text-primary text-2xl font-bold">
                  {route ? `${Math.max(1, route.distance - currentStep * 10)}m` : '0m'}
                </div>
                <div className="text-xs text-muted-foreground">to destination</div>
              </div>
            </div>

            {/* Scanning indicator */}
            <div className="absolute bottom-4 left-4">
              <Badge variant="outline" className="glow-accent">
                <Scan className="w-4 h-4 mr-2 animate-spin" />
                Scanning Environment
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Instructions */}
      {currentWaypoint && (
        <Card className="glass-card p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              {getDirectionIcon(currentWaypoint.direction)}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg">{currentWaypoint.instruction}</h4>
              <p className="text-muted-foreground">
                Step {currentStep + 1} of {totalSteps}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-primary">
                <Timer className="w-4 h-4" />
                <span className="font-mono">{formatTime(remainingTime)}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Progress Bar */}
      <Card className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Navigation Progress</span>
          <span className="text-sm font-medium">
            {Math.round(((currentStep + 1) / totalSteps) * 100)}%
          </span>
        </div>
        <div className="w-full bg-muted/30 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500 glow-primary"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          ></div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          onClick={onStopNavigation}
          className="w-full"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Stop Navigation
        </Button>
        <Button 
          className="w-full glow-accent"
        >
          <Scan className="w-4 h-4 mr-2" />
          Recalibrate AR
        </Button>
      </div>
    </div>
  );
};