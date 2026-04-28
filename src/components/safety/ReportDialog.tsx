import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const REASONS = [
  { value: "spam", label: "Spam or misleading" },
  { value: "scam", label: "Scam or fraud" },
  { value: "prohibited", label: "Prohibited item" },
  { value: "offensive", label: "Offensive or unsafe" },
  { value: "other", label: "Other" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: "listing" | "user";
  listingId?: string;
  reportedUserId?: string;
}

export const ReportDialog = ({
  open,
  onOpenChange,
  targetType,
  listingId,
  reportedUserId,
}: Props) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Please log in to report", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      target_type: targetType,
      listing_id: listingId ?? null,
      reported_user_id: reportedUserId ?? null,
      reason,
      details: details.trim().slice(0, 1000) || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Could not submit report", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Report submitted", description: "Thanks — our team will review it." });
    setDetails("");
    setReason("spam");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report {targetType}</DialogTitle>
          <DialogDescription>
            Help keep reSell Nepal safe. Tell us what's wrong.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Reason</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {REASONS.map((r) => (
                <div key={r.value} className="flex items-center gap-2">
                  <RadioGroupItem value={r.value} id={`reason-${r.value}`} />
                  <Label htmlFor={`reason-${r.value}`} className="font-normal cursor-pointer">
                    {r.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-details">Details (optional)</Label>
            <Textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 1000))}
              placeholder="Add any details that help us review..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">{details.length}/1000</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
