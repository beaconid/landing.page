// Telegram Bot API integration
function sendToTelegram(orderData) {
    // Replace with your actual Telegram bot token and chat ID
    const botToken = '7432091148:AAGgG6I-3FzSED_Hsyc1artXVxOr5GDN4Pg';
    const chatId = '6936656125';
    
    // Format the message
    const message = `
        🛒 *Pesanan Baru* 🛒
        
        *Produk:* ${orderData.name}
        *Ukuran:* ${orderData.size}
        *Jumlah:* ${orderData.quantity}
        *Total:* Rp ${(orderData.price * orderData.quantity).toLocaleString('id-ID')}
        
        *Pelanggan:*
        👤 Nama: ${orderData.customer.name}
        📱 WhatsApp: ${orderData.customer.whatsapp}
        📧 Email: ${orderData.customer.email}
        🏠 Alamat: ${orderData.customer.address}
        
        *Metode Pembayaran:* QRIS
    `;
    
    // First, send the text message
    const textUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}&parse_mode=Markdown`;
    
    fetch(textUrl)
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                // Then send the payment proof image
                const photoUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
                
                // Convert base64 to blob
                const blob = dataURItoBlob(orderData.paymentProof);
                const formData = new FormData();
                formData.append('chat_id', chatId);
                formData.append('photo', blob, 'payment_proof.jpg');
                formData.append('caption', 'Bukti Pembayaran');
                
                return fetch(photoUrl, {
                    method: 'POST',
                    body: formData
                });
            } else {
                throw new Error('Gagal mengirim pesan teks');
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                showSuccessModal();
                
                // Track purchase in Facebook Pixel
                fbq('track', 'Purchase', {
                    content_name: orderData.name,
                    content_category: 'Fashion',
                    content_ids: ['BEACON001'],
                    content_type: 'product',
                    value: orderData.price * orderData.quantity,
                    currency: 'IDR',
                    payment_method: 'QRIS'
                });
            } else {
                throw new Error('Gagal mengirim bukti pembayaran');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Gagal mengirim data ke Telegram. Silakan hubungi admin.', 'error');
            
            // Reset confirm button
            document.getElementById('confirmBtn').innerHTML = '<i class="fab fa-whatsapp"></i> Konfirmasi via WhatsApp';
            document.getElementById('confirmBtn').disabled = false;
        });
}

// Helper function to convert data URI to blob
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeString });
}

// ... (kode sebelumnya tetap sama)

// Show success modal
function showSuccessModal() {
    // Format WhatsApp message
    const whatsappMessage = `Halo Beacon ID, saya sudah melakukan pembayaran dengan detail berikut:
    
📌 *Detail Pesanan*
Produk: ${window.selectedProduct.name}
Ukuran: ${window.selectedProduct.size}
Jumlah: ${window.selectedProduct.quantity}
Total: Rp ${(window.selectedProduct.price * window.selectedProduct.quantity).toLocaleString('id-ID')}

👤 *Data Diri*
Nama: ${window.selectedProduct.customer.name}
Alamat: ${window.selectedProduct.customer.address}
WhatsApp: ${window.selectedProduct.customer.whatsapp}
Email: ${window.selectedProduct.customer.email}

Mohon konfirmasi pembayaran saya. Terima kasih.`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/6287888261769?text=${encodedMessage}`; // Ganti dengan nomor WhatsApp Anda

    const modal = document.createElement('div');
    modal.className = 'payment-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-check-circle"></i> Pembayaran Berhasil!</h3>
            </div>
            <div class="modal-body">
                <p>Terima kasih atas pembelian Anda. Pesanan Anda telah kami terima dan sedang diproses.</p>
                <p>Klik tombol di bawah untuk mengirim konfirmasi otomatis via WhatsApp.</p>
            </div>
            <div class="modal-actions">
                <a href="${whatsappUrl}" class="btn-primary" target="_blank" id="whatsappBtn">
                    <i class="fab fa-whatsapp"></i> Konfirmasi via WhatsApp
                </a>
                <button class="btn-secondary" id="closeModalBtn">
                    <i class="fas fa-times"></i> Tutup
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close modal button
    modal.querySelector('#closeModalBtn').addEventListener('click', function() {
        document.body.removeChild(modal);
        document.body.style.overflow = 'auto';
    });

    // Track WhatsApp click
    modal.querySelector('#whatsappBtn').addEventListener('click', function() {
        fbq('track', 'Contact', {
            content_name: window.selectedProduct.name,
            content_category: 'Fashion',
            content_ids: ['BEACON001'],
            content_type: 'product',
            method: 'WhatsApp'
        });
    });
}

// ... (kode setelahnya tetap sama)

// Notification function (same as in other files)
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