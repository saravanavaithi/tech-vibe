/**
 * Simulates sending an SMS message via a third-party API.
 * In a real-world application, this function would contain a fetch() call
 * to an SMS gateway service like Twilio.
 *
 * @param to The recipient's phone number.
 * @param message The text message to send.
 * @returns A promise that resolves to true if the SMS was "sent" successfully.
 */
export async function sendSms(to: string, message: string): Promise<boolean> {
  console.log(`%c[SMS Service] Sending SMS...`, 'color: #0ea5e9');
  console.log(`%c  - To: ${to}`, 'color: #64748b');
  console.log(`%c  - Message: "${message}"`, 'color: #64748b');

  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate a successful API call. In a real app, you'd check the API response.
  if (!to || !message) {
    console.error('[SMS Service] Error: Missing recipient or message.');
    return false;
  }

  console.log(`%c[SMS Service] ✅ SMS sent successfully to ${to}.`, 'color: #22c55e');
  return true;
}
