import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Link } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function LinkDriverDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedAmbulance, setSelectedAmbulance] = useState('');

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    // Fetch unlinked drivers
    const { data: driverData } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('role', 'ambulance')
      .is('ambulance_id', null);

    // Fetch unlinked ambulances
    const { data: ambulanceData } = await supabase
      .from('ambulances')
      .select('id, vehicle_number, driver_id');

    setDrivers(driverData || []);
    setAmbulances(ambulanceData || []);
  };

  const handleLink = async () => {
    if (!selectedDriver || !selectedAmbulance) {
      toast.error('Please select both driver and ambulance');
      return;
    }

    setLoading(true);
    try {
      // Update ambulance with driver_id
      const { error: ambError } = await supabase
        .from('ambulances')
        .update({ driver_id: selectedDriver })
        .eq('id', selectedAmbulance);

      if (ambError) throw ambError;

      // Update profile with ambulance_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ ambulance_id: selectedAmbulance })
        .eq('id', selectedDriver);

      if (profileError) throw profileError;

      toast.success('Driver linked to ambulance successfully');
      setOpen(false);
      setSelectedDriver('');
      setSelectedAmbulance('');
    } catch (error: any) {
      toast.error('Failed to link driver', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Link className="w-4 h-4 mr-2" />
          Link Driver to Ambulance
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Link Driver to Ambulance</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Select Driver</Label>
            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue placeholder="Choose a driver" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.full_name || driver.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Select Ambulance</Label>
            <Select value={selectedAmbulance} onValueChange={setSelectedAmbulance}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue placeholder="Choose an ambulance" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {ambulances.map((ambulance) => (
                  <SelectItem key={ambulance.id} value={ambulance.id}>
                    {ambulance.vehicle_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleLink} disabled={loading} className="w-full">
            {loading ? 'Linking...' : 'Link Driver & Ambulance'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
