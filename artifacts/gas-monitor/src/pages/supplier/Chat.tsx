import React, { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/layouts/Layout";
import { useGetConversations, getGetConversationsQueryKey, useGetMessages, useSendMessage, getGetMessagesQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

export default function SupplierChat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: isConversationsLoading } = useGetConversations({
    query: { refetchInterval: 5000, queryKey: getGetConversationsQueryKey() }
  });

  const { data: messages, isLoading: isMessagesLoading } = useGetMessages(
    { withUserId: selectedCustomerId! },
    { query: { enabled: !!selectedCustomerId, refetchInterval: 3000, queryKey: getGetMessagesQueryKey({ withUserId: selectedCustomerId ?? 0 }) } }
  );

  const sendMessage = useSendMessage();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !selectedCustomerId) return;

    const messageContent = content;
    setContent("");

    sendMessage.mutate(
      { data: { receiverId: selectedCustomerId, content: messageContent } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey({ withUserId: selectedCustomerId }) });
        },
        onError: () => {
          setContent(messageContent);
        }
      }
    );
  };

  return (
    <AppLayout title={selectedCustomerId ? "Chat" : "Messages"}>
      <div className="flex flex-col h-[calc(100vh-14rem)] relative">
        {!selectedCustomerId ? (
          // Conversations List
          <div className="flex-1 overflow-y-auto space-y-2">
            {isConversationsLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
            ) : conversations?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[var(--color-on-surface-variant)]">
                <span className="material-icons text-4xl mb-2 opacity-50">forum</span>
                <p>No messages yet.</p>
              </div>
            ) : (
              conversations?.map((conv) => (
                <button
                  key={conv.userId}
                  onClick={() => setSelectedCustomerId(conv.userId)}
                  className="w-full bg-[var(--color-surface-container-lowest)] p-4 border border-[var(--color-outline-variant)] rounded-xl text-left flex items-start gap-3 hover:bg-[var(--color-surface-container-low)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center text-[var(--color-on-primary-container)] shrink-0">
                    {conv.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-[var(--color-on-surface)] truncate">{conv.userName}</h4>
                      <span className="text-[10px] text-[var(--color-outline)] whitespace-nowrap ml-2">
                        {format(new Date(conv.lastMessageAt), 'MMM d')}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-on-surface-variant)] truncate font-medium">
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          // Active Chat View
          <>
            <div className="bg-[var(--color-surface-container-high)] p-2 mb-2 rounded-xl flex items-center gap-2 sticky top-0 z-10 border border-[var(--color-outline-variant)]">
              <Button variant="ghost" size="icon" onClick={() => setSelectedCustomerId(null)} className="h-8 w-8 text-[var(--color-on-surface-variant)]">
                <span className="material-icons text-sm">arrow_back</span>
              </Button>
              <span className="font-bold text-[var(--color-on-surface)] truncate">
                {conversations?.find(c => c.userId === selectedCustomerId)?.userName}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pb-4 space-y-4 px-1">
              {isMessagesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-3/4 rounded-2xl rounded-tl-sm bg-[var(--color-surface-container-high)]" />
                  <Skeleton className="h-12 w-2/3 ml-auto rounded-2xl rounded-tr-sm bg-[var(--color-primary-fixed)]" />
                </div>
              ) : messages?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[var(--color-on-surface-variant)]">
                  <p>Send a message.</p>
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
                        {format(new Date(msg.sentAt), 'h:mm a')}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

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
          </>
        )}
      </div>
    </AppLayout>
  );
}
