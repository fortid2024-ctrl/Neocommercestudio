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

async function verifyPayPalWebhook(
  webhookId: string,
  transmissionId: string,
  transmissionTime: string,
  certUrl: string,
  authAlgo: string,
  transmissionSig: string,
  webhookEvent: any,
  accessToken: string,
  mode: string
): Promise<boolean> {
  const baseUrl = getPayPalBaseUrl(mode);
  const verifyUrl = `${baseUrl}/v1/notifications/verify-webhook-signature`;

  const verifyData = {
    transmission_id: transmissionId,
    transmission_time: transmissionTime,
    cert_url: certUrl,
    auth_algo: authAlgo,
    transmission_sig: transmissionSig,
    webhook_id: webhookId,
    webhook_event: webhookEvent,
  };

  const response = await fetch(verifyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(verifyData),
  });

  if (!response.ok) {
    console.error('PayPal verification failed:', await response.text());
    return false;
  }

  const result = await response.json();
  return result.verification_status === 'SUCCESS';
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
    const webhookEvent = await req.json();

    console.log('📥 PayPal Webhook received:', webhookEvent.event_type);

    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalSecret = Deno.env.get('PAYPAL_SECRET');
    const paypalWebhookId = Deno.env.get('PAYPAL_WEBHOOK_ID');
    const paypalMode = Deno.env.get('PAYPAL_MODE') || 'sandbox';

    console.log('🔧 PayPal Webhook Mode:', paypalMode);

    if (!paypalClientId || !paypalSecret) {
      console.error('❌ PayPal credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Configuration error' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (paypalWebhookId) {
      const transmissionId = req.headers.get('paypal-transmission-id');
      const transmissionTime = req.headers.get('paypal-transmission-time');
      const certUrl = req.headers.get('paypal-cert-url');
      const authAlgo = req.headers.get('paypal-auth-algo');
      const transmissionSig = req.headers.get('paypal-transmission-sig');

      if (transmissionId && transmissionTime && certUrl && authAlgo && transmissionSig) {
        const accessToken = await getPayPalAccessToken(paypalClientId, paypalSecret, paypalMode);
        const isValid = await verifyPayPalWebhook(
          paypalWebhookId,
          transmissionId,
          transmissionTime,
          certUrl,
          authAlgo,
          transmissionSig,
          webhookEvent,
          accessToken,
          paypalMode
        );

        if (!isValid) {
          console.error('❌ Invalid PayPal webhook signature');
          return new Response(
            JSON.stringify({ error: 'Invalid signature' }),
            {
              status: 403,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
              },
            }
          );
        }
        console.log('✅ PayPal signature verified');
      }
    }

    if (webhookEvent.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      console.log('💰 PayPal payment captured!');

      const purchaseUnit = webhookEvent.resource.purchase_units?.[0];
      if (!purchaseUnit) {
        throw new Error('No purchase unit found');
      }

      let customData;
      try {
        customData = JSON.parse(purchaseUnit.custom_id || '{}');
      } catch (e) {
        console.error('Failed to parse custom_id:', e);
        customData = {};
      }

      const { customerName, customerEmail, items, downloadToken, orderNumber } = customData;
      const amount = parseFloat(purchaseUnit.amount.value);

      const firebaseProjectId = Deno.env.get('VITE_FIREBASE_PROJECT_ID');
      const firebaseApiKey = Deno.env.get('VITE_FIREBASE_API_KEY');

      if (!firebaseProjectId || !firebaseApiKey) {
        console.error('❌ Firebase configuration missing');
        return new Response(
          JSON.stringify({ error: 'Database configuration error' }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/orders?key=${firebaseApiKey}`;

      const orderRecord = {
        fields: {
          order_number: { stringValue: orderNumber || purchaseUnit.reference_id },
          customer_name: { stringValue: customerName || '' },
          customer_email: { stringValue: customerEmail || '' },
          amount_paid: { doubleValue: amount },
          currency: { stringValue: purchaseUnit.amount.currency_code || 'USD' },
          payment_status: { stringValue: 'completed' },
          paypal_payment_id: { stringValue: webhookEvent.resource.id || '' },
          download_token: { stringValue: downloadToken || '' },
          items: { stringValue: JSON.stringify(items || []) },
          created_at: { timestampValue: new Date().toISOString() },
        },
      };

      const firestoreResponse = await fetch(firestoreUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderRecord),
      });

      if (!firestoreResponse.ok) {
        const errorText = await firestoreResponse.text();
        console.error('❌ Firestore error:', errorText);
        throw new Error('Failed to save order to Firestore');
      }

      console.log('✅ PayPal order saved to Firestore');

      return new Response(
        JSON.stringify({ success: true, message: 'Payment processed' }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('ℹ️ PayPal event type not handled:', webhookEvent.event_type);
    return new Response(
      JSON.stringify({ success: true, message: 'Webhook received' }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('❌ PayPal webhook error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
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
});