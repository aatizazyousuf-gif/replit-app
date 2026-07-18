import React, { useState } from "react";
import { AppLayout } from "@/layouts/Layout";
import { useCreateRefillOrder, useGetMySupplier } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function HomeownerOrder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createOrder = useCreateRefillOrder();
  const { data: supplier } = useGetMySupplier();

  const [deliveryType, setDeliveryType] = useState<"standard" | "express" | "emergency">("standard");
  const [volume, setVolume] = useState("100");
  const [notes, setNotes] = useState("");

  const basePricePerGallon = 2.80;
  const fees = {
    standard: 0,
    express: 15,
    emergency: 45
  };

  const volumeNum = parseFloat(volume) || 0;
  const subtotal = volumeNum * basePricePerGallon;
  const deliveryFee = fees[deliveryType];
  const total = subtotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (volumeNum <= 0) {
      toast({ title: "Invalid Volume", description: "Please enter a valid amount.", variant: "destructive" });
      return;
    }
    if (!supplier) {
      toast({ title: "No Supplier Linked", description: "You need to be linked to a supplier before ordering. Ask your supplier to add you as a customer.", variant: "destructive" });
      return;
    }
    
    createOrder.mutate(
      { data: { deliveryType, volumeGallons: volumeNum, notes, supplierId: supplier.id } },
      {
        onSuccess: () => {
          toast({ title: "Order Placed", description: "Your refill order has been received." });
          setLocation("/refills");
        },
        onError: () => {
          toast({ title: "Order Failed", description: "Could not place order. Try again.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <AppLayout title="Order Refill">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {!supplier && (
          <Card className="bg-[var(--color-error-container)]/30 border border-[var(--color-error)] p-4">
            <div className="flex items-center gap-3">
              <span className="material-icons text-[var(--color-error)]">warning</span>
              <p className="text-sm text-[var(--color-on-surface)]">
                You're not linked to a supplier yet. Ask your gas supplier to add you as a customer (using this account's email) before placing an order.
              </p>
            </div>
          </Card>
        )}

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-[var(--color-on-surface)]">Delivery Urgency</Label>
          <RadioGroup value={deliveryType} onValueChange={(v) => setDeliveryType(v as any)} className="grid gap-3">
            
            <Label htmlFor="standard" className="cursor-pointer [&:has([data-state=checked])>div]:border-[var(--color-primary)] [&:has([data-state=checked])>div]:bg-[var(--color-primary-fixed)] [&:has([data-state=checked])>div]:shadow-sm">
              <RadioGroupItem value="standard" id="standard" className="sr-only" />
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center text-[var(--color-primary)]">
                    <span className="material-icons">local_shipping</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--color-on-surface)]">Standard</h4>
                    <p className="text-xs text-[var(--color-on-surface-variant)]">3-5 business days</p>
                  </div>
                </div>
                <span className="font-mono font-semibold">Free</span>
              </div>
            </Label>

            <Label htmlFor="express" className="cursor-pointer [&:has([data-state=checked])>div]:border-[var(--color-secondary)] [&:has([data-state=checked])>div]:bg-[var(--color-surface-container-low)] [&:has([data-state=checked])>div]:shadow-sm">
              <RadioGroupItem value="express" id="express" className="sr-only" />
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center text-[var(--color-secondary)]">
                    <span className="material-icons">bolt</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--color-on-surface)]">Express</h4>
                    <p className="text-xs text-[var(--color-on-surface-variant)]">Next business day</p>
                  </div>
                </div>
                <span className="font-mono font-semibold">+$15</span>
              </div>
            </Label>

            <Label htmlFor="emergency" className="cursor-pointer [&:has([data-state=checked])>div]:border-[var(--color-error)] [&:has([data-state=checked])>div]:bg-[var(--color-error-container)]/30 [&:has([data-state=checked])>div]:shadow-sm">
              <RadioGroupItem value="emergency" id="emergency" className="sr-only" />
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-error-container)] flex items-center justify-center text-[var(--color-on-error-container)]">
                    <span className="material-icons text-[var(--color-error)]">warning</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--color-on-surface)]">Emergency</h4>
                    <p className="text-xs text-[var(--color-on-surface-variant)]">Same day / Within hours</p>
                  </div>
                </div>
                <span className="font-mono font-semibold">+$45</span>
              </div>
            </Label>
            
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-[var(--color-on-surface)]">Volume (Gallons)</Label>
          <Input 
            type="number" 
            min="10" 
            max="1000" 
            value={volume} 
            onChange={(e) => setVolume(e.target.value)}
            className="text-lg font-mono font-bold bg-[var(--color-surface-container-lowest)]"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-[var(--color-on-surface)]">Delivery Notes (Optional)</Label>
          <Textarea 
            placeholder="Gate code, dog warning, specific tank location..." 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-[var(--color-surface-container-lowest)]"
          />
        </div>

        <Card className="bg-[var(--color-surface-container-high)] p-4 border border-[var(--color-outline-variant)]">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[var(--color-on-surface-variant)]">
              <span>Subtotal ({volumeNum} gal)</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-on-surface-variant)]">
              <span>Delivery Fee</span>
              <span className="font-mono">${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-[var(--color-outline-variant)] pt-2 mt-2 flex justify-between font-bold text-lg text-[var(--color-on-surface)]">
              <span>Total</span>
              <span className="font-mono">${total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Button 
          type="submit" 
          disabled={createOrder.isPending || volumeNum <= 0 || !supplier} 
          className="w-full h-14 text-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-[var(--color-on-primary)] shadow-md"
        >
          {createOrder.isPending ? "Processing..." : `Place Order — $${total.toFixed(2)}`}
        </Button>
        
      </form>
    </AppLayout>
  );
}
