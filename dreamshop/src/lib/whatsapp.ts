import { formatMoney } from "@/lib/money";

export type WhatsAppOrderLine = {
  productName: string;
  colorName: string;
  size: string;
  quantity: number;
  unitPriceCents: number;
};

export type WhatsAppOrderPayload = {
  orderId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address1: string;
  address2?: string | null;
  postalCode: string;
  city: string;
  country: string;
  totalCents: number;
  items: WhatsAppOrderLine[];
};

const fallbackNumber = "221783899477";

export function getWhatsAppOrderNumber() {
  const normalized = (
    process.env.WHATSAPP_ORDER_NUMBER ?? fallbackNumber
  ).replace(/\D/g, "");
  return normalized || fallbackNumber;
}

export function buildWhatsAppOrderMessage(order: WhatsAppOrderPayload) {
  const lines = order.items.map(
    (item, index) =>
      `${index + 1}. ${item.productName} (${item.colorName}, ${item.size}) x${item.quantity} - ${formatMoney(item.unitPriceCents * item.quantity)}`
  );

  return [
    "Nouvelle commande Dreamshop",
    `Ref: ${order.orderId}`,
    "",
    `Client: ${order.firstName} ${order.lastName}`,
    `Email: ${order.email}`,
    `Telephone: ${order.phone?.trim() ? order.phone.trim() : "-"}`,
    "",
    "Adresse:",
    `${order.address1}${order.address2?.trim() ? `, ${order.address2.trim()}` : ""}`,
    `${order.postalCode} ${order.city}, ${order.country}`,
    "",
    "Articles:",
    ...lines,
    "",
    `Total: ${formatMoney(order.totalCents)}`,
  ].join("\n");
}

export function buildWhatsAppOrderUrl(order: WhatsAppOrderPayload) {
  const number = getWhatsAppOrderNumber();
  const text = buildWhatsAppOrderMessage(order);
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
