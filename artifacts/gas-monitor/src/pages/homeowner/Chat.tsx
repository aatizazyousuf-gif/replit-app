import React, { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/layouts/Layout";
import { useGetConversations, useGetMessages, useSendMessage, getGetMessagesQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

export default function HomeownerChat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // For homeowner, we just need to get the first conversation (usually with their supplier)
  const { data: conversations, isLoading: isConversationsLoading } = useGetConversations();
  const supplierId = conversations?.[0]?.userId;

  const { data: messages, isLoading: isMessagesLoading } = useGetMessages(
    { withUserId: supplierId! },
    { query: { enabled: !!supplierId, refetchInterval: 3000, queryKey: getGetMessagesQueryKey({ withUserId: supplierId ?? 0 }) } }
  );

  const sendMessage = useSendMessage();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !supplierId) return;

    const messageContent = content;
    setContent(""); // optimistic clear

    sendMessage.mutate(
      { data: { receiverId: supplierId, content: messageContent } },
      {
        onSuccess: (newMessage) => {
          // Optimistically update the cache if we want, or rely on refetch
          queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey({ withUserId: supplierId }) });
        },
        onError: () => {
          setContent(messageContent); // restore on error
        }
      }
    );
  };

  return (
    <AppLayout title="Support Chat">
      <div className="flex flex-col h-[calc(100vh-14rem)] relative">
        <div className="flex-1 overflow-y-auto pb-4 space-y-4 px-1">
          {isConversationsLoading || isMessagesLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-3/4 rounded-2xl rounded-tl-sm bg-[var(--color-surface-container-high)]" />
              <Skeleton className="h-12 w-2/3 ml-auto rounded-2xl rounded-tr-sm bg-[var(--color-primary-fixed)]" />
            </div>
          ) : !supplierId ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[var(--color-on-surface-variant)]">
              <span className="material-icons text-4xl mb-2 opacity-50">person_off</span>
              <p>You haven't been linked to a supplier yet. Support chat will be available once your account is linked.</p>
            </div>
          ) : messages?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[var(--color-on-surface-variant)]">
              <span className="material-icons text-4xl mb-2 opacity-50">forum</span>
              <p>Send a message to your supplier.</p>
            </div>
          ) : (
            messages?.map((msg) => {
              const isMine = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={cn("flex flex-col max-w-[85%]", isMine ? "ml-auto items-end" : "mr-auto items-start")}>
                  <div 
                    className={cn(
                      "p-3 rounded-2xl text-sm shadow-sm",
                      isMine 
                        ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-tr-sm" 
                        : "bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] rounded-tl-sm border border-[var(--color-outline-variant)]"
                    )}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-[var(--color-on-surface-variant)] mt-1 px-1">
                    {format(new Date(msg.sentAt), 'MMM d, h:mm a')}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {supplierId && (
          <form onSubmit={handleSend} className="sticky bottom-0 bg-[var(--color-surface)] pt-2 pb-1">
            <div className="flex items-center gap-2">
              <Input 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-full bg-[var(--color-surface-container-lowest)] border-[var(--color-outline-variant)]"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!content.trim() || sendMessage.isPending}
                className="rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] shrink-0"
              >
                <span className="material-icons text-sm">send</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
