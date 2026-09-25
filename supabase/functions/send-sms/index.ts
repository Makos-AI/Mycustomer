import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    // 1. Parse the Custom SMS Hook payload from Supabase Auth
    // Supabase sends { phone, code } when a user requests an OTP
    const payload = await req.json();
    const { phone, code } = payload;

    // Termii expects the phone number without the '+' sign (e.g., 2348000000000)
    const termiiPhone = phone.replace('+', '');

    // 2. Get Termii credentials from Supabase Edge Function environment variables
    const TERMII_API_KEY = Deno.env.get('TERMII_API_KEY');
    
    // Fallback to "N-Alert" if you don't have a custom approved Sender ID yet
    const TERMII_SENDER_ID = Deno.env.get('TERMII_SENDER_ID') || 'N-Alert'; 

    if (!TERMII_API_KEY) {
      throw new Error('Missing TERMII_API_KEY environment variable');
    }

    // 3. Construct the SMS message
    const message = `Your MyCustomer security code is: ${code}. Do not share this code with anyone.`;

    // 4. Construct the Termii payload
    const termiiData = {
      to: termiiPhone,
      from: TERMII_SENDER_ID,
      sms: message,
      type: "plain",
      channel: "dnd", // "dnd" channel is required in Nigeria to bypass Do Not Disturb blocks
      api_key: TERMII_API_KEY,
    };

    // 5. Call the Termii API
    const response = await fetch("https://api.ng.termii.com/api/sms/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(termiiData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Termii API Error:", result);
      throw new Error(result.message || 'Failed to send SMS via Termii');
    }

    // Return success so Supabase knows the hook fired correctly
    return new Response(JSON.stringify({ success: true, result }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Edge Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
