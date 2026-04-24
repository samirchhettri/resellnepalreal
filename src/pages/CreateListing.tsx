import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, CONDITIONS } from "@/lib/constants/listings";
import { listingSchema, type ListingInput } from "@/lib/validators/listing";
import { ImagePicker, type ImageDraft } from "@/components/listings/ImagePicker";

const CreateListing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [images, setImages] = useState<ImageDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ListingInput>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      is_negotiable: true,
      category: undefined,
      condition: undefined,
      location: "",
    },
  });

  // Prefill location from profile when it loads
  useEffect(() => {
    if (profile?.location) setValue("location", profile.location);
  }, [profile, setValue]);

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values: ListingInput) => {
    if (!user) return;

    if (images.length === 0) {
      toast({
        title: "Add at least one photo",
        description: "Listings with photos sell faster.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload all images in parallel
      const uploads = await Promise.all(
        images.map(async (img) => {
          const ext = img.file.name.split(".").pop()?.toLowerCase() ?? "jpg";
          const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from("listing-images")
            .upload(path, img.file, { contentType: img.file.type, upsert: false });
          if (upErr) throw upErr;
          const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
          return data.publicUrl;
        }),
      );

      // 2. Insert the listing row
      const { error: insertErr } = await supabase.from("listings").insert({
        user_id: user.id,
        title: values.title,
        description: values.description,
        price: values.price,
        is_negotiable: values.is_negotiable,
        category: values.category,
        condition: values.condition,
        location: values.location,
        images: uploads,
      });
      if (insertErr) throw insertErr;

      toast({
        title: "Listing published 🎉",
        description: "Your item is now live for buyers to find.",
      });
      navigate("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast({
        title: "Couldn't publish listing",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
        <h1 className="font-heading text-xl font-bold">Create listing</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <section className="space-y-2">
          <Label>Photos</Label>
          <ImagePicker images={images} onChange={setImages} disabled={submitting} />
        </section>

        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="iPhone 13 Pro 128GB"
            aria-invalid={!!errors.title}
            {...register("title")}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={5}
            placeholder="Condition, what's included, reason for selling..."
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="price">Price (NPR)</Label>
            <Input
              id="price"
              type="number"
              inputMode="decimal"
              min={0}
              step="1"
              placeholder="0"
              aria-invalid={!!errors.price}
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-xs text-destructive">{errors.price.message}</p>
            )}
          </div>

          <Controller
            control={control}
            name="is_negotiable"
            render={({ field }) => (
              <div className="flex items-end">
                <label className="flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 text-sm">
                  <span className="font-medium">Price negotiable</span>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </label>
              </div>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-invalid={!!errors.category}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Condition</Label>
            <Controller
              control={control}
              name="condition"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-invalid={!!errors.condition}>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.condition && (
              <p className="text-xs text-destructive">{errors.condition.message}</p>
            )}
          </div>
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

        <div className="sticky bottom-16 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md safe-bottom">
          <Button type="submit" className="h-11 w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish listing"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateListing;
