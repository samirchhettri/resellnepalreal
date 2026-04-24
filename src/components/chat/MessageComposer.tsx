import { useRef, useState } from "react";
import { ImagePlus, Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const MAX_BYTES = 5 * 1024 * 1024;

interface MessageComposerProps {
  conversationId: string;
  onSend: (content: string, imageUrl?: string | null) => Promise<{ error?: string }>;
  disabled?: boolean;
}

export const MessageComposer = ({ conversationId, onSend, disabled }: MessageComposerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Only image files are supported", variant: "destructive" });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast({ title: "Image must be smaller than 5MB", variant: "destructive" });
      return;
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSend = async () => {
    if (!user) return;
    if (!text.trim() && !imageFile) return;
    setSending(true);

    let uploadedUrl: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${conversationId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("chat-images")
        .upload(path, imageFile, { cacheControl: "3600", upsert: false });
      if (upErr) {
        toast({ title: "Could not upload image", description: upErr.message, variant: "destructive" });
        setSending(false);
        return;
      }
      uploadedUrl = supabase.storage.from("chat-images").getPublicUrl(path).data.publicUrl;
    }

    const { error } = await onSend(text, uploadedUrl);
    if (error) {
      toast({ title: "Could not send", description: error, variant: "destructive" });
      setSending(false);
      return;
    }

    setText("");
    clearImage();
    setSending(false);
  };

  return (
    <div className="border-t border-border bg-background/95 px-3 py-2 backdrop-blur-md safe-bottom">
      {previewUrl && (
        <div className="relative mb-2 inline-block">
          <img src={previewUrl} alt="preview" className="h-20 w-20 rounded-lg object-cover" />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -right-2 -top-2 rounded-full bg-foreground/90 p-1 text-background shadow"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || sending}
          aria-label="Attach image"
        >
          <ImagePlus className="h-5 w-5" />
        </Button>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          rows={1}
          disabled={disabled || sending}
          className="min-h-10 max-h-32 resize-none rounded-2xl py-2"
        />
        <Button
          type="button"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full"
          onClick={handleSend}
          disabled={disabled || sending || (!text.trim() && !imageFile)}
          aria-label="Send message"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
