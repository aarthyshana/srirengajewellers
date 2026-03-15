document.addEventListener('DOMContentLoaded', async () => {
    const loadingEl = document.getElementById('loading');
    const tableContainer = document.getElementById('tableContainer');
    const enquiriesBody = document.getElementById('enquiriesBody');
    const emptyState = document.getElementById('emptyState');

    try {
        const response = await fetch('/api/enquiries');
        if (!response.ok) {
            throw new Error('Failed to fetch queries');
        }
        const data = await response.json();

        loadingEl.style.display = 'none';

        if (data.length === 0) {
            emptyState.style.display = 'block';
        } else {
            tableContainer.style.display = 'block';
            
            data.forEach(enquiry => {
                const tr = document.createElement('tr');
                
                // Format the date
                const dateObj = new Date(enquiry.created_at);
                const dateStr = dateObj.toLocaleString();

                // Format the product IDs
                let productsStr = 'None';
                if (enquiry.product_ids) {
                    try {
                        const idsArray = JSON.parse(enquiry.product_ids);
                        if (Array.isArray(idsArray) && idsArray.length > 0) {
                            productsStr = idsArray.join(', ');
                        }
                    } catch (e) {
                        productsStr = enquiry.product_ids;
                    }
                }

                tr.innerHTML = `
                    <td>${dateStr}</td>
                    <td>${escapeHTML(enquiry.name)}</td>
                    <td>${escapeHTML(enquiry.phone)}</td>
                    <td>${enquiry.email ? escapeHTML(enquiry.email) : 'N/A'}</td>
                    <td>${escapeHTML(productsStr)}</td>
                `;
                enquiriesBody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Error fetching enquiries:', error);
        loadingEl.innerHTML = `<p style="color: red;">Error loading enquiries. Please try again later.</p>`;
    }
});

function escapeHTML(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
