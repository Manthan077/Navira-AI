import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { Ambulance } from '../types';
import { toast } from 'sonner';
import { SimulationModal } from '@/components/SimulationModal';

interface AmbulanceStatusProps {
  ambulance: Ambulance | null;
  isSimulating: boolean;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
  onUpdateLocation: (lat: number, lng: number, heading: number, speed: number) => void;
}

export const AmbulanceStatus: React.FC<AmbulanceStatusProps> = ({
  ambulance,
  isSimulating,
  onStartSimulation,
  onStopSimulation,
  onUpdateLocation
}) => {
  const [showSimulation, setShowSimulation] = useState(false);
  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onUpdateLocation(
            position.coords.latitude,
            position.coords.longitude,
            position.coords.heading || 0,
            (position.coords.speed || 0) * 3.6
          );
          toast.success('Location updated successfully!');
        },
        (error) => {
          toast.error('Failed to get location. Please enable location access.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast.error('Geolocation not supported by this browser.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5" />
          Current Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Latitude</p>
            <p className="font-mono text-sm sm:text-lg">{ambulance?.current_lat?.toFixed(6) ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Longitude</p>
            <p className="font-mono text-sm sm:text-lg">{ambulance?.current_lng?.toFixed(6) ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Speed</p>
            <p className="font-mono text-sm sm:text-lg">{ambulance?.speed?.toFixed(0) ?? 0} km/h</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Heading</p>
            <p className="font-mono text-sm sm:text-lg">{ambulance?.heading?.toFixed(0) ?? 0}°</p>
          </div>
        </div>
      
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => setShowSimulation(true)}
            className="text-xs sm:text-sm"
          >
            🚦 Traffic Simulation
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleShareLocation}
            className="text-xs sm:text-sm"
          >
            📍 Share Location
          </Button>
        </div>
        
        <SimulationModal open={showSimulation} onClose={() => setShowSimulation(false)} />
      </CardContent>
    </Card>
  );
};