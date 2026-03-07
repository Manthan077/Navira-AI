import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AddAmbulanceDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [careType, setCareType] = useState('Basic Life Support');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Find driver by email
      const { data: driver, error: driverError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', driverEmail)
        .eq('role', 'ambulance')
        .single();

      if (driverError || !driver) {
        toast.error('Driver not found', { description: 'No driver with this email exists' });
        setLoading(false);
        return;
      }

      // Create ambulance
      const { error: ambulanceError } = await supabase
        .from('ambulances')
        .insert({
          driver_id: driver.id,
          vehicle_number: vehicleNumber,
          care_type: careType,
          current_lat: 30.7333,
          current_lng: 76.7794,
          emergency_status: 'inactive'
        });

      if (ambulanceError) throw ambulanceError;

      // Link ambulance to driver profile
      const { data: ambulanceData } = await supabase
        .from('ambulances')
        .select('id')
        .eq('vehicle_number', vehicleNumber)
        .single();

      if (ambulanceData) {
        await supabase
          .from('profiles')
          .update({ ambulance_id: ambulanceData.id })
          .eq('id', driver.id);
      }

      toast.success('Ambulance added successfully');
      setOpen(false);
      setVehicleNumber('');
      setDriverEmail('');
      setCareType('Basic Life Support');
    } catch (error: any) {
      toast.error('Failed to add ambulance', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Ambulance
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Add New Ambulance</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Vehicle Number</Label>
            <Input
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              placeholder="DL-01-AB-1234"
              required
              className="bg-slate-800 border-slate-700"
            />
          </div>
          <div>
            <Label>Driver Email</Label>
            <Input
              type="email"
              value={driverEmail}
              onChange={(e) => setDriverEmail(e.target.value)}
              placeholder="driver@example.com"
              required
              className="bg-slate-800 border-slate-700"
            />
          </div>
          <div>
            <Label>Care Type</Label>
            <Select value={careType} onValueChange={setCareType}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="Basic Life Support">Basic Life Support</SelectItem>
                <SelectItem value="Advanced Life Support">Advanced Life Support</SelectItem>
                <SelectItem value="Critical Care">Critical Care</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Adding...' : 'Add Ambulance'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
