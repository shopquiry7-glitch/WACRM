export interface PaymentLinkItem {
  amount: number;
  currency: string;
  label: string;
  url: string;
  popular?: boolean;
}

export const ZIINA_PAYMENT_LINKS: PaymentLinkItem[] = [
  {
    amount: 100,
    currency: "AED",
    label: "100 AED",
    url: "https://pay.ziina.com/Jeose/U68Mx0WHl?source=app",
  },
  {
    amount: 199,
    currency: "AED",
    label: "199 AED",
    url: "https://pay.ziina.com/Jeose/3qvMbRf6q?source=app",
  },
  {
    amount: 299,
    currency: "AED",
    label: "299 AED",
    url: "https://pay.ziina.com/Jeose/AJuoq0ug8?source=app",
    popular: true,
  },
  {
    amount: 399,
    currency: "AED",
    label: "399 AED",
    url: "https://pay.ziina.com/Jeose/-hO_FhkT1?source=app",
    popular: true,
  },
];

export function getZiinaLinkForAmount(amount?: number): string {
  if (!amount) return ZIINA_PAYMENT_LINKS[2].url; // Default 299
  const match = ZIINA_PAYMENT_LINKS.find((p) => p.amount === amount);
  return match ? match.url : ZIINA_PAYMENT_LINKS[2].url;
}
