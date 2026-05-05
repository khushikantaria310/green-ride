import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Initialize Razorpay with your secure backend keys
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    // Ask Razorpay to create a secure order in their database
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay strictly expects the amount in PAISE
      currency: 'INR',
      receipt: 'receipt_' + Math.random().toString(36).substring(7),
    });

    // Send the secure Order ID back to the frontend
    return NextResponse.json({ orderId: order.id }, { status: 200 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: 'Error creating order' }, { status: 500 });
  }
}
