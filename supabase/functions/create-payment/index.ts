import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

async function generateSign(data: any, apiKey: string): Promise<string> {
  const jsonString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonString + apiKey);
  const hashBuffer = await crypto.subtle.digest('MD5', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();
    const { items, customerName, customerEmail, totalAmount } = body;

    if (!items || !customerEmail || !totalAmount) {
      throw new Error('Missing required fields');
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const downloadToken = crypto.randomUUID();

    const cryptomusApiKey = Deno.env.get('CRYPTOMUS_API_KEY');
    const cryptomusMerchantId = Deno.env.get('CRYPTOMUS_MERCHANT_ID');

    if (!cryptomusApiKey || !cryptomusMerchantId) {
      return new Response(
        JSON.stringify({
          error: 'Payment gateway not configured. Please add CRYPTOMUS_API_KEY and CRYPTOMUS_MERCHANT_ID to your environment variables.',
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const baseUrl = req.headers.get('origin') || 'http://localhost:5173';
    const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook`;
    const returnUrl = `${baseUrl}/download?token=${downloadToken}`;

    const paymentData = {
      amount: totalAmount.toFixed(2),
      currency: 'USD',
      order_id: orderNumber,
      url_return: returnUrl,
      url_callback: callbackUrl,
      is_payment_multiple: false,
      lifetime: 3600,
      additional_data: JSON.stringify({
        customerName,
        customerEmail,
        items,
        downloadToken,
      }),
    };

    const sign = await generateSign(paymentData, cryptomusApiKey);

    const cryptomusResponse = await fetch('https://api.cryptomus.com/v1/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'merchant': cryptomusMerchantId,
        'sign': sign,
      },
      body: JSON.stringify(paymentData),
    });

    if (!cryptomusResponse.ok) {
      const errorText = await cryptomusResponse.text();
      console.error('Cryptomus API error:', errorText);
      throw new Error(`Cryptomus API error: ${cryptomusResponse.status}`);
    }

    const cryptomusData = await cryptomusResponse.json();

    if (cryptomusData.state === 0 && cryptomusData.result) {
      return new Response(
        JSON.stringify({
          success: true,
          paymentUrl: cryptomusData.result.url,
          orderId: orderNumber,
          paymentId: cryptomusData.result.uuid,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    throw new Error(cryptomusData.message || 'Failed to create payment');
  } catch (error) {
    console.error('Payment creation error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
