import { useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { startConversation } from "@/lib/chat/startConversation";
import { formatPrice } from "@/lib/types/listing";

const orderSchema = z.object({
  fullName: z.string().trim().min(2, "Name is required").max(80),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20)
    .regex(/^[+\d\s-]+$/, "Only digits, spaces, + and -"),
  city: z.string().trim().min(2, "City is required").max(60),
  address: z.string().trim().min(5, "Full address is required").max(200),
  quantity: z.coerce.number().int().min(1).max(99),
  notes: z.string().trim().max(300).optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buyerId: string;
  sellerId: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
}

export const BuyNowDialog = ({
  open,
  onOpenChange,
  buyerId,
  sellerId,
  listingId,
  listingTitle,
  listingPrice,
}: Props) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    city: "",
    address: "",
    quantity: "1",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = orderSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[i.path[0] as string] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    const order = parsed.data;
    const total = listingPrice * order.quantity;

    // 1. Open / find conversation
    const { id: convoId, error: convoError } = await startConversation(
      buyerId,
      sellerId,
      listingId,
    );
    if (convoError || !convoId) {
      setSubmitting(false);
      toast({
        title: "Could not place order",
        description: convoError ?? "Please try again.",
        variant: "destructive",
      });
      return;
    }

    // 2. Send order details as a chat message (triggers seller notification)
    const message = [
      `🛒 *Buy Now — Cash on Delivery*`,
      ``,
      `*Item:* ${listingTitle}`,
      `*Quantity:* ${order.quantity}`,
      `*Total:* ${formatPrice(total)}`,
      ``,
      `*Buyer:* ${order.fullName}`,
      `*Phone:* ${order.phone}`,
      `*City:* ${order.city}`,
      `*Address:* ${order.address}`,
      order.notes ? `\n*Notes:* ${order.notes}` : "",
      ``,
      `Please confirm availability and delivery details.`,
    ]
      .filter(Boolean)
      .join("\n");

    const { error: msgError } = await supabase.from("messages").insert({
      conversation_id: convoId,
      sender_id: buyerId,
      content: message,
    });

    setSubmitting(false);

    if (msgError) {
      toast({
        title: "Could not send order",
        description: msgError.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Order sent! 🎉",
      description: "The seller has been notified. Continue in chat to confirm.",
    });
    onOpenChange(false);
    setForm({ fullName: "", phone: "", city: "", address: "", quantity: "1", notes: "" });
    // Navigate to the chat in the parent if desired — handled via onOpenChange callback
    window.location.assign(`/chat/${convoId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Buy Now — Cash on Delivery
          </DialogTitle>
          <DialogDescription>
            Fill in your details. The seller will contact you in chat to confirm.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-semibold line-clamp-1">{listingTitle}</p>
            <p className="text-muted-foreground">
              {formatPrice(listingPrice)}
              {form.quantity && Number(form.quantity) > 1 && (
                <span> × {form.quantity} = {formatPrice(listingPrice * Number(form.quantity))}</span>
              )}
            </p>
          </div>

          <div>
            <Label htmlFor="fullName">Full name *</Label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="Ram Bahadur"
              maxLength={80}
            />
            {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Phone number *</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+977 98XXXXXXXX"
              maxLength={20}
            />
            {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
          </div>

          <div>
            <Label htmlFor="city">City / District *</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Kathmandu"
              maxLength={60}
            />
            {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city}</p>}
          </div>

          <div>
            <Label htmlFor="address">Delivery address *</Label>
            <Textarea
              id="address"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Street, area, landmark"
              rows={2}
              maxLength={200}
            />
            {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address}</p>}
          </div>

          <div>
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={99}
              value={form.quantity}
              onChange={(e) => update("quantity", e.target.value)}
            />
            {errors.quantity && <p className="mt-1 text-xs text-destructive">{errors.quantity}</p>}
          </div>

          <div>
            <Label htmlFor="notes">Notes for seller (optional)</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Preferred delivery time, color, etc."
              rows={2}
              maxLength={300}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShoppingBag className="h-4 w-4" />
              )}
              Place order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
