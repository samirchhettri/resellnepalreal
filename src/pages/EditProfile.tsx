import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { profileSchema, type ProfileInput } from "@/lib/validators/profile";
import { AvatarUploader } from "@/components/profile/AvatarUploader";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, loading, refetch } = useProfile();
  const [submitting, setSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: "", location: "", bio: "" },
  });

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name ?? "",
        location: profile.location ?? "",
        bio: profile.bio ?? "",
      });
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile, reset]);

  const bioValue = watch("bio") ?? "";

  const onSubmit = async (values: ProfileInput) => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: values.full_name,
        location: values.location || null,
        bio: values.bio || null,
      })
      .eq("id", user.id);
    setSubmitting(false);

    if (error) {
      toast({
        title: "Couldn't save changes",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Profile updated" });
    await refetch();
    navigate("/profile");
  };

  if (loading || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const fallback = getInitials(profile?.full_name ?? user.email ?? "U");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-heading text-xl font-bold">Edit profile</h1>
      </div>

      <AvatarUploader
        userId={user.id}
        avatarUrl={avatarUrl}
        fallback={fallback}
        onUploaded={(url) => setAvatarUrl(url)}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            placeholder="Sita Sharma"
            aria-invalid={!!errors.full_name}
            {...register("full_name")}
          />
          {errors.full_name && (
            <p className="text-xs text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Kathmandu, Nepal"
            aria-invalid={!!errors.location}
            {...register("location")}
          />
          {errors.location && (
            <p className="text-xs text-destructive">{errors.location.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="bio">Bio</Label>
            <span className="text-xs text-muted-foreground">{bioValue.length}/280</span>
          </div>
          <Textarea
            id="bio"
            placeholder="Tell buyers a bit about yourself..."
            rows={4}
            aria-invalid={!!errors.bio}
            {...register("bio")}
          />
          {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-11"
            onClick={() => navigate("/profile")}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1 h-11" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
