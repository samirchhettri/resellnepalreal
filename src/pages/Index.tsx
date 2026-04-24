import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const categories = [
  { slug: "phones", label: "Phones", emoji: "📱" },
  { slug: "bikes", label: "Bikes", emoji: "🏍️" },
  { slug: "clothes", label: "Clothes", emoji: "👕" },
  { slug: "electronics", label: "Electronics", emoji: "💻" },
  { slug: "furniture", label: "Furniture", emoji: "🛋️" },
  { slug: "books", label: "Books", emoji: "📚" },
];

const Index = () => {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider opacity-90">
          Welcome
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold leading-tight">
          Buy & sell locally in Nepal
        </h1>
        <p className="mt-2 text-sm opacity-90">
          List in seconds. Chat instantly. Find great deals near you.
        </p>
        <Link
          to="/create-listing"
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-background px-5 text-sm font-semibold text-foreground transition-transform active:scale-95"
        >
          Start selling
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Categories</h2>
          <Link to="/categories" className="text-sm font-medium text-primary">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to={`/category/${c.slug}`}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-3 text-center shadow-sm transition-colors hover:bg-muted"
            >
              <span className="text-2xl" aria-hidden>
                {c.emoji}
              </span>
              <span className="text-xs font-medium">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold">Latest items</h2>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              <div className="aspect-square bg-muted" />
              <div className="space-y-1 p-3">
                <div className="h-3 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
