import { useState, useEffect } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimulationModalProps {
  open: boolean;
  onClose: () => void;
}

export function SimulationModal({ open, onClose }: SimulationModalProps) {
  const [serverRunning, setServerRunning] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (open) {
      checkServer();
    }
  }, [open]);

  const checkServer = async () => {
    setChecking(true);
    try {
      const response = await fetch('http://localhost:4000/api/status');
      setServerRunning(response.ok);
    } catch {
      setServerRunning(false);
    }
    setChecking(false);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]",
            "w-[98vw] h-[98vh] max-w-[98vw]",
            "bg-background border shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "rounded-lg overflow-hidden flex flex-col"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-background shrink-0">
            <h2 className="text-base font-semibold">🚦 Traffic Simulation</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {checking ? (
              <div className="flex items-center justify-center h-full bg-background">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                  <p className="text-muted-foreground">Checking simulation server...</p>
                </div>
              </div>
            ) : !serverRunning ? (
              <div className="flex items-center justify-center h-full bg-background">
                <div className="text-center space-y-4 max-w-md p-6">
                  <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto" />
                  <h3 className="text-xl font-semibold">Simulation Server Not Running</h3>
                  <p className="text-muted-foreground">
                    Please start the simulation server first:
                  </p>
                  <div className="bg-muted p-4 rounded-lg text-left text-sm font-mono space-y-1">
                    <p>cd simulation-main/server</p>
                    <p>npm install</p>
                    <p>npm start</p>
                  </div>
                  <Button onClick={checkServer}>Retry Connection</Button>
                </div>
              </div>
            ) : (
              <iframe
                src="http://localhost:5173"
                className="w-full h-full border-0 block"
                title="Traffic Simulation"
              />
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
