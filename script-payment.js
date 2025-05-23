document.addEventListener('DOMContentLoaded', function() {
    const paymentOptionBtns = document.querySelectorAll('.payment-option-btn');
    const continueBtn = document.getElementById('continueBtn');
    const shopeeSection = document.getElementById('shopeeSection');
    const checkoutForm = document.getElementById('checkoutForm');
    const paymentSection = document.getElementById('paymentSection');
    const shopeeRedirectBtn = document.getElementById('shopeeRedirectBtn');
    
    // Payment method selection
    paymentOptionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            paymentOptionBtns.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            window.selectedProduct.paymentMethod = this.dataset.payment;
            continueBtn.disabled = false;
        });
    });
    
    // Continue button click
    continueBtn.addEventListener('click', function() {
        if (!window.selectedProduct.paymentMethod) {
            showNotification('Pilih metode pembayaran terlebih dahulu', 'error');
            return;
        }
        
        if (window.selectedProduct.paymentMethod === 'shopee') {
            // Show Shopee section
            shopeeSection.style.display = 'block';
            checkoutForm.style.display = 'none';
            paymentSection.style.display = 'none';
            
            // Update Shopee link with product details
            const shopeeUrl = new URL(shopeeRedirectBtn.href);
            shopeeUrl.searchParams.set('size', window.selectedProduct.size);
            shopeeUrl.searchParams.set('quantity', window.selectedProduct.quantity);
            shopeeRedirectBtn.href = shopeeUrl.toString();
            
            // Track Shopee selection
            fbq('track', 'InitiateCheckout', {
                content_name: window.selectedProduct.name,
                content_category: 'Fashion',
                content_ids: ['BEACON001'],
                content_type: 'product',
                value: 65000,
                currency: 'IDR',
                payment_method: 'Shopee'
            });
        } else if (window.selectedProduct.paymentMethod === 'qris') {
            // Show checkout form for QRIS
            checkoutForm.style.display = 'block';
            shopeeSection.style.display = 'none';
            paymentSection.style.display = 'none';
            
            // Track QRIS selection
            fbq('track', 'InitiateCheckout', {
                content_name: window.selectedProduct.name,
                content_category: 'Fashion',
                content_ids: ['BEACON001'],
                content_type: 'product',
                value: window.selectedProduct.price * window.selectedProduct.quantity,
                currency: 'IDR',
                payment_method: 'QRIS'
            });
        }
        
        // Scroll to the selected section
        const activeSection = document.querySelector('.payment-section[style*="display: block"], .checkout-form[style*="display: block"]');
        if (activeSection) {
            window.scrollTo({
                top: activeSection.offsetTop - 20,
                behavior: 'smooth'
            });
        }
    });
    
    // Notification function (same as in product.js)
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});