import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";

export function UserPurchaseTable({
  purchases,
}: {
  purchases: {
    id: string;
    pricePaidInCents: number;
    createdAt: Date;
    refundedAt: Date | null;
    productDetails: {
      name: string;
      imageUrl: string;
    };
  }[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Refunded At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchases.map((purchase) => (
          <TableRow key={purchase.id}>
            <TableCell className="flex items-center gap-2">
              <Image
                src={purchase.productDetails.imageUrl}
                alt={purchase.productDetails.name}
                className="w-8 h-8 rounded"
              />
              {purchase.productDetails.name}
            </TableCell>
            <TableCell>{purchase.pricePaidInCents / 100}</TableCell>
            <TableCell>{purchase.createdAt.toLocaleDateString()}</TableCell>
            <TableCell>
              {purchase.refundedAt
                ? purchase.refundedAt.toLocaleDateString()
                : "N/A"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
