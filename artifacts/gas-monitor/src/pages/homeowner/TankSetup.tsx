import React, { useEffect, useState } from "react";
import { AppLayout } from "@/layouts/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetHomeownerSummary,
  useUpdateTankWeight,
  getGetHomeownerSummaryQueryKey,
} from "@workspace/api-client-react";

const CAPACITY_PRESETS = [6, 11.8, 15, 45];

export default function TankSetup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetHomeownerSummary({
    query: { queryKey: getGetHomeownerSummaryQueryKey() },
  });
  const updateTank = useUpdateTankWeight();

  const device = data?.device ?? null;
  const usingLoadCell = device?.gasWeightSource === "load_cell";

  const [capacity, setCapacity] = useState("");
  const [gasWeight, setGasWeight] = useState("");
  const [threshold, setThreshold] = useState("20");

  // Fill the form with what is already saved (once the device loads).
  useEffect(() => {
    if (!device) return;
    if (device.tankCapacityKg != null) setCapacity(String(device.tankCapacityKg));
    if (device.gasWeightKg != null) setGasWeight(String(device.gasWeightKg));
    setThreshold(String(device.lowLevelThresholdPercent));
  }, [device?.id, device?.tankCapacityKg, device?.gasWeightKg, device?.lowLevelThresholdPercent]);

  const capacityNum = parseFloat(capacity);
  const weightNum = parseFloat(gasWeight);
  const thresholdNum = parseFloat(threshold);

  const capacityOk = Number.isFinite(capacityNum) && capacityNum > 0;
  const weightOk = Number.isFinite(weightNum) && weightNum >= 0 && capacityOk && weightNum <= capacityNum;
  const thresholdOk = Number.isFinite(thresholdNum) && thresholdNum >= 1 && thresholdNum <= 99;
  const canSave = !!device && capacityOk && weightOk && thresholdOk && !updateTank.isPending;

  const previewPercent = capacityOk && weightOk ? Math.min(100, (weightNum / capacityNum) * 100) : null;
  const previewLow = previewPercent != null && thresholdOk && previewPercent < thresholdNum;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!device || !canSave) return;
    updateTank.mutate(
      {
        id: device.id,
        data: {
          tankCapacityKg: capacityNum,
          gasWeightKg: weightNum,
          lowLevelThresholdPercent: thresholdNum,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetHomeownerSummaryQueryKey() });
          toast({
            title: "Tank weight saved",
            description: previewLow
              ? "Gas is below your alert level - a low-level alert was sent."
              : "Your tank level is up to date.",
          });
        },
        onError: () => {
          toast({
            title: "Could not save",
            description: "Check the numbers (gas weight cannot be more than the tank capacity) and try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  if (!isLoading && !device) {
    return (
      <AppLayout title="Gas Weight">
        <Card className="p-6 flex flex-col items-center gap-3 text-center border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)]">
          <span className="material-icons text-3xl text-[var(--color-outline)]">sensors_off</span>
          <p className="text-sm text-[var(--color-on-surface-variant)]">
            Add your device first, then you can enter the gas weight.
          </p>
          <Link href="/setup">
            <Button className="bg-[var(--color-primary)] text-[var(--color-on-primary)]">Go to Setup</Button>
          </Link>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Gas Weight">
      <form onSubmit={handleSave} className="space-y-6 pb-4">
        {/* Where the weight comes from */}
        <Card className="p-4 border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] flex items-start gap-3">
          <span className="material-icons text-[var(--color-primary)]">{usingLoadCell ? "scale" : "edit"}</span>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[var(--color-on-surface)]">
                {usingLoadCell ? "Load cell" : "Manual entry"}
              </span>
              <StatusBadge label={usingLoadCell ? "Automatic" : "Manual"} variant={usingLoadCell ? "safe" : "info"} />
            </div>
            <p className="text-xs text-[var(--color-on-surface-variant)]">
              {usingLoadCell
                ? "The weight is updated automatically by the load cell. Saving here overrides it until the next reading."
                : "You tell the app how much gas is in the tank. When a load cell is connected, this will update by itself."}
            </p>
          </div>
        </Card>

        {/* Tank capacity */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-[var(--color-on-surface)]">Tank capacity (kg of gas)</Label>
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="e.g. 11.8"
            className="text-lg font-mono font-bold bg-[var(--color-surface-container-lowest)]"
          />
          <div className="flex flex-wrap gap-2">
            {CAPACITY_PRESETS.map((kg) => (
              <button
                key={kg}
                type="button"
                onClick={() => setCapacity(String(kg))}
                className="px-3 py-1 rounded-full text-xs font-mono border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)]"
              >
                {kg} kg
              </button>
            ))}
          </div>
        </div>

        {/* Gas weight now */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-[var(--color-on-surface)]">Gas in the tank now (kg)</Label>
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={gasWeight}
            onChange={(e) => setGasWeight(e.target.value)}
            placeholder="e.g. 7.5"
            className="text-lg font-mono font-bold bg-[var(--color-surface-container-lowest)]"
          />
          <p className="text-xs text-[var(--color-on-surface-variant)]">
            Weigh the full cylinder and subtract its empty weight (the "TW" number stamped on the cylinder collar).
          </p>
          {capacityOk && Number.isFinite(weightNum) && weightNum > capacityNum && (
            <p className="text-xs text-[var(--color-error)]">Gas weight cannot be more than the tank capacity.</p>
          )}
        </div>

        {/* Alert level */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-[var(--color-on-surface)]">Alert me when gas is below (%)</Label>
          <Input
            type="number"
            inputMode="numeric"
            step="1"
            min="1"
            max="99"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="text-lg font-mono font-bold bg-[var(--color-surface-container-lowest)]"
          />
        </div>

        {/* Live preview */}
        <Card className="p-4 border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase">Tank level</span>
            {previewPercent != null && (
              <StatusBadge label={previewLow ? "Low" : "OK"} variant={previewLow ? "error" : "safe"} />
            )}
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold font-mono text-[var(--color-on-surface)]">
              {previewPercent != null ? previewPercent.toFixed(0) : "--"}
            </span>
            <span className="text-sm text-[var(--color-outline)]">%</span>
            {previewPercent != null && (
              <span className="ml-2 text-xs font-mono text-[var(--color-on-surface-variant)]">
                {weightNum.toFixed(1)} of {capacityNum.toFixed(1)} kg
              </span>
            )}
          </div>
          {device?.gasWeightUpdatedAt && (
            <p className="text-xs text-[var(--color-outline)] mt-2">
              Last updated {new Date(device.gasWeightUpdatedAt).toLocaleString()}
            </p>
          )}
        </Card>

        <Button
          type="submit"
          disabled={!canSave}
          className="w-full h-14 text-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-[var(--color-on-primary)] shadow-md"
        >
          {updateTank.isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </AppLayout>
  );
}
