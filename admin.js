document.addEventListener('DOMContentLoaded', () => {
    const categorySelect = document.getElementById('category');
    const subCategoryGroup = document.getElementById('subCategoryGroup');
    const subCategorySelect = document.getElementById('sub_category');
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');
    const adminForm = document.getElementById('adminForm');
    const messageBox = document.getElementById('messageBox');

    // Show/hide sub-category based on category selection
    categorySelect.addEventListener('change', (e) => {
        if (e.target.value === 'Silver' || e.target.value === 'Gold') {
            subCategoryGroup.style.display = 'block';
            subCategorySelect.setAttribute('required', 'required');
            // Update label based on selection
            const label = subCategoryGroup.querySelector('label');
            if (e.target.value === 'Gold') {
                label.textContent = 'Sub Category (for Gold) *';
            } else {
                label.textContent = 'Sub Category (for Silver) *';
            }
        } else {
            subCategoryGroup.style.display = 'none';
            subCategorySelect.removeAttribute('required');
            subCategorySelect.value = '';
        }
    });

    document.getElementById('imageFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            imagePreview.src = URL.createObjectURL(file);
            imagePreview.style.display = 'block';
        } else {
            imagePreview.style.display = 'none';
        }
    });

    // Form submission
    adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Hide message box
        messageBox.style.display = 'none';
        messageBox.className = 'alert';

        const categoryVal = document.getElementById('category').value;
        let subCategoryVal = document.getElementById('sub_category').value;
        const weightVal = document.getElementById('weight').value.trim();
        const priceVal = document.getElementById('price').value.trim();

        // Sub-category is required for both Gold and Silver
        if ((categoryVal === 'Gold' || categoryVal === 'Silver') && !subCategoryVal) {
            showMessage(`Sub Category is required for ${categoryVal} products.`, 'error');
            return;
        }

        // At least one of weight or price must be provided
        if (!weightVal && !priceVal) {
            showMessage('Either Weight or Item Price must be provided.', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('id', document.getElementById('product_id').value.trim());
        formData.append('title', document.getElementById('title').value);
        formData.append('category', categoryVal);
        if (subCategoryVal) formData.append('sub_category', subCategoryVal);
        if (weightVal) formData.append('weight', weightVal);
        if (priceVal) formData.append('price', priceVal);

        const imageFile = document.getElementById('imageFile').files[0];

        if (imageFile) {
            formData.append('imageFile', imageFile);
        } else {
            showMessage('Please upload an image file.', 'error');
            return;
        }

        try {
            const submitBtn = adminForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Adding...';

            const response = await fetch('/api/products', {
                method: 'POST',
                body: formData // sending FormData directly (fetch will set multipart boundary)
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Product added successfully!', 'success');
                // Reset form
                adminForm.reset();
                imagePreview.style.display = 'none';
                subCategoryGroup.style.display = 'none';
            } else {
                showMessage(data.error || 'Failed to add product', 'error');
            }
        } catch (error) {
            console.error('Submission error:', error);
            showMessage('Network error occurred while adding product.', 'error');
        } finally {
            const submitBtn = adminForm.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Product to Store';
        }
    });

    function showMessage(msg, type) {
        messageBox.textContent = msg;
        messageBox.className = `alert ${type}`;
        messageBox.style.display = 'block';
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageBox.style.display = 'none';
            }, 3000);
        }
    }
});
