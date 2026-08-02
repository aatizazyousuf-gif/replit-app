import React, { useState, useEffect } from "react";
import { AppLayout } from "@/layouts/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Preferences } from "@capacitor/preferences";
import {
  setBaseUrl,
  useGetEmergencyContacts,
  useCreateEmergencyContact,
  useDeleteEmergencyContact,
  getGetEmergencyContactsQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState("");

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const { data: contacts, isLoading: isContactsLoading } = useGetEmergencyContacts({
    query: { enabled: user?.role === "homeowner", queryKey: getGetEmergencyContactsQueryKey() }
  });
  const createContact = useCreateEmergencyContact();
  const deleteContact = useDeleteEmergencyContact();

  useEffect(() => {
    Preferences.get({ key: "apiBaseUrl" }).then(({ value }) => {
      if (value) {
        setUrl(value);
        setSavedUrl(value);
      }
    });
  }, []);

  const handleSave = async () => {
    const trimmed = url.trim().replace(/\/+$/, "");
    if (!trimmed) {
      toast({ title: "Enter a URL", description: "Backend URL can't be empty.", variant: "destructive" });
      return;
    }
    if (!/^https?:\/\//.test(trimmed)) {
      toast({ title: "Invalid URL", description: "URL must start with http:// or https://", variant: "destructive" });
      return;
    }

    await Preferences.set({ key: "apiBaseUrl", value: trimmed });
    setBaseUrl(trimmed); // takes effect immediately, no restart needed
    setSavedUrl(trimmed);
    setUrl(trimmed);
    toast({ title: "Saved", description: "Backend URL updated. Try logging in again." });
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim()) return;
    createContact.mutate(
      { data: { name: contactName, email: contactEmail } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetEmergencyContactsQueryKey() });
          setContactName("");
          setContactEmail("");
          toast({ title: "Contact Added", description: contactEmail + " will now get leak alert emails." });
        },
        onError: () => {
          toast({ title: "Failed to Add", description: "Could not add emergency contact.", variant: "destructive" });
        }
      }
    );
  };

  const handleRemoveContact = (id: number) => {
    deleteContact.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetEmergencyContactsQueryKey() });
        }
      }
    );
  };

  return (
    <AppLayout title="Settings">
      <div className="space-y-6">
        {!user && (
          <Link href="/login" className="text-sm text-[var(--color-primary)] inline-flex items-center gap-1">
            <span className="material-icons text-sm">arrow_back</span>
            Back to Login
          </Link>
        )}
        <Card className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] p-4 space-y-4">
          <div>
            <h3 className="font-bold text-[var(--color-on-surface)] mb-1">Backend URL</h3>
            <p className="text-xs text-[var(--color-on-surface-variant)]">
              Update this whenever your Cloudflare Tunnel gives you a new address, no need to rebuild or reinstall the app afterward.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Server Address</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-tunnel-url.trycloudflare.com"
              autoCapitalize="off"
              autoCorrect="off"
              className="font-mono text-sm bg-[var(--color-surface)]"
            />
          </div>
          <Button onClick={handleSave} className="w-full bg-[var(--color-primary)] text-[var(--color-on-primary)]">
            Save
          </Button>
          {savedUrl && (
            <p className="text-xs text-[var(--color-on-surface-variant)] break-all">
              Currently active: <span className="font-mono">{savedUrl}</span>
            </p>
          )}
        </Card>

        {user?.role === "homeowner" && (
          <Card className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] p-4 space-y-4">
            <div>
              <h3 className="font-bold text-[var(--color-on-surface)] mb-1">Emergency Contacts</h3>
              <p className="text-xs text-[var(--color-on-surface-variant)]">
                Everyone listed here gets an email if a gas leak or critically low level is detected, not just this account.
              </p>
            </div>

            <div className="space-y-2">
              {isContactsLoading ? (
                <p className="text-xs text-[var(--color-on-surface-variant)]">Loading...</p>
              ) : contacts && contacts.length > 0 ? (
                contacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-lg p-2.5">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[var(--color-on-surface)] truncate">{c.name}</div>
                      <div className="text-xs text-[var(--color-on-surface-variant)] truncate">{c.email}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveContact(c.id)}
                      className="h-8 w-8 text-[var(--color-error)] shrink-0"
                    >
                      <span className="material-icons text-sm">delete</span>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--color-on-surface-variant)]">No emergency contacts added yet.</p>
              )}
            </div>

            <form onSubmit={handleAddContact} className="space-y-2 pt-2 border-t border-[var(--color-outline-variant)]">
              <Label>Add a Contact</Label>
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Name (e.g. Father, Brother)"
                className="bg-[var(--color-surface)]"
              />
              <Input
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="Email address"
                className="bg-[var(--color-surface)]"
              />
              <Button
                type="submit"
                disabled={createContact.isPending || !contactName.trim() || !contactEmail.trim()}
                className="w-full bg-[var(--color-primary)] text-[var(--color-on-primary)]"
              >
                {createContact.isPending ? "Adding..." : "Add Contact"}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
