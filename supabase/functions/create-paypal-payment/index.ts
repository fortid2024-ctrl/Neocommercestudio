import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function getPayPalBaseUrl(mode: string): string {
  return mode === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';
}

async function getPayPalAccessToken(clientId: string, secret: string, mode: string): Promise<string> {
  const auth = btoa(`${clientId}:${secret}`);
  const baseUrl = getPayPalBaseUrl(mode);

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('PayPal token error:', errorText);
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
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

    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalSecret = Deno.env.get('PAYPAL_SECRET');
    const paypalMode = Deno.env.get('PAYPAL_MODE') || 'sandbox';

    if (!paypalClientId || !paypalSecret) {
      return new Response(
        JSON.stringify({
          error: 'PayPal not configured. Please add PAYPAL_CLIENT_ID and PAYPAL_SECRET to your environment variables.',
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

    console.log('🔧 PayPal Mode:', paypalMode);

    const originUrl = req.headers.get('origin') || 'http://localhost:5173';
    const returnUrl = `${originUrl}/download?token=${downloadToken}`;
    const cancelUrl = `${originUrl}/checkout`;

    const accessToken = await getPayPalAccessToken(paypalClientId, paypalSecret, paypalMode);
    const paypalApiUrl = getPayPalBaseUrl(paypalMode);

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderNumber,
          amount: {
            currency_code: 'USD',
            value: totalAmount.toFixed(2),
          },
          description: items.map((item: any) => item.title).join(', '),
          custom_id: JSON.stringify({
            customerName,
            customerEmail,
            items,
            downloadToken,
            orderNumber,
          }),
        },
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        brand_name: 'NeoCommerceStudio',
        user_action: 'PAY_NOW',
      },
    };

    const paypalResponse = await fetch(`${paypalApiUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!paypalResponse.ok) {
      const errorText = await paypalResponse.text();
      console.error('PayPal API error:', errorText);
      throw new Error(`PayPal API error: ${paypalResponse.status}`);
    }

    const paypalData = await paypalResponse.json();

    const approveLink = paypalData.links.find((link: any) => link.rel === 'approve');

    if (!approveLink) {
      throw new Error('PayPal approve link not found');
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: approveLink.href,
        orderId: orderNumber,
        paymentId: paypalData.id,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('PayPal payment creation error:', error);
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