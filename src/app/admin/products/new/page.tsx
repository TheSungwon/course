import { PageHeader } from "@/components/ui/PageHeader";
import { ProductForm } from "@/features/products/components/ProductForm";

export default function NewProductPage() {
  return (
    <div className="container my-6">
      <PageHeader title="New Products" />
      <ProductForm />
    </div>
  );
}
