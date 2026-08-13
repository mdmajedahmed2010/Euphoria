/**
 * Euphoria — Product Grid Component
 * Responsive grid layout for product cards
 * SOP §২ — Frontend Plan F3.5
 */

import { ProductCard, type ProductCardProps } from "./product-card";
import { ProductCardSkeleton } from "./product-card-skeleton";

interface ProductGridProps {
  products: ProductCardProps[];
  columns?: 3 | 4;
}

export function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  const gridCols =
    columns === 3 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div className={`grid ${gridCols} gap-4 md:gap-6`}>
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
