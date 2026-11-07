import { Invoice, ShopSettings } from "@/types";
import { formatCurrency, formatCurrencyExact, formatDate } from "./utils";

/**
 * Converts numbers into Indian currency in words (e.g. 144900 -> One Lakh Forty-Four Thousand Nine Hundred Rupees Only)
 */
export function numberToWordsIndian(num: number): string {
  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function inWords(n: number): string {
    if (n === 0) return "Zero";
    let str = "";
    const crore = Math.floor(n / 10000000);
    n %= 10000000;
    const lakh = Math.floor(n / 100000);
    n %= 100000;
    const thousand = Math.floor(n / 1000);
    n %= 1000;
    const hundred = Math.floor(n / 100);
    n %= 100;

    if (crore > 0) str += inWords(crore) + " Crore ";
    if (lakh > 0) str += inWords(lakh) + " Lakh ";
    if (thousand > 0) str += inWords(thousand) + " Thousand ";
    if (hundred > 0) str += a[hundred] + " Hundred ";
    if (n > 0) {
      if (str !== "") str += "and ";
      if (n < 20) str += a[n];
      else str += b[Math.floor(n / 10)] + " " + a[n % 10];
    }
    return str.trim();
  }

  const rounded = Math.round(num);
  return `${inWords(rounded)} Rupees Only`;
}

