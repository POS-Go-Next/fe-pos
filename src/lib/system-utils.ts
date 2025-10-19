export async function getSystemDeviceId(): Promise<string | null> {
  try {
    const response = await fetch("http://localhost:8321/api/system/info");
    const data = await response.json();

    if (data.success && data.data?.deviceConfig?.deviceId) {
      const deviceId = data.data.deviceConfig.deviceId;
      return deviceId;
    }

    return null;
  } catch (error) {
    console.error("❌ Error getting device ID:", error);
    return null;
  }
}

export async function getNextInvoiceNumber(): Promise<string> {
  try {
    const response = await fetch("/api/transaction/next-invoice");
    const data = await response.json();
    return data.data?.invoice_number || "S25080315";
  } catch (error) {
    console.error("Error getting next invoice:", error);
    return "S25080315";
  }
}