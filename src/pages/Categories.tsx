import { Link } from "react-router-dom";
import { CATEGORIES } from "@/lib/constants/listings";

const CATEGORY_EMOJI: Record<string, string> = {
  phones: "📱",
  bikes: "🏍️",
  clothes: "👕",
  electronics: "💻",
  furniture: "🛋️",
  books: "📚",
};

const Categories = () => {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">Categories</h1>
      <p className="text-sm text-muted-foreground">
        Browse items by what you're looking for.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            to={`/category/${c.slug}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted"
          >
            <span className="text-3xl" aria-hidden>
              {CATEGORY_EMOJI[c.slug]}
            </span>
            <div>
              <p className="font-heading font-semibold">{c.label}</p>
              <p className="text-xs text-muted-foreground">Browse {c.label.toLowerCase()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;
