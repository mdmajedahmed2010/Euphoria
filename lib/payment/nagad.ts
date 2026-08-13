/**
 * Euphoria — Nagad Sandbox Payment Gateway Integration
 */

// interface removed

// config removed

export async function createNagadPayment(orderId: string, amount: number) {
  try {
    // Return mock Sandbox URL
    return {
      success: true,
      paymentRefId: `NAGAD-${Date.now()}`,
      nagadURL: `/payment/nagad/sandbox?order=${orderId}&amount=${amount}`,
    };
  } catch (error) {
    console.error("Nagad Create Payment Error:", error);
    return { success: false, error: "Failed to create Nagad payment" };
  }
}

export async function verifyNagadPayment(_paymentRefId: string) {
  try {
    // Mock verification
    return {
      success: true,
      status: "Success",
      amount: "1000",
      trxId: `NTRX${Date.now().toString(16).toUpperCase()}`,
    };
  } catch (error) {
    console.error("Nagad Verify Payment Error:", error);
    return { success: false, error: "Failed to verify Nagad payment" };
  }
}
