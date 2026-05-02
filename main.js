let supabaseClient;
let currentProduct = null;

document.addEventListener('DOMContentLoaded', () => {
    supabaseClient = window.supabaseClient;
    if (!supabaseClient) {
        console.error('Supabase client not initialized. Check config.js');
    }

    // Check for payment status in URL
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    if (paymentStatus === 'success') {
        alert('Payment Successful! Your order has been placed.');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'failed') {
        alert('Payment Failed or Cancelled. Please try again.');
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // --- Mobile Menu ---
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Close menu when clicking links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // --- Bill Calculation Logic ---
    const billAmountEl = document.getElementById('bill-amount');
    const packageCheckboxes = document.querySelectorAll('input[name="package"]');

    function calculateBill() {
        let total = 0;
        packageCheckboxes.forEach(cb => {
            if (cb.checked) {
                total += parseFloat(cb.dataset.price);
            }
        });
        if (billAmountEl) billAmountEl.textContent = total;
    }

    packageCheckboxes.forEach(cb => {
        cb.addEventListener('change', calculateBill);
    });

    // --- Payment Method Selection ---
    const paymentBtns = document.querySelectorAll('.payment-btn');
    const paymentDetailsBox = document.getElementById('payment-details');
    let selectedPaymentMethod = '';

    const paymentInfo = {
        jazzcash: { name: 'JazzCash', account: '0300 9692474', holder: 'German Fitness' },
        easypaisa: { name: 'EasyPaisa', account: '0300 9692474', holder: 'German Fitness' },
        bank: { name: 'Bank Transfer', account: '1234-5678-9012 (HBL)', holder: 'German Fitness & Sports' }
    };

    paymentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            paymentBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedPaymentMethod = btn.dataset.method;
            
            const info = paymentInfo[selectedPaymentMethod];
            if (paymentDetailsBox) {
                paymentDetailsBox.innerHTML = `
                    <h4 style="color: var(--accent); margin-bottom: 0.5rem;">Send Money To ${info.name}</h4>
                    <p>Account Number: <strong>${info.account}</strong></p>
                    <p>Account Holder: <strong>${info.holder}</strong></p>
                    <p style="margin-top: 1rem; font-size: 0.8rem; color: var(--text-muted);">Please send the total bill amount and keep the screenshot.</p>
                `;
                paymentDetailsBox.style.display = 'block';
            }
        });
    });

    // --- Form Submission Logic ---
    const membershipForm = document.getElementById('membership-form');
    const modal = document.getElementById('confirmation-modal');
    const confirmDetails = document.getElementById('confirmation-details');
    const confirmSubmitBtn = document.getElementById('confirm-submit');
    const closeModalBtn = document.getElementById('close-modal');

    let formData = {};

    if (membershipForm) {
        membershipForm.addEventListener('submit', (e) => {
            e.preventDefault();

            formData = {
                fullName: document.getElementById('full_name').value,
                gender: document.getElementById('gender').value,
                phone: document.getElementById('phone').value,
                joinDate: document.getElementById('join_date').value,
                packages: Array.from(packageCheckboxes)
                    .filter(cb => cb.checked)
                    .map(cb => cb.closest('.package-item').querySelector('.package-name').textContent),
                packageValues: Array.from(packageCheckboxes)
                    .filter(cb => cb.checked)
                    .map(cb => cb.value),
                totalBill: parseFloat(billAmountEl.textContent),
                paymentMethod: selectedPaymentMethod ? paymentInfo[selectedPaymentMethod].name : ''
            };

            if (formData.packageValues.length === 0) {
                alert('Please select at least one package.');
                return;
            }

            if (!selectedPaymentMethod) {
                alert('Please select a payment method.');
                return;
            }

            const info = selectedPaymentMethod ? paymentInfo[selectedPaymentMethod] : null;
            confirmDetails.innerHTML = `
                <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; margin-bottom: 1rem;">
                    <p><strong>Name:</strong> ${formData.fullName}</p>
                    <p><strong>Gender:</strong> ${formData.gender}</p>
                    <p><strong>Phone:</strong> ${formData.phone}</p>
                    <p><strong>Start Date:</strong> ${formData.joinDate}</p>
                    <p><strong>Plans:</strong> ${formData.packages.join(', ')}</p>
                </div>
                <div style="background: rgba(204, 255, 0, 0.05); padding: 1rem; border-radius: 10px; border: 1px solid rgba(204, 255, 0, 0.1);">
                    <p><strong>Payment Method:</strong> ${formData.paymentMethod}</p>
                    ${info ? `
                        <p><strong>Account:</strong> ${info.account}</p>
                        <p><strong>Holder:</strong> ${info.holder}</p>
                    ` : ''}
                    <p style="font-size: 1.5rem; margin-top: 0.5rem; color: var(--accent);"><strong>Total: ${formData.totalBill} PKR</strong></p>
                </div>
                <p style="margin-top: 1rem; font-size: 0.8rem; color: var(--text-muted);">Please ensure you have sent the amount and have the screenshot ready.</p>
            `;
            modal.style.display = 'flex';
        });
    }

    if (confirmSubmitBtn) {
        confirmSubmitBtn.addEventListener('click', async () => {
            confirmSubmitBtn.disabled = true;
            confirmSubmitBtn.textContent = 'Processing...';

            try {
                const { error } = await supabaseClient
                    .from('members')
                    .insert([{
                        full_name: formData.fullName,
                        gender: formData.gender,
                        phone: formData.phone,
                        join_date: formData.joinDate,
                        selected_plans: formData.packageValues,
                        total_bill: formData.totalBill,
                        status: 'pending'
                    }]);

                if (error) throw error;

                const message = `*NEW REGISTRATION - GERMAN FITNESS*\n\n` +
                    `*Name:* ${formData.fullName}\n` +
                    `*Gender:* ${formData.gender}\n` +
                    `*Phone:* ${formData.phone}\n` +
                    `*Start Date:* ${formData.joinDate}\n` +
                    `*Plans:* ${formData.packages.join(', ')}\n` +
                    `*Payment Method:* ${formData.paymentMethod}\n` +
                    `*Total Bill:* ${formData.totalBill} PKR\n\n` +
                    `_I am sending the payment screenshot for verification._`;

                const whatsappUrl = `https://api.whatsapp.com/send?phone=${CONFIG.WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
                window.location.href = whatsappUrl;
                modal.style.display = 'none';
                membershipForm.reset();
                billAmountEl.textContent = '0';
                paymentDetailsBox.style.display = 'none';
                paymentBtns.forEach(b => b.classList.remove('active'));
                selectedPaymentMethod = '';

            } catch (error) {
                console.error('Registration Error:', error);
                alert('Error: ' + error.message);
            } finally {
                confirmSubmitBtn.disabled = false;
                confirmSubmitBtn.textContent = 'Confirm & Send WhatsApp';
            }
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // --- Purchase Modal Logic (Shared) ---
    const purchaseModal = document.getElementById('purchase-modal');
    const closePurchaseModalBtn = document.getElementById('close-purchase-modal');
    const confirmOrderBtn = document.getElementById('confirm-order');

    if (closePurchaseModalBtn) {
        closePurchaseModalBtn.addEventListener('click', () => {
            purchaseModal.style.display = 'none';
        });
    }

    if (confirmOrderBtn) {
        confirmOrderBtn.addEventListener('click', async () => {
            const name = document.getElementById('order_name').value;
            const phone = document.getElementById('order_phone').value;

            if (!name || !phone) {
                alert('Please enter your name and phone number.');
                return;
            }

            try {
                const { error } = await supabaseClient
                    .from('orders')
                    .insert([{
                        member_name: name,
                        member_phone: phone,
                        product_id: currentProduct.id,
                        quantity: currentProduct.qty,
                        total_price: currentProduct.total,
                        status: 'pending'
                    }]);

                if (error) throw error;

                const message = `*NEW ORDER - GERMAN FITNESS*\n\n` +
                    `*Customer:* ${name}\n` +
                    `*Phone:* ${phone}\n` +
                    `*Product:* ${currentProduct.name}\n` +
                    `*Quantity:* ${currentProduct.qty} Units\n` +
                    `*Total Price:* ${currentProduct.total} PKR\n\n` +
                    `_Please process this order._`;

                const whatsappUrl = `https://api.whatsapp.com/send?phone=${CONFIG.WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
                window.location.href = whatsappUrl;
                
                purchaseModal.style.display = 'none';
                document.getElementById('order_name').value = '';
                document.getElementById('order_phone').value = '';

            } catch (error) {
                console.error('Purchase Modal Error:', error);
                alert('Error placing order: ' + error.message);
            }
        });
    }

    loadHotSelling();
});

async function loadHotSelling() {
    const hotSellingContainer = document.getElementById('hot-selling-products');
    if (!hotSellingContainer) return;
    
    try {
        const { data: products, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('is_hot_selling', true)
            .limit(4);

        if (error) throw error;

        hotSellingContainer.innerHTML = products.map(product => {
            const isOutOfStock = product.stock <= 0;
            return `
                <div class="product-card" style="${isOutOfStock ? 'opacity: 0.7;' : ''}">
                    <div class="product-image">
                        <img src="${product.image_url}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/200?text=Product'">
                    </div>
                    <div class="product-info">
                        <h4>${product.name}</h4>
                        <div class="product-price">
                            <span>${product.price} PKR</span>
                            ${isOutOfStock ? '<span class="out-of-stock">Out of Stock</span>' : ''}
                        </div>
                        <button onclick="${isOutOfStock ? '' : `addToCartHandler('${product.id}', '${product.name}', ${product.price}, '${product.image_url}')`}" 
                                class="btn btn-primary btn-block" 
                                style="margin-top: 1rem; ${isOutOfStock ? 'background: #333; cursor: not-allowed; color: #777;' : ''}"
                                ${isOutOfStock ? 'disabled' : ''}>
                            ${isOutOfStock ? 'Add to Cart' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function addToCartHandler(id, name, price, image_url) {
    if (typeof cartManager !== 'undefined') {
        cartManager.addToCart({ id, name, price, image_url });
    } else {
        console.error('CartManager not loaded');
    }
}


function openPurchaseModal(id, name, price) {
    currentProduct = { id, name, price, qty: 1, total: price };
    updateOrderSummary();
    document.getElementById('purchase-modal').style.display = 'flex';
}

function updateOrderSummary() {
    const summary = document.getElementById('order-summary');
    if (!summary) return;
    summary.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <strong style="font-size: 1.2rem;">${currentProduct.name}</strong>
            <span style="color: var(--accent); font-weight: 700;">${currentProduct.price} PKR</span>
        </div>
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
            <span>Quantity:</span>
            <div style="display: flex; align-items: center; background: var(--glass); border-radius: 5px; border: 1px solid var(--glass-border);">
                <button onclick="changeQty(-1)" style="padding: 0.5rem 1rem; background: none; border: none; color: #fff; cursor: pointer;">-</button>
                <span style="width: 30px; text-align: center; font-weight: 700;">${currentProduct.qty}</span>
                <button onclick="changeQty(1)" style="padding: 0.5rem 1rem; background: none; border: none; color: #fff; cursor: pointer;">+</button>
            </div>
        </div>
        <div style="border-top: 1px solid var(--glass-border); padding-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600;">Total Bill:</span>
            <span style="font-size: 1.5rem; color: var(--accent); font-weight: 900;">${currentProduct.total} PKR</span>
        </div>
    `;
}

function changeQty(delta) {
    currentProduct.qty = Math.max(1, currentProduct.qty + delta);
    currentProduct.total = currentProduct.price * currentProduct.qty;
    updateOrderSummary();
}

window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(0, 0, 0, 0.9)';
        nav.style.padding = '0.8rem 5%';
    } else {
        nav.style.background = 'rgba(0, 0, 0, 0.4)';
        nav.style.padding = '1.2rem 5%';
    }
});
