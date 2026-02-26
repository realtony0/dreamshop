const defaultMaintenanceMessage =
  "Le site est temporairement en maintenance. Nous revenons tres vite.";

export function isMaintenanceModeEnabled() {
  return (process.env.SITE_MAINTENANCE ?? "true").trim() === "true";
}

export function getMaintenanceMessage() {
  const message = (process.env.SITE_MAINTENANCE_MESSAGE ?? defaultMaintenanceMessage).trim();
  return message || defaultMaintenanceMessage;
}
