document.addEventListener('DOMContentLoaded', function() {
    const shippingForm = document.getElementById('shippingForm');
    const paymentSection = document.getElementById('paymentSection');
    const confirmBtn = document.getElementById('confirmBtn');
    const uploadArea = document.createElement('div');
    
    // Create payment proof upload section
    uploadArea.className = 'payment-proof-section';
    
    // Function to get current product data from form or storage
    function getCurrentProductData() {
        // Try to get product data from various sources
        let product = window.selectedProduct || {};
        
        // If no product data exists, try to get from form elements or localStorage
        if (!product.name || !product.price) {
            // Try to get from form elements if they exist
            const productNameEl = document.querySelector('[data-product-name]') || document.querySelector('.product-name');
            const productPriceEl = document.querySelector('[data-product-price]') || document.querySelector('.product-price');
            const productSizeEl = document.querySelector('input[name="size"]:checked') || document.querySelector('select[name="size"]');
            const productQuantityEl = document.querySelector('input[name="quantity"]') || document.querySelector('.quantity-input');
            
            product = {
                name: productNameEl ? productNameEl.textContent || productNameEl.value : 'Beacon ID | Classy Person',
                price: productPriceEl ? parseInt(productPriceEl.dataset.price || productPriceEl.textContent.replace(/\D/g, '')) : 75000,
                size: productSizeEl ? productSizeEl.value || productSizeEl.textContent : 'Belum dipilih',
                quantity: productQuantityEl ? parseInt(productQuantityEl.value) : 1
            };
            
            // Update global selectedProduct
            window.selectedProduct = product;
        }
        
        return product;
    }
    
    // Function to update payment summary HTML with current data
    function getPaymentSummaryHTML() {
        const product = getCurrentProductData();
        
        return `
            <div class="payment-proof-container">
                <h3><i class="fas fa-camera"></i> Upload Bukti Pembayaran</h3>
                <p>Silakan upload screenshot bukti pembayaran Anda untuk verifikasi</p>
                
                <div class="upload-area" id="uploadArea">
                    <div class="upload-content">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Drag & drop file bukti pembayaran di sini</p>
                        <small>atau klik untuk memilih file (format JPG/PNG, max 2MB)</small>
                    </div>
                </div>
                
                <div class="payment-details-confirmation">
                    <h4>Ringkasan Pembayaran</h4>
                    <div class="payment-summary">
                        <div class="summary-item">
                            <span>Produk:</span>
                            <span>${product.name}</span>
                        </div>
                        <div class="summary-item">
                            <span>Ukuran:</span>
                            <span>${product.size && product.size !== 'Belum dipilih' ? product.size : 'Belum dipilih'}</span>
                        </div>
                        <div class="summary-item">
                            <span>Jumlah:</span>
                            <span>${product.quantity}</span>
                        </div>
                        <div class="summary-item total">
                            <span>Total:</span>
                            <span>Rp ${(product.price * product.quantity).toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Function to update payment summary after form submission
    function updatePaymentSummary() {
        const product = getCurrentProductData();
        const summaryContainer = uploadArea.querySelector('.payment-summary');
        
        if (summaryContainer) {
            summaryContainer.innerHTML = `
                <div class="summary-item">
                    <span>Produk:</span>
                    <span>${product.name}</span>
                </div>
                <div class="summary-item">
                    <span>Ukuran:</span>
                    <span>${product.size && product.size !== 'Belum dipilih' ? product.size : 'Belum dipilih'}</span>
                </div>
                <div class="summary-item">
                    <span>Jumlah:</span>
                    <span>${product.quantity}</span>
                </div>
                <div class="summary-item total">
                    <span>Total:</span>
                    <span>Rp ${(product.price * product.quantity).toLocaleString('id-ID')}</span>
                </div>
            `;
        }
    }
    
    uploadArea.innerHTML = getPaymentSummaryHTML();
    
    // Fungsi untuk menangani upload file
    function handleFileUpload(file) {
        // Validate file
        if (!file.type.match('image.*')) {
            showNotification('Hanya file gambar yang diperbolehkan', 'error');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            showNotification('Ukuran file maksimal 2MB', 'error');
            return;
        }
        
        // Preview image
        const reader = new FileReader();
        reader.onload = function(e) {
            // Ensure selectedProduct exists
            if (!window.selectedProduct) {
                window.selectedProduct = getCurrentProductData();
            }
            
            window.selectedProduct.paymentProof = e.target.result;
            
            const uploadAreaDiv = uploadArea.querySelector('#uploadArea');
            uploadAreaDiv.innerHTML = `
                <div class="uploaded-proof">
                    <div class="proof-preview">
                        <img src="${e.target.result}" alt="Bukti Pembayaran" style="max-width: 300px; max-height: 300px;">
                        <div class="proof-actions">
                            <button class="remove-proof-btn">
                                <i class="fas fa-trash"></i> Hapus
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // Enable confirm button
            confirmBtn.classList.add('ready');
            
            // Add remove proof button event
            uploadAreaDiv.querySelector('.remove-proof-btn').addEventListener('click', function() {
                resetUploadArea();
                confirmBtn.classList.remove('ready');
                if (window.selectedProduct) {
                    delete window.selectedProduct.paymentProof;
                }
            });
        };
        reader.readAsDataURL(file);
    }
    
    function resetUploadArea() {
        const uploadAreaDiv = uploadArea.querySelector('#uploadArea');
        uploadAreaDiv.innerHTML = `
            <div class="upload-content">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Drag & drop file bukti pembayaran di sini</p>
                <small>atau klik untuk memilih file (format JPG/PNG, max 2MB)</small>
            </div>
        `;
        initFileUpload(); // Re-initialize event listeners
    }
    
    // Initialize file upload functionality
    function initFileUpload() {
        const uploadAreaDiv = uploadArea.querySelector('#uploadArea');
        
        uploadAreaDiv.addEventListener('click', function() {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            
            fileInput.addEventListener('change', function(e) {
                if (e.target.files.length > 0) {
                    handleFileUpload(e.target.files[0]);
                }
            });
            
            fileInput.click();
        });
        
        // Drag and drop functionality
        uploadAreaDiv.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });
        
        uploadAreaDiv.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });
        
        uploadAreaDiv.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            
            if (e.dataTransfer.files.length > 0) {
                handleFileUpload(e.dataTransfer.files[0]);
            }
        });
    }
    
    // Form submission
    shippingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        const name = document.getElementById('customerName').value.trim();
        const address = document.getElementById('address').value.trim();
        const whatsapp = document.getElementById('whatsapp').value.trim();
        const email = document.getElementById('email').value.trim();
        
        if (!name || !address || !whatsapp || !email) {
            showNotification('Harap isi semua field dengan benar', 'error');
            return;
        }
        
        // Get current product data and update with customer info
        const currentProduct = getCurrentProductData();
        
        // Update selectedProduct with current data and customer info
        window.selectedProduct = {
            ...currentProduct,
            customer: {
                name,
                address,
                whatsapp,
                email
            }
        };
        
        // Regenerate upload area with updated product data
        uploadArea.innerHTML = getPaymentSummaryHTML();
        
        // Show payment section with QRIS code
        paymentSection.style.display = 'block';
        shippingForm.style.display = 'none';
        
        // Add payment proof upload section
        paymentSection.insertBefore(uploadArea, confirmBtn);
        
        // Initialize file upload functionality
        initFileUpload();
        
        // Start payment timer
        startPaymentTimer();
        
        // Scroll to payment section
        window.scrollTo({
            top: paymentSection.offsetTop - 20,
            behavior: 'smooth'
        });
        
        // Track form submission
        fbq('track', 'AddPaymentInfo', {
            content_name: window.selectedProduct.name,
            content_category: 'Fashion',
            content_ids: ['BEACON001'],
            content_type: 'product',
            value: window.selectedProduct.price * window.selectedProduct.quantity,
            currency: 'IDR',
            payment_method: 'QRIS'
        });
    });
    
    // Payment timer
    function startPaymentTimer() {
        const timerInfo = document.createElement('div');
        timerInfo.className = 'payment-timer';
        timerInfo.innerHTML = `
            <div class="timer-info">
                <i class="fas fa-clock"></i>
                <span>Selesaikan pembayaran dalam:</span>
                <span id="timerDisplay">15:00</span>
            </div>
        `;
        
        uploadArea.insertBefore(timerInfo, uploadArea.querySelector('.payment-details-confirmation'));
        
        let minutes = 15;
        let seconds = 0;
        
        const timer = setInterval(() => {
            if (seconds === 0) {
                if (minutes === 0) {
                    clearInterval(timer);
                    timerInfo.innerHTML = `
                        <div class="timer-info" style="color: #dc3545;">
                            <i class="fas fa-exclamation-circle"></i>
                            <span>Waktu pembayaran telah habis</span>
                        </div>
                    `;
                    return;
                }
                minutes--;
                seconds = 59;
            } else {
                seconds--;
            }
            
            const timerDisplay = document.getElementById('timerDisplay');
            if (timerDisplay) {
                timerDisplay.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    // Confirm button click (send to Telegram)
    confirmBtn.addEventListener('click', function() {
        if (!window.selectedProduct || !window.selectedProduct.paymentProof) {
            showNotification('Upload bukti pembayaran terlebih dahulu', 'error');
            return;
        }
        
        // Show loading state
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
        confirmBtn.disabled = true;
        
        // Send data to Telegram bot
        sendToTelegram(window.selectedProduct);
    });
    
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
    
    // Function to manually update product data (can be called from other scripts)
    window.updateProductData = function(productData) {
        window.selectedProduct = { ...window.selectedProduct, ...productData };
        updatePaymentSummary();
    };
});