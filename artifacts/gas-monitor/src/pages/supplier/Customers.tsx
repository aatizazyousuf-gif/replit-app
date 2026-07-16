import React, { useState } from "react";
import { AppLayout } from "@/layouts/Layout";
import { useGetSupplierCustomers, useLinkCustomer, useUnlinkCustomer, getGetSupplierCustomersQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function SupplierCustomers() {
  const { data: customers, isLoading } = useGetSupplierCustomers();
  const linkMutation = useLinkCustomer();
  const unlinkMutation = useUnlinkCustomer();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [emailToLink, setEmailToLink] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailToLink) return;

    linkMutation.mutate(
      { data: { homeownerEmail: emailToLink } },
      {
        onSuccess: () => {
          toast({ title: "Customer Linked", description: "Successfully linked homeowner to your account." });
          queryClient.invalidateQueries({ queryKey: getGetSupplierCustomersQueryKey() });
          setEmailToLink("");
          setIsDialogOpen(false);
        },
        onError: () => {
          toast({ title: "Link Failed", description: "Could not find a homeowner with that email.", variant: "destructive" });
        }
      }
    );
  };

  const handleUnlink = (customerId: number) => {
    if (confirm("Are you sure you want to unlink this customer?")) {
      unlinkMutation.mutate(
        { id: customerId },
        {
          onSuccess: () => {
            toast({ title: "Customer Unlinked" });
            queryClient.invalidateQueries({ queryKey: getGetSupplierCustomersQueryKey() });
          }
        }
      );
    }
  };

  return (
    <AppLayout title="Customers">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-[var(--color-on-surface)]">Directory</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm">
                <span className="material-icons text-sm mr-1">person_add</span> Link Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-[90%] rounded-xl">
              <DialogHeader>
                <DialogTitle>Link Homeowner</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleLink} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Homeowner Email</label>
                  <Input 
                    type="email" 
                    placeholder="customer@example.com" 
                    value={emailToLink}
                    onChange={e => setEmailToLink(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={linkMutation.isPending || !emailToLink} className="w-full bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                  {linkMutation.isPending ? "Linking..." : "Link Account"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
          ) : customers?.length === 0 ? (
            <div className="text-center py-8 text-sm text-[var(--color-on-surface-variant)] bg-[var(--color-surface-container-lowest)] rounded-xl border border-[var(--color-outline-variant)]">
              No customers linked yet.
            </div>
          ) : (
            customers?.map(customer => (
              <Card key={customer.id} className="bg-[var(--color-surface-container-lowest)] p-4 border border-[var(--color-outline-variant)] shadow-sm rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-[var(--color-on-surface)]">{customer.homeownerName}</h3>
                    <p className="text-xs text-[var(--color-on-surface-variant)]">{customer.homeownerEmail}</p>
                    
                    <div className="flex gap-4 mt-3">
                      <div className="flex items-center gap-1">
                        <span className="material-icons text-[16px] text-[var(--color-outline)]">propane</span>
                        <span className="text-xs font-bold font-mono text-[var(--color-on-surface)]">
                          {customer.gasLevelPercent != null ? `${customer.gasLevelPercent}%` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-icons text-[16px] text-[var(--color-outline)]">router</span>
                        <span className="text-xs font-medium text-[var(--color-on-surface)]">{customer.deviceCount} devices</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleUnlink(customer.id)}
                    className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)]"
                  >
                    <span className="material-icons">link_off</span>
                  </Button>
                </div>
                
                {/* Level indicator bar */}
                {customer.gasLevelPercent != null && (
                  <div className="w-full h-1.5 bg-[var(--color-surface-dim)] rounded-full mt-4 overflow-hidden">
                    <div 
                      className="h-full transition-all" 
                      style={{ 
                        width: `${customer.gasLevelPercent}%`,
                        backgroundColor: customer.gasLevelPercent > 50 ? 'var(--color-primary)' : customer.gasLevelPercent > 20 ? 'var(--color-tertiary-container)' : 'var(--color-error)'
                      }} 
                    />
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
