import React, { useState, useEffect } from "react";
import { AppLayout } from "@/layouts/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateDevice } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function SetupWizard() {
  const [step, setStep] = useState(1);
  const [serial, setSerial] = useState("");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [calibrating, setCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [provisioned, setProvisioned] = useState<{ id: number; apiKey: string } | null>(null);

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createDeviceMutation = useCreateDevice();

  useEffect(() => {
    if (step !== 3 || !calibrating) return;
    const interval = setInterval(() => {
      setCalibrationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStep(4);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [step, calibrating]);

  const handleComplete = () => {
    createDeviceMutation.mutate(
      { data: { deviceSerial: serial, name: "Main Tank", wifiNetwork: ssid } },
      {
        onSuccess: (device: any) => {
          setProvisioned({ id: device.id, apiKey: device.apiKey });
          setStep(5);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to register device.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <AppLayout title="Device Setup">
      <div className="flex flex-col h-full justify-between max-w-sm mx-auto w-full py-8">
        
        {/* Progress indicator */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={cn("h-1.5 flex-1 rounded-full", step >= i ? "bg-[var(--color-primary)]" : "bg-[var(--color-surface-dim)]")} />
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {step === 1 && (
            <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
              <div className="w-32 h-32 rounded-full border-4 border-dashed border-[var(--color-primary)] flex items-center justify-center mb-6 relative">
                <span className="material-icons text-5xl text-[var(--color-primary)]">router</span>
                <div className="absolute inset-0 rounded-full border-4 border-[var(--color-primary-fixed)] animate-ping opacity-20" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-on-surface)] mb-2">Connect ESP32</h2>
              <p className="text-[var(--color-on-surface-variant)] mb-8">Enter the serial number printed on the bottom of your Gas Monitor unit.</p>
              <Input 
                value={serial} 
                onChange={(e) => setSerial(e.target.value)} 
                placeholder="e.g. ESP-109284" 
                className="w-full text-center text-lg tracking-widest font-mono mb-4 bg-[var(--color-surface-container-lowest)]"
              />
            </div>
          )}

          {step === 2 && (
            <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
              <div className="w-24 h-24 rounded-full bg-[var(--color-secondary-container)] flex items-center justify-center mb-6">
                <span className="material-icons text-4xl text-[var(--color-on-secondary-container)]">wifi</span>
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-on-surface)] mb-2">Wi-Fi Config</h2>
              <p className="text-[var(--color-on-surface-variant)] mb-8">Connect your monitor to your home network.</p>
              <div className="w-full space-y-4">
                <Input 
                  value={ssid} 
                  onChange={(e) => setSsid(e.target.value)} 
                  placeholder="Network Name (SSID)" 
                  className="w-full bg-[var(--color-surface-container-lowest)]"
                />
                <Input 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  type="password"
                  placeholder="Password" 
                  className="w-full bg-[var(--color-surface-container-lowest)]"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
              <div className="w-24 h-24 rounded-full bg-[var(--color-tertiary-container)] flex items-center justify-center mb-6">
                <span className="material-icons text-4xl text-[var(--color-on-tertiary-container)]">tune</span>
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-on-surface)] mb-2">Sensor Calibration</h2>
              <p className="text-[var(--color-on-surface-variant)] mb-8">Calibrating MQ-2 gas sensor and MPXV7004DP pressure sensor. Do not unplug.</p>
              
              <div className="w-full space-y-6">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono text-[var(--color-on-surface-variant)]">
                    <span>MQ-2 GAS</span>
                    <span>{calibrationProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-[var(--color-surface-dim)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--color-primary)] transition-all duration-200" style={{ width: `${calibrationProgress}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono text-[var(--color-on-surface-variant)]">
                    <span>MPXV7004DP</span>
                    <span>{Math.min(100, calibrationProgress * 1.2).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-[var(--color-surface-dim)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--color-secondary)] transition-all duration-200" style={{ width: `${Math.min(100, calibrationProgress * 1.2)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-500">
              <div className="w-32 h-32 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center mb-6 shadow-lg">
                <span className="material-icons text-6xl text-[var(--color-on-primary-container)]">check_circle</span>
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-2">All Systems Go</h2>
              <p className="text-[var(--color-on-surface-variant)]">Your gas monitor is successfully linked and actively monitoring.</p>
            </div>
          )}

          {step === 5 && provisioned && (
            <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 text-left">
              <div className="w-24 h-24 rounded-full bg-[var(--color-secondary-container)] flex items-center justify-center mb-6">
                <span className="material-icons text-4xl text-[var(--color-on-secondary-container)]">key</span>
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-on-surface)] mb-2 text-center">Device Credentials</h2>
              <p className="text-[var(--color-on-surface-variant)] mb-6 text-center text-sm">
                Copy these into your ESP32 firmware before flashing it — you won't be able to see the API key again after leaving this screen.
              </p>
              <div className="w-full space-y-3">
                <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-3">
                  <div className="text-xs font-mono text-[var(--color-on-surface-variant)] mb-1">DEVICE_ID</div>
                  <div className="font-mono text-sm break-all select-all">{provisioned.id}</div>
                </div>
                <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-3">
                  <div className="text-xs font-mono text-[var(--color-on-surface-variant)] mb-1">DEVICE_API_KEY</div>
                  <div className="font-mono text-sm break-all select-all">{provisioned.apiKey}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-8">
          {step === 1 && (
            <Button onClick={() => setStep(2)} disabled={!serial} className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-[var(--color-on-primary)]" size="lg">
              Next Step
            </Button>
          )}
          {step === 2 && (
            <div className="flex gap-3">
              <Button onClick={() => setStep(1)} variant="outline" size="lg" className="border-[var(--color-outline-variant)]">Back</Button>
              <Button onClick={() => { setStep(3); setCalibrating(true); }} disabled={!ssid} className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-[var(--color-on-primary)]" size="lg">
                Connect & Calibrate
              </Button>
            </div>
          )}
          {step === 4 && (
            <Button onClick={handleComplete} disabled={createDeviceMutation.isPending} className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-[var(--color-on-primary)]" size="lg">
              {createDeviceMutation.isPending ? "Finalizing..." : "Finish Setup"}
            </Button>
          )}
          {step === 5 && (
            <Button
              onClick={() => {
                toast({ title: "Setup Complete", description: "Your Gas Monitor is online." });
                setLocation("/dashboard");
              }}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-[var(--color-on-primary)]"
              size="lg"
            >
              I've saved these — Go to Dashboard
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
