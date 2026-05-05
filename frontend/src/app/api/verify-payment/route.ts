import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();
    const secret = process.env.RAZORPAY_KEY_SECRET!;

    // Re-create the secure signature using your backend secret
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    // Compare the signatures. If they match, the payment is 100% legitimate.
    if (generated_signature === razorpay_signature) {
      
      // 🟢 REALITY CHECK: Right here is where you would connect to your Postgres/MongoDB
      // database and securely run: UPDATE users SET balance = balance + amount WHERE id = user_id
      
      return NextResponse.json({ message: 'Payment verified successfully', status: 'success' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Invalid digital signature' }, { status: 400 });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json({ error: 'Error verifying payment' }, { status: 500 });
  }
}
