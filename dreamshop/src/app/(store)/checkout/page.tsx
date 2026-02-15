import { CheckoutPage } from "@/components/checkout/checkout-page";
import { getCheckoutSettings } from "@/lib/site-settings";

export default async function CheckoutRoute() {
  const checkoutSettings = await getCheckoutSettings();
  return (
    <CheckoutPage
      defaultCountry={checkoutSettings.baseCountry}
      checkoutNote={checkoutSettings.note}
    />
  );
}
