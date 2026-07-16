import React, { useState } from "react";
import { AppLayout } from "@/layouts/Layout";
import { useGetInventory, useCreateInventoryItem, useUpdateInventoryItem, getGetInventoryQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function SupplierInventory() {
  const { data: inventory, isLoading } = useGetInventory();
  const updateMutation = useUpdateInventoryItem();
  const createMutation = useCreateInventoryItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editId, setEditId] = useState<number | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const handleEdit = (item: any) => {
    setEditId(item.id);
    setEditQty(item.quantityAvailable.toString());
    setEditPrice(item.pricePerUnit?.toString() || "");
  };

  const handleSave = (id: number) => {
    updateMutation.mutate(
      { id, data: { quantityAvailable: parseInt(editQty) || 0, pricePerUnit: parseFloat(editPrice) || undefined } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetInventoryQueryKey() });
          setEditId(null);
        }
      }
    );
  };

  return (
    <AppLayout title="Inventory">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
          ) : (
            inventory?.map(item => (
              <Card key={item.id} className="bg-[var(--color-surface-container-lowest)] p-5 border border-[var(--color-outline-variant)] shadow-sm rounded-xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center text-[var(--color-primary)]">
                      <span className="material-icons">propane</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--color-on-surface)] text-lg capitalize">{item.cylinderType}</h3>
                      <p className="text-xs text-[var(--color-on-surface-variant)]">Updated {format(new Date(item.updatedAt), 'MMM d, h:mm a')}</p>
                    </div>
                  </div>
                  {editId !== item.id && (
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="text-[var(--color-on-surface-variant)]">
                      <span className="material-icons text-sm">edit</span>
                    </Button>
                  )}
                </div>

                {editId === item.id ? (
                  <div className="space-y-3 bg-[var(--color-surface-container-low)] p-3 rounded-lg border border-[var(--color-outline-variant)]">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-[var(--color-on-surface-variant)]">Quantity</label>
                        <Input type="number" value={editQty} onChange={e => setEditQty(e.target.value)} className="mt-1 h-8" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[var(--color-on-surface-variant)]">Price/Unit</label>
                        <Input type="number" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="mt-1 h-8" />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>Cancel</Button>
                      <Button size="sm" onClick={() => handleSave(item.id)} disabled={updateMutation.isPending} className="bg-[var(--color-primary)] text-[var(--color-on-primary)]">Save</Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[var(--color-surface-container)] rounded-lg p-3">
                      <p className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase mb-1">Available</p>
                      <p className="text-xl font-bold font-mono text-[var(--color-on-surface)]">{item.quantityAvailable}</p>
                    </div>
                    <div className="bg-[var(--color-surface-container)] rounded-lg p-3">
                      <p className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase mb-1">Price</p>
                      <p className="text-xl font-bold font-mono text-[var(--color-on-surface)]">${item.pricePerUnit?.toFixed(2) || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
