document.addEventListener('DOMContentLoaded', () => {
    const ratesForm = document.getElementById('ratesForm');
    const messageBox = document.getElementById('messageBox');

    // Set today's date as default
    document.getElementById('rateDate').valueAsDate = new Date();

    ratesForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        messageBox.style.display = 'none';
        messageBox.className = 'alert';

        const date = document.getElementById('rateDate').value;
        const goldRate = document.getElementById('goldRate').value;
        const silverRate = document.getElementById('silverRate').value;

        try {
            const submitBtn = ratesForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            const response = await fetch('/api/rates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date: date,
                    gold_rate: parseFloat(goldRate),
                    silver_rate: parseFloat(silverRate)
                })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Market rates updated successfully!', 'success');
                ratesForm.reset();
                document.getElementById('rateDate').valueAsDate = new Date();
            } else {
                showMessage(data.error || 'Failed to update rates', 'error');
            }
        } catch (error) {
            console.error('Submission error:', error);
            showMessage('Network error occurred while updating rates.', 'error');
        } finally {
            const submitBtn = ratesForm.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Rates';
        }
    });

    function showMessage(msg, type) {
        messageBox.textContent = msg;
        messageBox.className = `alert ${type}`;
        messageBox.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => {
                messageBox.style.display = 'none';
            }, 3000);
        }
    }
});
