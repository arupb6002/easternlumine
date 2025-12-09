import Razorpay from "razorpay";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "POST required" });
  }

  let body = "";

  // Read stream (Vercel requirement)
  await new Promise((resolve) => {
    req.on("data", (chunk) => (body += chunk));
    req.on("end", resolve);
  });

  const data = JSON.parse(body || "{}");

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const { amount } = data;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    });

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Order error" });
  }
      }
