import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock, Building2, Ambulance } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DashboardLock {
  id: string;
  dashboard_type: 'ambulance' | 'hospital';
  is_locked: boolean;
  locked_by: string | null;
  locked_at: string | null;
}

export default function DashboardLockManager() {
  const [locks, setLocks] = useState<DashboardLock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocks();
    const subscription = supabase
      .channel('dashboard_locks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dashboard_locks' }, fetchLocks)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchLocks = async () => {
    const { data, error } = await supabase
      .from('dashboard_locks')
      .select('*')
      .order('dashboard_type');

    if (error) {
      console.error('Error fetching locks:', error);
      toast.error('Failed to load dashboard locks. Please run the SQL setup.');
    } else if (data) {
      setLocks(data);
    }
    setLoading(false);
  };

  const toggleLock = async (lockId: string, currentlyLocked: boolean, dashboardType: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('dashboard_locks')
      .update({
        is_locked: !currentlyLocked,
        locked_by: !currentlyLocked ? user?.id : null,
        locked_at: !currentlyLocked ? new Date().toISOString() : null
      })
      .eq('id', lockId);

    if (error) {
      toast.error('Failed to update lock');
    } else {
      toast.success(`${dashboardType} dashboard ${!currentlyLocked ? 'locked' : 'unlocked'}`);
      fetchLocks();
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/60 border border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Dashboard Access Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-white">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (locks.length === 0) {
    return (
      <Card className="bg-slate-800/60 border border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Dashboard Access Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-yellow-400 p-4 bg-yellow-500/10 rounded-lg">
            <p className="font-semibold mb-2">⚠️ Setup Required</p>
            <p className="text-sm">Please run the SQL setup first:</p>
            <ol className="text-sm mt-2 ml-4 list-decimal space-y-1">
              <li>Open Supabase SQL Editor</li>
              <li>Copy contents from SETUP_ADMIN_FEATURES.sql</li>
              <li>Run the SQL</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/60 border border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Dashboard Access Control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {locks.map((lock) => (
          <div
            key={lock.id}
            className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-700 rounded-lg"
          >
            <div className="flex items-center gap-3">
              {lock.dashboard_type === 'ambulance' ? (
                <Ambulance className="w-5 h-5 text-blue-400" />
              ) : (
                <Building2 className="w-5 h-5 text-green-400" />
              )}
              <div>
                <p className="text-white font-medium capitalize">{lock.dashboard_type} Dashboard</p>
                <p className="text-slate-400 text-sm">
                  {lock.is_locked ? 'Access restricted' : 'Access allowed'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={lock.is_locked ? 'destructive' : 'default'}>
                {lock.is_locked ? 'Locked' : 'Unlocked'}
              </Badge>
              <Button
                variant={lock.is_locked ? 'default' : 'destructive'}
                size="sm"
                onClick={() => toggleLock(lock.id, lock.is_locked, lock.dashboard_type)}
              >
                {lock.is_locked ? (
                  <>
                    <Unlock className="w-4 h-4 mr-2" />
                    Unlock
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Lock
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
