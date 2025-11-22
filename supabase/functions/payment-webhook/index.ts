import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

async function verifySignature(body: any, signature: string, apiKey: string): Promise<boolean> {
  const jsonString = JSON.stringify(body);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonString + apiKey);
  const hashBuffer = await crypto.subtle.digest('MD5', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === signature;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const signature = req.headers.get('sign');
    const body = await req.json();

    console.log('📥 Webhook received:', body);
    console.log('🔐 Signature:', signature);

    const cryptomusApiKey = Deno.env.get('CRYPTOMUS_API_KEY');

    if (!cryptomusApiKey) {
      console.error('❌ CRYPTOMUS_API_KEY not configured');
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

    if (signature) {
      const isValid = await verifySignature(body, signature, cryptomusApiKey);
      if (!isValid) {
        console.error('❌ Invalid signature');
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
      console.log('✅ Signature verified');
    }

    const {
      order_id,
      status,
      payment_amount,
      uuid,
      additional_data,
    } = body;

    console.log(`📊 Payment status: ${status} for order: ${order_id}`);

    if (status === 'paid' || status === 'paid_over') {
      console.log('💰 Payment confirmed!');

      let orderData;
      try {
        orderData = JSON.parse(additional_data || '{}');
      } catch (e) {
        orderData = {};
      }

      const { customerName, customerEmail, items, downloadToken } = orderData;

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
          order_number: { stringValue: order_id },
          customer_name: { stringValue: customerName || '' },
          customer_email: { stringValue: customerEmail || '' },
          amount_paid: { doubleValue: parseFloat(payment_amount) },
          currency: { stringValue: 'USD' },
          payment_status: { stringValue: 'completed' },
          cryptomus_payment_id: { stringValue: uuid || '' },
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

      console.log('✅ Order saved to Firestore');

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

    console.log('ℹ️ Payment status not completed:', status);
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
    console.error('❌ Webhook error:', error);
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
