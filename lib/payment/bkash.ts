/**
 * Euphoria — bKash Sandbox Payment Gateway Integration
 */

// interface removed

/**
 * Step 1: Grant Token
 */
export async function grantToken() {
  try {
    // Return a mock token for sandbox
    return {
      success: true,
      id_token: "mock_bkash_sandbox_token_123456",
      token_type: "Bearer",
      expires_in: 3600,
    };
  } catch (error) {
    console.error("bKash Token Error:", error);
    return { success: false, error: "Failed to generate token" };
  }
}

/**
 * Step 2: Create Payment
 */
export async function createPayment(orderId: string, amount: number) {
  try {
    // In sandbox, we just return a mock URL
    return {
      success: true,
      paymentID: `PAY-${Date.now()}`,
      bkashURL: `/payment/bkash/sandbox?order=${orderId}&amount=${amount}`,
      callbackURL: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/webhook?gateway=bkash`,
      amount,
      currency: "BDT",
      intent: "sale",
    };
  } catch (error) {
    console.error("bKash Create Payment Error:", error);
    return { success: false, error: "Failed to create payment" };
  }
}

/**
 * Step 3: Execute Payment (Called by webhook)
 */
export async function executePayment(paymentID: string) {
  try {
    // Mock execution for sandbox
    return {
      success: true,
      trxID: `TRX${Date.now().toString(16).toUpperCase()}`,
      transactionStatus: "Completed",
      amount: "1000",
      currency: "BDT",
      paymentID,
    };
  } catch (error) {
    console.error("bKash Execute Payment Error:", error);
    return { success: false, error: "Failed to execute payment" };
  }
}
