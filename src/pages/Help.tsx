import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

const SUGGESTIONS = [
  "How do I create a listing?",
  "How do I stay safe meeting buyers?",
  "How do I report a suspicious listing?",
  "Can I edit my listing after posting?",
];

const Help = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your reSell Nepal assistant 👋\n\nAsk me anything — how to list, search, chat with sellers, or stay safe.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Msg = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && (last as any).streaming) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m,
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar, streaming: true } as any];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ mode: "chat", messages: next }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          toast({ title: "Slow down", description: "Too many requests. Try again in a moment.", variant: "destructive" });
        } else if (resp.status === 402) {
          toast({ title: "AI unavailable", description: "Credits exhausted. Please try again later.", variant: "destructive" });
        } else {
          toast({ title: "Couldn't reach assistant", variant: "destructive" });
        }
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) upsert(delta);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Connection failed", variant: "destructive" });
    } finally {
      setLoading(false);
      setMessages((prev) =>
        prev.map((m, i) => (i === prev.length - 1 ? { ...m, streaming: false } as any : m)),
      );
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Button variant="ghost" size="icon" asChild aria-label="Back">
          <Link to="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="font-heading text-lg font-bold">Help & AI assistant</h1>
        </div>
      </div>

      <div ref={scrollerRef} className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              m.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm",
              )}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                  <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{m.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-border pt-3 safe-bottom"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about reSell Nepal..."
          disabled={loading}
          maxLength={500}
        />
        <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
};

export default Help;
