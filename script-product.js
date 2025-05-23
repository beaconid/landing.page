document.addEventListener('DOMContentLoaded', function() {
    // Product selection functionality
    const sizeOptions = document.querySelectorAll('.size-option');
    const quantityInput = document.querySelector('.quantity-input');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const paymentOptions = document.getElementById('paymentOptions');
    
    // Selected product data
    let selectedProduct = {
        name: 'Beacon ID | Classy Person',
        price: 75000,
        size: null,
        quantity: 1,
        paymentMethod: null
    };
    
    // Size selection
    sizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            sizeOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedProduct.size = this.dataset.size;
            updateCheckoutButton();
        });
    });
    
    // Quantity adjustment
    minusBtn.addEventListener('click', function() {
        let currentVal = parseInt(quantityInput.value);
        if (currentVal > 1) {
            quantityInput.value = currentVal - 1;
            selectedProduct.quantity = quantityInput.value;
        }
    });
    
    plusBtn.addEventListener('click', function() {
        let currentVal = parseInt(quantityInput.value);
        quantityInput.value = currentVal + 1;
        selectedProduct.quantity = quantityInput.value;
    });
    
    // Checkout button click
    checkoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (!selectedProduct.size) {
            showNotification('Pilih ukuran terlebih dahulu', 'error');
            return;
        }
        
        // Show payment options
        paymentOptions.style.display = 'block';
        window.scrollTo({
            top: paymentOptions.offsetTop - 20,
            behavior: 'smooth'
        });
    });
    
    // Enable checkout button when size is selected
    function updateCheckoutButton() {
        if (selectedProduct.size) {
            checkoutBtn.disabled = false;
        } else {
            checkoutBtn.disabled = true;
        }
    }
    
    // Notification function
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
    
    // Store product data in localStorage for other scripts to access
    window.selectedProduct = selectedProduct;
});