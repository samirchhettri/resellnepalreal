import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Profile = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            U
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-heading text-xl font-bold">Guest user</h1>
          <p className="text-sm text-muted-foreground">Kathmandu, Nepal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {["My Listings", "Settings", "Help & Support", "Safety Tips", "Logout"].map(
          (item) => (
            <button
              key={item}
              className="flex h-12 items-center justify-between rounded-xl border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              {item}
              <span className="text-muted-foreground">›</span>
            </button>
          ),
        )}
      </div>
    </div>
  );
};

export default Profile;
