import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <div className="container my-6">
      <div className="flex flex-col cap-4 items-start">
        <div className="text-3xl font-semibold">결제 실패</div>
        <div className="text-xl">
          There was an error processing your payment.
        </div>
        <Button asChild className="text-xl h-auto py-4 px-8 rounded-lg">
          <Link href="/">재시도</Link>
        </Button>
      </div>
    </div>
  );
}
