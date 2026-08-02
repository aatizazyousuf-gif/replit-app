import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { useAuth } from "@/hooks/use-auth";
import { useRegisterPushToken } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

// Requests permission and registers this device for push notifications once
// a user is logged in, then sends the resulting FCM token to the backend so
// it knows where to deliver leak/low-level alerts. No-ops on web (push
// notifications are a native-only capability here).
export function usePushNotifications() {
  const { user } = useAuth();
  const registerToken = useRegisterPushToken();
  const { toast } = useToast();
  const hasSetUp = useRef(false);

  useEffect(() => {
    if (!user || !Capacitor.isNativePlatform() || hasSetUp.current) return;
    hasSetUp.current = true;

    async function setup() {
      const permStatus = await PushNotifications.checkPermissions();
      let receive = permStatus.receive;
      if (receive === "prompt" || receive === "prompt-with-rationale") {
        const result = await PushNotifications.requestPermissions();
        receive = result.receive;
      }
      if (receive !== "granted") return;

      await PushNotifications.register();
    }

    setup().catch((err) => console.error("Push notification setup failed:", err));

    const regListener = PushNotifications.addListener("registration", (token) => {
      registerToken.mutate({ data: { token: token.value } });
    });

    const regErrorListener = PushNotifications.addListener("registrationError", (err) => {
      console.error("Push registration error:", err);
    });

    // The OS shows the notification automatically when the app is in the
    // background; when the app is already open, show it as an in-app toast
    // instead, since there's no system banner to rely on in that case.
    const receivedListener = PushNotifications.addListener("pushNotificationReceived", (notification) => {
      toast({
        title: notification.title ?? "Alert",
        description: notification.body ?? "",
        variant: "destructive",
      });
    });

    return () => {
      regListener.then((l) => l.remove());
      regErrorListener.then((l) => l.remove());
      receivedListener.then((l) => l.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
}
