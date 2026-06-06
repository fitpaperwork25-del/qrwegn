import Stripe from "https://esm.sh/stripe@13.3.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

Deno.serve(async (req) => {
  const { email, userId } = await req.json();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "QRSolutions Subscription" },
          unit_amount: 4900,
        },
        quantity: 1,
      },
    ],
    metadata: { userId },
    success_url: `${req.headers.get("origin")}/staff/dashboard`,
    cancel_url: `${req.headers.get("origin")}/register`,
  });

  return new Response(JSON.stringify({ sessionId: session.id }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
});