const crypto = require('crypto');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ status: 'error', message: 'Only POST allowed' });
        return;
    }

    const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        track_code,
        customer_name,
        product_name,
        quantity
    } = req.body || {};

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        res.status(400).json({
            status: 'error',
            message: 'Missing Razorpay payment details.'
        });
        return;
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret) {
        res.status(500).json({
            status: 'error',
            message: 'Razorpay secret not configured.'
        });
        return;
    }

    const payload = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', key_secret)
        .update(payload)
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        res.status(400).json({
            status: 'error',
            message: 'Invalid payment signature.'
        });
        return;
    }

    // Yahan tak aa gaye matlab PAYMENT SUCCESS ✅
    // (Production me: yahi par DB me order ko PAID mark karoge)

    res.status(200).json({
        status: 'success',
        track_code: track_code || 'UNKNOWN',
        customer_name: customer_name || 'Customer',
        product_name: product_name || 'Product',
        quantity: quantity || 1
    });
}