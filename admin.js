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
        if (e.target.value === 'Silver') {
            subCategoryGroup.style.display = 'block';
            subCategorySelect.setAttribute('required', 'required');
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

        // For gold, the subcategory mapping isn't used
        if (categoryVal === 'Gold') {
            subCategoryVal = null;
        } else if (categoryVal === 'Silver' && !subCategoryVal) {
            showMessage('Sub Category is required for Silver products.', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('title', document.getElementById('title').value);
        formData.append('category', categoryVal);
        if (subCategoryVal) formData.append('sub_category', subCategoryVal);
        formData.append('weight', document.getElementById('weight').value);

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
