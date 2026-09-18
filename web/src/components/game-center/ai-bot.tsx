"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Bot, SendHorizontal } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

const suggestions = [
  "What can I play right now?",
  "Tell me about FGIU",
  "How do I install a Windows build?",
];

export function AiBot() {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );
  const { messages, sendMessage, status, error } = useChat({ transport });
  const [input, setInput] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const busy = status === "submitted" || status === "streaming";

  function submit(text: string) {
    const next = text.trim();
    if (!next || busy) return;
    sendMessage({ text: next });
    setInput("");
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-brand/20 text-brand">
          <Bot className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium">oTTe Bot</p>
          <p className="text-xs text-muted-foreground">Studio concierge</p>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3 p-4">
          {messages.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Ask about FGIU, your library, or what to play next.
              </p>
              <div className="flex flex-col gap-2">
                {suggestions.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => submit(prompt)}
                    className="rounded-lg border border-border bg-background/40 px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-brand/50 hover:bg-brand/10"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "user"
                  ? "ml-6 rounded-lg bg-brand/15 px-3 py-2 text-sm"
                  : "mr-4 rounded-lg bg-muted px-3 py-2 text-sm"
              }
            >
              {message.parts.map((part, index) =>
                part.type === "text" ? (
                  <p key={`${message.id}-${index}`} className="whitespace-pre-wrap">
                    {part.text}
                  </p>
                ) : null,
              )}
            </div>
          ))}

          {busy ? (
            <p className="text-xs text-muted-foreground">oTTe Bot is typing…</p>
          ) : null}
          {error ? (
            <p className="text-xs text-destructive">
              The bot could not reply. Add an XAI_API_KEY and try again.
            </p>
          ) : null}
        </div>
      </ScrollArea>

      <form
        ref={formRef}
        className="border-t border-border p-3"
        onSubmit={(event) => {
          event.preventDefault();
          submit(input);
        }}
      >
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit(input);
              }
            }}
            placeholder="Ask oTTe Bot…"
            rows={2}
            disabled={busy}
            className="min-h-16 resize-none"
          />
          <Button
            type="submit"
            size="icon"
            disabled={busy || !input.trim()}
            aria-label="Send message"
          >
            <SendHorizontal className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
