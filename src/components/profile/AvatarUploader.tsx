import { ChangeEvent, useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AvatarUploaderProps {
  userId: string;
  avatarUrl: string | null;
  fallback: string;
  onUploaded: (publicUrl: string) => void;
}

const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export const AvatarUploader = ({
  userId,
  avatarUrl,
  fallback,
  onUploaded,
}: AvatarUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED.includes(file.type)) {
      toast({
        title: "Unsupported file",
        description: "Please upload a JPG, PNG, or WebP image.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast({
        title: "Image too large",
        description: "Maximum size is 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setUploading(false);
      toast({
        title: "Upload failed",
        description: uploadError.message,
        variant: "destructive",
      });
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    // Cache-bust so the new image shows immediately
    const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    setUploading(false);

    if (updateError) {
      toast({
        title: "Couldn't save avatar",
        description: updateError.message,
        variant: "destructive",
      });
      return;
    }

    onUploaded(publicUrl);
    toast({ title: "Profile photo updated" });
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-border">
          {avatarUrl && <AvatarImage src={avatarUrl} alt="Profile photo" />}
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
            {fallback}
          </AvatarFallback>
        </Avatar>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
            <Loader2 className="h-5 w-5 animate-spin text-foreground" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="gap-2"
      >
        <Camera className="h-4 w-4" />
        {avatarUrl ? "Change photo" : "Upload photo"}
      </Button>
    </div>
  );
};
