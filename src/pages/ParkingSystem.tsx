import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ParkingMap } from '@/components/ParkingMap';
import { ARInterface } from '@/components/ARInterface';
import { AdminPanel } from '@/components/AdminPanel';
import { 
  QrCode, 
  MapPin, 
  Navigation, 
  Settings,
  Car,
  Clock,
  Smartphone,
  Shield
} from 'lucide-react';
import { ParkingSlot, ParkingLot, UserSession, ARRoute } from '@/types/parking';
import { toast } from 'sonner';

export const ParkingSystem = () => {
  const [searchParams] = useSearchParams();
  const qrToken = searchParams.get('token');
  const isAdmin = searchParams.get('admin') === 'true';

  // State management
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [isARActive, setIsARActive] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<ARRoute | null>(null);
  const [userPosition, setUserPosition] = useState({ x: 1, y: 7 });
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);

  // Mock data - in real app this would come from Supabase
  const [parkingLots] = useState<ParkingLot[]>([
    {
      id: 'lot-1',
      name: 'SmartPark Central',
      address: '123 Future Street, Tech City',
      totalSlots: 80,
      availableSlots: 23,
      floors: 1,
      qrCode: 'smartpark-central-qr',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    }
  ]);

  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);

  // Initialize slots
  useEffect(() => {
    const generateSlots = () => {
      const slots: ParkingSlot[] = [];
      let slotNumber = 1;
      
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 10; x++) {
          // Skip driving lanes
          const isDrivingLane = (x === 2 || x === 5 || x === 7) && (y === 2 || y === 5);
          if (isDrivingLane) continue;

          const statuses: ParkingSlot['status'][] = ['available', 'occupied', 'available', 'available'];
          const types: ParkingSlot['type'][] = ['regular', 'regular', 'electric', 'disabled'];
          
          slots.push({
            id: `slot-${slotNumber}`,
            lotId: 'lot-1',
            number: `A${slotNumber.toString().padStart(2, '0')}`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            x,
            y,
            floor: 1,
            type: Math.random() > 0.9 ? types[Math.floor(Math.random() * types.length)] : 'regular'
          });
          slotNumber++;
        }
      }
      return slots;
    };

    setParkingSlots(generateSlots());
  }, []);

  // Simulation effect
  useEffect(() => {
    if (!isSimulationRunning) return;

    const interval = setInterval(() => {
      setParkingSlots(prev => {
        const newSlots = [...prev];
        const randomIndex = Math.floor(Math.random() * newSlots.length);
        const currentSlot = newSlots[randomIndex];
        
        if (currentSlot.status === 'available') {
          currentSlot.status = 'occupied';
          toast.success(`Slot ${currentSlot.number} occupied`);
        } else if (currentSlot.status === 'occupied' && Math.random() > 0.7) {
          currentSlot.status = 'available';
          toast.info(`Slot ${currentSlot.number} became available`);
        }
        
        return newSlots;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulationRunning]);

  // Mock user session initialization
  useEffect(() => {
    if (qrToken && !isAdmin) {
      setCurrentUser({
        id: 'user-1',
        userId: 'user-123',
        lotId: 'lot-1',
        entryTime: new Date(),
        status: 'entered',
        qrToken: qrToken
      });
      toast.success('Welcome to SmartPark Central!');
    }
  }, [qrToken, isAdmin]);

  const handleSlotSelect = (slotId: string) => {
    const slot = parkingSlots.find(s => s.id === slotId);
    if (!slot || slot.status !== 'available') {
      toast.error('This slot is not available');
      return;
    }

    setSelectedSlot(slotId);
    
    // Update slot status to assigned
    setParkingSlots(prev => 
      prev.map(s => 
        s.id === slotId 
          ? { ...s, status: 'assigned', assignedTo: currentUser?.userId, assignedAt: new Date() }
          : s
      )
    );

    // Create mock route
    const slot_position = parkingSlots.find(s => s.id === slotId);
    if (slot_position) {
      const mockRoute: ARRoute = {
        id: 'route-1',
        sessionId: currentUser?.id || 'session-1',
        waypoints: [
          { x: userPosition.x, y: userPosition.y, floor: 1, instruction: 'Start walking forward', direction: 'forward' },
          { x: userPosition.x + 2, y: userPosition.y, floor: 1, instruction: 'Continue straight', direction: 'straight' },
          { x: slot_position.x, y: userPosition.y, floor: 1, instruction: 'Turn right towards your slot', direction: 'right' },
          { x: slot_position.x, y: slot_position.y, floor: 1, instruction: `You have arrived at slot ${slot_position.number}`, direction: 'forward' }
        ],
        estimatedTime: 120,
        distance: 50
      };
      setCurrentRoute(mockRoute);
    }

    toast.success(`Slot ${slot?.number} assigned to you!`);
  };

  const handleSlotUpdate = (slotId: string, status: ParkingSlot['status']) => {
    setParkingSlots(prev => 
      prev.map(s => 
        s.id === slotId 
          ? { ...s, status }
          : s
      )
    );
    toast.info('Slot status updated');
  };

  const startARNavigation = () => {
    setIsARActive(true);
    toast.success('AR Navigation activated!');
  };

  const stopARNavigation = () => {
    setIsARActive(false);
    toast.info('AR Navigation stopped');
  };

  const startSimulation = () => {
    setIsSimulationRunning(true);
    toast.success('Simulation started');
  };

  const stopSimulation = () => {
    setIsSimulationRunning(false);
    toast.info('Simulation stopped');
  };

  const resetSimulation = () => {
    setParkingSlots(prev => 
      prev.map(s => ({ ...s, status: 'available' }))
    );
    toast.success('All slots reset to available');
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-background p-4">
        <AdminPanel
          lots={parkingLots}
          slots={parkingSlots}
          onSlotUpdate={handleSlotUpdate}
          onSimulationStart={startSimulation}
          onSimulationStop={stopSimulation}
          onSimulationReset={resetSimulation}
          isSimulationRunning={isSimulationRunning}
        />
      </div>
    );
  }

  if (!qrToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="glass-card p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <QrCode className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">SmartPark System</h1>
            <p className="text-muted-foreground">
              Scan the QR code at the parking lot entrance to access the system
            </p>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={() => window.location.href = '?token=demo-entry-123'}
              className="w-full glow-primary"
              size="lg"
            >
              <Smartphone className="w-5 h-5 mr-2" />
              Simulate QR Scan
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '?admin=true'}
              className="w-full"
            >
              <Settings className="w-5 h-5 mr-2" />
              Admin Panel
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-accent" />
              <span>AR Guided</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              <span>Real-time</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-accent" />
              <span>Smart</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-glow">SmartPark Central</h1>
              <p className="text-muted-foreground">Futuristic Parking System</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="glow-accent">
                <MapPin className="w-4 h-4 mr-2" />
                Floor 1
              </Badge>
              {currentUser && (
                <Badge className="bg-primary/20">
                  Session: {currentUser.status}
                </Badge>
              )}
            </div>
          </div>
        </Card>

        <Tabs defaultValue="parking" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="parking">Parking Map</TabsTrigger>
            <TabsTrigger value="navigation">AR Navigation</TabsTrigger>
          </TabsList>

          <TabsContent value="parking" className="space-y-4">
            <ParkingMap
              slots={parkingSlots}
              selectedSlot={selectedSlot}
              onSlotSelect={handleSlotSelect}
              userPosition={userPosition}
              routingTo={selectedSlot}
              isARMode={isARActive}
            />
          </TabsContent>

          <TabsContent value="navigation" className="space-y-4">
            <ARInterface
              route={currentRoute}
              isActive={isARActive}
              onStartNavigation={startARNavigation}
              onStopNavigation={stopARNavigation}
              destinationSlot={parkingSlots.find(s => s.id === selectedSlot)?.number}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};