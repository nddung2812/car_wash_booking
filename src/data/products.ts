import productsData from "./products.json";

export type ProductCategory = "wash" | "interior" | "wax-polish" | "accessories";
export type ProductBadge = "Best seller" | "New" | "Staff pick";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  wash: "Wash",
  interior: "Interior",
  "wax-polish": "Wax & Polish",
  accessories: "Accessories",
};

export interface Product {
  id: string;
  name: string;
  tagline: string;
  price: number;
  category: ProductCategory;
  description: string;
  features: string[];
  image: string;
  badge?: ProductBadge;
  inStock: boolean;
  brand?: string;
  sku?: string;
  sourceUrl?: string;
}

export const products: Product[] = productsData as Product[];
