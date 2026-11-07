import { Coupon } from "@/types";

export const AVAILABLE_COUPONS: Coupon[] = [
  {
    code: "WELCOME500",
    description: "₹500 flat discount on luxury smartphones above ₹10,000",
    discountType: "fixed",
    discountValue: 500,
    minOrderValue: 10000,
    expiresAt: "2026-12-31",
    usedCount: 42,
  },
  {
    code: "ANIL5",
    description: "5% savings on all flagship devices & genuine accessories",
    discountType: "percentage",
    discountValue: 5,
    minOrderValue: 1500,
    maxDiscount: 2500,
    expiresAt: "2026-12-31",
    usedCount: 118,
  },
  {
    code: "FESTIVE1000",
    description: "₹1,000 festive gift voucher on orders above ₹25,000",
    discountType: "fixed",
    discountValue: 1000,
    minOrderValue: 25000,
    expiresAt: "2026-12-31",
    usedCount: 89,
  },
];

