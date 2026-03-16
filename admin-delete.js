document.getElementById('adminDeleteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const messageBox = document.getElementById('messageBox');
    const submitBtn = document.querySelector('button[type="submit"]');

    if (!productId) {
        showMessage('Please enter a Product ID.', 'error');
        return;
    }

    if (!confirm(`Are you sure you want to delete product with ID ${productId}?`)) {
        return;
    }

    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Deleting...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(data.message || 'Product deleted successfully', 'success');
            document.getElementById('adminDeleteForm').reset();
        } else {
            showMessage(data.message || data.error || 'Failed to delete product', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('A network error occurred. Please make sure the server is running.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

function showMessage(msg, type) {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = msg;
    messageBox.className = `alert ${type}`;
    messageBox.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 5000);
    }
}
