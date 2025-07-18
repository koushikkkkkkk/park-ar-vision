import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Car, 
  BarChart3, 
  Users, 
  MapPin,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2
} from 'lucide-react';
import { ParkingSlot, ParkingLot } from '@/types/parking';

interface AdminPanelProps {
  lots: ParkingLot[];
  slots: ParkingSlot[];
  onSlotUpdate: (slotId: string, status: ParkingSlot['status']) => void;
  onSimulationStart: () => void;
  onSimulationStop: () => void;
  onSimulationReset: () => void;
  isSimulationRunning: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  lots,
  slots,
  onSlotUpdate,
  onSimulationStart,
  onSimulationStop,
  onSimulationReset,
  isSimulationRunning
}) => {
  const [selectedLot, setSelectedLot] = useState<string>(lots[0]?.id || '');
  const [newLotName, setNewLotName] = useState('');

  const currentLot = lots.find(lot => lot.id === selectedLot);
  const lotSlots = slots.filter(slot => slot.lotId === selectedLot);

  const stats = {
    total: lotSlots.length,
    available: lotSlots.filter(s => s.status === 'available').length,
    occupied: lotSlots.filter(s => s.status === 'occupied').length,
    assigned: lotSlots.filter(s => s.status === 'assigned').length,
    reserved: lotSlots.filter(s => s.status === 'reserved').length
  };

  const occupancyRate = Math.round(((stats.total - stats.available) / stats.total) * 100);

  return (
    <div className="space-y-6">
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-glow flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Admin Panel
          </h2>
          <Badge variant="outline" className="glow-primary">
            Real-time Management
          </Badge>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="slots">Slots</TabsTrigger>
            <TabsTrigger value="simulation">Simulation</TabsTrigger>
            <TabsTrigger value="lots">Lots</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Slots</div>
              </Card>
              <Card className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{stats.available}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </Card>
              <Card className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{stats.occupied}</div>
                <div className="text-sm text-muted-foreground">Occupied</div>
              </Card>
              <Card className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.assigned}</div>
                <div className="text-sm text-muted-foreground">Assigned</div>
              </Card>
            </div>

            <Card className="glass-card p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Occupancy Rate
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Current Occupancy</span>
                  <span className="font-bold text-primary">{occupancyRate}%</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-3">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all duration-500 glow-primary"
                    style={{ width: `${occupancyRate}%` }}
                  ></div>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Active Sessions
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-muted/30">
                  <span>Currently Parking</span>
                  <Badge variant="outline">{stats.assigned}</Badge>
                </div>
                <div className="flex justify-between py-2 border-b border-muted/30">
                  <span>Shopping</span>
                  <Badge variant="outline">{stats.occupied - 2}</Badge>
                </div>
                <div className="flex justify-between py-2">
                  <span>Returning to Car</span>
                  <Badge variant="outline">2</Badge>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="slots" className="space-y-4">
            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {lotSlots.map(slot => (
                <Card key={slot.id} className="glass-card p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Car className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{slot.number}</div>
                        <div className="text-xs text-muted-foreground">
                          Floor {slot.floor} • {slot.type}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={
                          slot.status === 'available' ? 'slot-available' :
                          slot.status === 'occupied' ? 'slot-occupied' :
                          slot.status === 'assigned' ? 'slot-assigned' :
                          'slot-reserved'
                        }
                      >
                        {slot.status}
                      </Badge>
                      <select
                        value={slot.status}
                        onChange={(e) => onSlotUpdate(slot.id, e.target.value as ParkingSlot['status'])}
                        className="bg-secondary text-sm rounded px-2 py-1 border border-border"
                      >
                        <option value="available">Available</option>
                        <option value="occupied">Occupied</option>
                        <option value="assigned">Assigned</option>
                        <option value="reserved">Reserved</option>
                      </select>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="simulation" className="space-y-4">
            <Card className="glass-card p-4">
              <h3 className="font-bold mb-4">Simulation Controls</h3>
              <div className="flex gap-2 mb-4">
                {!isSimulationRunning ? (
                  <Button onClick={onSimulationStart} className="glow-accent">
                    <Play className="w-4 h-4 mr-2" />
                    Start Simulation
                  </Button>
                ) : (
                  <Button onClick={onSimulationStop} variant="outline">
                    <Pause className="w-4 h-4 mr-2" />
                    Stop Simulation
                  </Button>
                )}
                <Button onClick={onSimulationReset} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset All Slots
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {isSimulationRunning 
                  ? "Simulation running - slots will change status automatically"
                  : "Start simulation to see dynamic slot occupancy changes"
                }
              </p>
            </Card>

            <Card className="glass-card p-4">
              <h3 className="font-bold mb-4">Simulation Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="arrival-rate">Car Arrival Rate (per minute)</Label>
                  <Input 
                    id="arrival-rate" 
                    type="number" 
                    defaultValue="3" 
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="parking-duration">Average Parking Duration (minutes)</Label>
                  <Input 
                    id="parking-duration" 
                    type="number" 
                    defaultValue="45" 
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="lots" className="space-y-4">
            <Card className="glass-card p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Parking Lots
              </h3>
              <div className="space-y-2 mb-4">
                {lots.map(lot => (
                  <div key={lot.id} className="flex items-center justify-between p-2 border border-border rounded">
                    <div>
                      <div className="font-medium">{lot.name}</div>
                      <div className="text-xs text-muted-foreground">{lot.address}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{lot.totalSlots} slots</Badge>
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input 
                  placeholder="New lot name" 
                  value={newLotName}
                  onChange={(e) => setNewLotName(e.target.value)}
                />
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lot
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};