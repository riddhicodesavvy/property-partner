import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Chat() {
  const { messages, isLoading, sendMessage } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-foreground">propShield</h1>
              <p className="text-xs text-muted-foreground">Your property assistant</p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 overflow-hidden" ref={scrollRef}>
        <div className="container max-w-3xl mx-auto px-4 py-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} role={message.role} content={message.content} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <ChatMessage role="assistant" content="" isTyping />
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
