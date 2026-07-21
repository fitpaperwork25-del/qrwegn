// Ported verbatim from the approved reference's aiReply() function.
// Pure client-side keyword matching — no network call, no AI provider.
// The reference explicitly labels this a prototype: "A production
// version would connect to an approved AI service." Wiring a real
// model in is a deliberate later step, not part of this reproduction.
export function aiReply(text: string): string {
  const value = text.toLowerCase();

  if (value.includes("grocery") || value.includes("retail") || value.includes("store")) {
    return "Wegn Store is the best fit. It is designed for sales, inventory, purchasing, customers, staff, and reporting. Ethiopia pricing can be shown in ETB.";
  }
  if (value.includes("restaurant") || value.includes("coffee") || value.includes("hotel") || value.includes("café") || value.includes("cafe")) {
    return "QRWegn is the best fit for your hospitality business. It supports digital menus, ordering experiences, and guest engagement.";
  }
  if (value.includes("salon") || value.includes("barber") || value.includes("clinic") || value.includes("appointment")) {
    return "QRBooker is the best fit. It is designed for appointments, schedules, service availability, and customer bookings.";
  }
  if (value.includes("partner")) {
    return "WEGN Partners is intended for people and organizations helping local businesses adopt WEGN products. Use the Become a Partner section to continue.";
  }
  if (value.includes("price") || value.includes("pricing") || value.includes("ethiopia")) {
    return "Select Ethiopia in the Pricing section to view ETB plans. Published pricing would be controlled from WEGN Platform Admin.";
  }
  return "I can help with Wegn Store, QRWegn, QRBooker, country pricing, demos, or becoming a WEGN Partner.";
}
