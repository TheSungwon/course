import {
  SkeletonArray,
  SkeletonButton,
  SkeletonText,
} from "@/components/Skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatPrice } from "@/lib/formatters";
import Image from "next/image";
import Link from "next/link";

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

          <TableHead>Created At</TableHead>
          <TableHead>가격</TableHead>
          <TableHead>자세히</TableHead>
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
                width={192}
                height={192}
              />
              {purchase.productDetails.name}
            </TableCell>

            <TableCell>{formatDate(purchase.createdAt)}</TableCell>
            <TableCell>
              {purchase.refundedAt ? (
                <Badge variant="outline">환불</Badge>
              ) : (
                formatPrice(purchase.pricePaidInCents)
              )}
            </TableCell>
            <TableCell>
              <Button asChild variant="outline">
                <Link href={`/purchases/${purchase.id}`}>Details</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function UserPurchaseTableSkeleton() {
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
        <SkeletonArray amount={3}>
          <TableRow>
            <TableCell className="flex items-center gap-2">
              <div className="size-12 bg-secondary animate-pulse rounded" />
              <div className="flex flex-col gap-1">
                <SkeletonText className="w-36" />
                <SkeletonText className="w-3/4" />
              </div>
            </TableCell>
            <TableCell>
              <SkeletonText className="w-12" />
            </TableCell>
            <TableCell>
              <SkeletonButton />
            </TableCell>
          </TableRow>
        </SkeletonArray>
      </TableBody>
    </Table>
  );
}
