import React, { useState, useEffect } from "react";
import { AppLayout } from "@/layouts/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Preferences } from "@capacitor/preferences";
import { setBaseUrl } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState("");

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
              Update this whenever your Cloudflare Tunnel gives you a new address —
              no need to rebuild or reinstall the app afterward.
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
      </div>
    </AppLayout>
  );
}
