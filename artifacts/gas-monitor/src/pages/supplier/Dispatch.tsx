import React, { useState } from "react";
import { AppLayout } from "@/layouts/Layout";
import { useGetDispatches, useCreateDispatch, useUpdateDispatch, getGetDispatchesQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function SupplierDispatch() {
  const { data: dispatches, isLoading } = useGetDispatches();
  const createMutation = useCreateDispatch();
  const updateMutation = useUpdateDispatch();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDispatch, setNewDispatch] = useState({ orderId: "", driverName: "", truckNumber: "", notes: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const orderId = parseInt(newDispatch.orderId);
    if (!orderId) return;

    createMutation.mutate(
      { data: { orderId, driverName: newDispatch.driverName, truckNumber: newDispatch.truckNumber, notes: newDispatch.notes } },
      {
        onSuccess: () => {
          toast({ title: "Dispatch Created" });
          queryClient.invalidateQueries({ queryKey: getGetDispatchesQueryKey() });
          setIsDialogOpen(false);
          setNewDispatch({ orderId: "", driverName: "", truckNumber: "", notes: "" });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to create dispatch. Ensure Order ID is valid and pending.", variant: "destructive" });
        }
      }
    );
  };

  const updateStatus = (id: number, status: "pending" | "en_route" | "delivered" | "cancelled") => {
    updateMutation.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetDispatchesQueryKey() });
        }
      }
    );
  };

  return (
    <AppLayout title="Dispatch Control">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-[var(--color-on-surface)]">Active Fleet</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm">
                <span className="material-icons text-sm mr-1">add</span> New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-[90%] rounded-xl">
              <DialogHeader>
                <DialogTitle>Assign Dispatch</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Order ID</label>
                  <Input 
                    type="number" 
                    required
                    value={newDispatch.orderId}
                    onChange={e => setNewDispatch({...newDispatch, orderId: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Driver Name</label>
                  <Input 
                    required
                    value={newDispatch.driverName}
                    onChange={e => setNewDispatch({...newDispatch, driverName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Truck Number</label>
                  <Input 
                    required
                    value={newDispatch.truckNumber}
                    onChange={e => setNewDispatch({...newDispatch, truckNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea 
                    value={newDispatch.notes}
                    onChange={e => setNewDispatch({...newDispatch, notes: e.target.value})}
                  />
                </div>
                <Button type="submit" disabled={createMutation.isPending} className="w-full bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                  {createMutation.isPending ? "Assigning..." : "Assign"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            [1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
          ) : dispatches?.length === 0 ? (
            <div className="text-center py-8 text-sm text-[var(--color-on-surface-variant)] bg-[var(--color-surface-container-lowest)] rounded-xl border border-[var(--color-outline-variant)]">
              No active dispatches.
            </div>
          ) : (
            dispatches?.map(dispatch => (
              <Card key={dispatch.id} className="bg-[var(--color-surface-container-lowest)] p-4 border border-[var(--color-outline-variant)] shadow-sm rounded-xl">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-icons text-sm text-[var(--color-primary)]">local_shipping</span>
                      <span className="font-bold text-sm text-[var(--color-on-surface)]">{dispatch.driverName} • {dispatch.truckNumber}</span>
                    </div>
                    <p className="text-xs text-[var(--color-on-surface-variant)] font-mono">Order #{dispatch.orderId}</p>
                  </div>
                  <StatusBadge 
                    label={dispatch.status.replace('_', ' ')} 
                    variant={dispatch.status === 'en_route' ? 'info' : dispatch.status === 'delivered' ? 'safe' : 'warning'} 
                  />
                </div>

                <div className="bg-[var(--color-surface-container)] rounded-lg p-3 text-sm space-y-1 mb-4">
                  <p className="font-medium text-[var(--color-on-surface)]">{dispatch.customerName}</p>
                  <p className="text-[var(--color-on-surface-variant)] text-xs flex items-start gap-1">
                    <span className="material-icons text-[14px]">location_on</span>
                    {dispatch.address || "Address not provided"}
                  </p>
                </div>

                {dispatch.status !== 'delivered' && dispatch.status !== 'cancelled' && (
                  <div className="flex gap-2">
                    {dispatch.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateStatus(dispatch.id, 'en_route')}
                        className="flex-1 bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] hover:bg-[var(--color-secondary)] hover:text-white"
                      >
                        Start Route
                      </Button>
                    )}
                    {dispatch.status === 'en_route' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateStatus(dispatch.id, 'delivered')}
                        className="flex-1 bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                      >
                        Mark Delivered
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateStatus(dispatch.id, 'cancelled')}
                      className="border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error-container)]"
                    >
                      Cancel
                    </Button>
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
