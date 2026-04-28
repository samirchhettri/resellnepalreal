import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, MapPin, MessageSquare, Eye, AlertTriangle, Ban, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";

const TIPS = [
  {
    icon: MapPin,
    title: "Meet in public places",
    body: "Always meet buyers and sellers in busy, well-lit public spots. Avoid isolated locations.",
  },
  {
    icon: Eye,
    title: "Inspect before paying",
    body: "Check the item carefully. Test electronics, check IMEI on phones, and verify documents.",
  },
  {
    icon: MessageSquare,
    title: "Keep chats inside the app",
    body: "Use in-app chat so we can help if something goes wrong. Avoid sharing personal contact early.",
  },
  {
    icon: AlertTriangle,
    title: "Watch for red flags",
    body: "Be careful of prices that seem too good to be true, requests for advance payment, or asks for OTPs.",
  },
  {
    icon: Ban,
    title: "Never share OTP or passwords",
    body: "No genuine buyer or seller will ever ask for your OTP, bank PIN, or account password.",
  },
  {
    icon: Flag,
    title: "Report and block",
    body: "Use the report button on any listing or user that feels suspicious. Block users to stop contact.",
  },
];

const Safety = () => {
  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild aria-label="Back">
          <Link to="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="font-heading text-xl font-bold">Safety tips</h1>
      </div>

      <section className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/15 p-2.5">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold">Stay safe on reSell Nepal</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Most users are great, but a few simple habits keep every deal safer.
            </p>
          </div>
        </div>
      </section>

      <ul className="space-y-3">
        {TIPS.map(({ icon: Icon, title, body }) => (
          <li
            key={title}
            className="flex gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="rounded-lg bg-muted p-2 shrink-0">
              <Icon className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h3 className="font-heading font-semibold">{title}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">{body}</p>
            </div>
          </li>
        ))}
      </ul>

      <section className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Need to report someone?</p>
        <p className="mt-1">
          Open any listing or profile and tap the <span className="font-medium">Report</span> button.
          You can also block users to stop further contact.
        </p>
      </section>
    </div>
  );
};

export default Safety;
