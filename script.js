// ---- Product Page Price Update ----
function updatePrice() {
    const quantityInput = document.getElementById('quantity');
    const totalPriceElement = document.getElementById('total-price');

    if (!quantityInput || !totalPriceElement) return;

    const basePriceString = quantityInput.getAttribute('data-base-price');
    const basePrice = parseFloat(basePriceString);

    let quantity = parseInt(quantityInput.value, 10);

    if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
        quantityInput.value = 1;
    }

    const rawTotal = basePrice * quantity;
    const calculatedTotal = rawTotal.toFixed(2);

    totalPriceElement.textContent = calculatedTotal;
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        updatePrice();
    }

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        hydrateCheckoutPage();
        setupCheckoutSubmission(checkoutForm);
    }
});

// ---- Product Page: Prepare Checkout ----
function prepareCheckout() {
    const quantityInput = document.getElementById('quantity');
    const totalPriceElement = document.getElementById('total-price');
    const productNameInput = document.getElementById('product-name');

    if (!quantityInput || !totalPriceElement || !productNameInput) {
        alert('Page not fully loaded. Please try again.');
        return;
    }

    const quantity = quantityInput.value;
    const unitPrice = quantityInput.getAttribute('data-base-price');
    const total = totalPriceElement.textContent;
    const productName = productNameInput.value;

    sessionStorage.setItem('order_product_name', productName);
    sessionStorage.setItem('order_quantity', quantity);
    sessionStorage.setItem('order_unit_price', unitPrice);
    sessionStorage.setItem('order_total', total);

    window.location.href = 'checkout.html';
}

// ---- Checkout Page: Hydrate Data ----
function hydrateCheckoutPage() {
    const productName = sessionStorage.getItem('order_product_name');
    const quantity = sessionStorage.getItem('order_quantity');
    const total = sessionStorage.getItem('order_total');

    if (!productName || !quantity || !total) {
        alert('Order data missing. Please start again.');
        window.location.href = 'index.html';
        return;
    }

    const summaryProduct = document.getElementById('summary-product');
    const summaryQuantity = document.getElementById('summary-quantity');
    const summaryTotal = document.getElementById('summary-total');

    const productNameInput = document.getElementById('product-name-input');
    const quantityInput = document.getElementById('quantity-input');
    const totalPriceInput = document.getElementById('total-price-input');

    if (summaryProduct) summaryProduct.textContent = productName;
    if (summaryQuantity) summaryQuantity.textContent = quantity;
    if (summaryTotal) summaryTotal.textContent = total;

    if (productNameInput) productNameInput.value = productName;
    if (quantityInput) quantityInput.value = quantity;
    if (totalPriceInput) totalPriceInput.value = total;
}

// ---- Checkout Page: Submit -> /api/create-order -> Razorpay ----
function setupCheckoutSubmission(form) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const productName = sessionStorage.getItem('order_product_name') || '';
        const quantity = sessionStorage.getItem('order_quantity') || '1';
        const total = sessionStorage.getItem('order_total') || '1.00';

        const payload = {
            c_name: document.getElementById('c_name').value,
            mobile_no: document.getElementById('mobile_no').value,
            building_street: document.getElementById('building_street').value,
            address: document.getElementById('address').value,
            district: document.getElementById('district').value,
            state: document.getElementById('state').value,
            pin_code: document.getElementById('pin_code').value,
            product_name: productName,
            quantity: quantity,
            total_price: total
        };

        fetch('/api/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => {
                if (data.status !== 'success') {
                    alert('Order creation failed: ' + (data.message || 'Unknown error'));
                    return;
                }

                // Open Razorpay checkout
                const options = {
                    key: data.key_id,
                    amount: data.amount, // paise
                    currency: "INR",
                    name: "Elite Widget Store",
                    description: data.product_name,
                    order_id: data.razorpay_order_id,
                    prefill: {
                        name: data.customer_name,
                        contact: data.mobile_no
                    },
                    handler: function (response) {
                        // On payment success, verify on server
                        const verifyPayload = {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            track_code: data.track_code,
                            customer_name: data.customer_name,
                            product_name: data.product_name,
                            quantity: data.quantity
                        };

                        fetch('/api/verify-payment', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(verifyPayload)
                        })
                            .then(r => r.json())
                            .then(vData => {
                                if (vData.status === 'success') {
                                    displaySuccessModal(
                                        vData.track_code,
                                        vData.customer_name,
                                        vData.product_name,
                                        vData.quantity
                                    );
                                    sessionStorage.clear();
                                } else {
                                    alert('Payment verification failed: ' + (vData.message || 'Unknown error'));
                                }
                            })
                            .catch(err => {
                                console.error('Verify error:', err);
                                alert('Error while verifying payment.');
                            });
                    },
                    theme: {
                        color: "#3399cc"
                    }
                };

                const rzp = new Razorpay(options);
                rzp.open();
            })
            .catch(err => {
                console.error('Create order error:', err);
                alert('Network error while creating order.');
            });
    });
}

// ---- Success Modal ----
function displaySuccessModal(trackCode, customerName, productName, quantity) {
    const modal = document.getElementById('success-modal');
    const trackCodeElement = document.getElementById('modal-track-code');
    const summaryElement = document.querySelector('.order-details-summary');

    if (trackCodeElement) {
        trackCodeElement.textContent = trackCode;
    }

    if (summaryElement) {
        summaryElement.innerHTML =
            `Dear ${customerName}, your order for <b>${quantity} x ${productName}</b> has been placed and paid successfully.`;
    }

    if (modal) {
        modal.classList.add('visible');
    }
}