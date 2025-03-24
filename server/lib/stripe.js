// stripe.js
import Stripe from "stripe";

// No need for dotenv here; rely on process.env from Vercel or index.js
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

export const stripe = new Stripe(stripeSecretKey);