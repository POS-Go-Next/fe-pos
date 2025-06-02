"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

interface PaymentSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPrintBills?: () => void;
}

export default function PaymentSuccessDialog({
  isOpen,
  onClose,
  onPrintBills,
}: PaymentSuccessDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg px-8 py-12 text-center max-w-sm w-full">
        <div className="flex justify-center mb-8">
          {/* <div className="bg-blue-500 text-white rounded-full p-4 inline-block">
            <Check size={48} />
          </div> */}
          <Image
            src={"/icons/success-icon.svg"}
            width={150}
            height={150}
            alt="icon success"
          />
        </div>
        <h2 className="text-2xl text-[#202325] mb-4 font-semibold">
          Payment Successful!!
        </h2>
        <p className="text-sm text-[#636566] mb-6 font-normal">
          Thank you for the payment! You can check status of the order on orders
          page.
        </p>
        <div className="flex space-x-4">
          <Button
            variant="outline"
            className="flex-1 p-6"
            onClick={onPrintBills}
          >
            Print Bills
          </Button>
          <Button className="flex-1 p-6" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
