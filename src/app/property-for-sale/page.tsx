import { redirect } from "next/navigation";

/** Convenience alias kept for inbound links: /property-for-sale → main sale search. */
export default function PropertyForSaleIndex() {
  redirect("/properties/for-sale");
}
