import { cn } from "@/lib/utils";
import { Shield, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
}

export function ChatMessage({ role, content, isTyping }: ChatMessageProps) {
  const isAssistant = role === "assistant";

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-xl animate-fade-in",
        isAssistant ? "bg-chat-assistant" : "bg-chat-user"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isAssistant ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        )}
      >
        {isAssistant ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      <div className="flex-1 pt-1">
        <p className="text-sm font-medium mb-1 text-muted-foreground">
          {isAssistant ? "propShield" : "You"}
        </p>
        {isTyping ? (
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-typing" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-primary animate-typing" style={{ animationDelay: "200ms" }} />
            <span className="w-2 h-2 rounded-full bg-primary animate-typing" style={{ animationDelay: "400ms" }} />
          </div>
        ) : (
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
        )}
      </div>
    </div>
  );
}
