const Razorpay = require('razorpay');
const crypto = require('crypto');

function generateTrackCode(prefix = 'EL', length = 8) {
    const base = Date.now().toString() + Math.random().toString();
    const hash = crypto.createHash('md5').update(base).digest('hex').toUpperCase();
    return prefix + hash.slice(0, length);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ status: 'error', message: 'Only POST allowed' });
        return;
    }

    const {
        c_name,
        mobile_no,
        building_street,
        address,
        district,
        state,
        pin_code,
        product_name = 'Unknown Product',
        quantity = 1
    } = req.body || {};

    const safeName = String(c_name || '').trim();
    const safeMobile = String(mobile_no || '').trim();
    const safeQty = Math.max(1, parseInt(quantity, 10) || 1);

    // ₹1 per quantity
    const unitPrice = 1;
    const totalRupees = unitPrice * safeQty;
    const amountPaise = totalRupees * 100;

    const trackCode = generateTrackCode();

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
        res.status(500).json({
            status: 'error',
            message: 'Razorpay keys not configured on server.'
        });
        return;
    }

    const instance = new Razorpay({
        key_id,
        key_secret
    });

    try {
        const order = await instance.orders.create({
            amount: amountPaise,
            currency: 'INR',
            receipt: trackCode,
            payment_capture: 1
        });

        res.status(200).json({
            status: 'success',
            key_id,
            razorpay_order_id: order.id,
            amount: amountPaise,
            customer_name: safeName,
            mobile_no: safeMobile,
            product_name,
            quantity: safeQty,
            track_code: trackCode
        });
    } catch (err) {
        console.error('Razorpay order error', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create Razorpay order.'
        });
    }
}
