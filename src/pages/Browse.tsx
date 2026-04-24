const Browse = () => {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">Browse</h1>
      <p className="text-sm text-muted-foreground">
        Explore listings by category, price, and location.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl border border-border bg-card shadow-sm"
          />
        ))}
      </div>
    </div>
  );
};

export default Browse;
