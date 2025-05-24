document.addEventListener('DOMContentLoaded', () => {
    const transactionIdInput = document.getElementById('transactionId');
    const amountInput = document.getElementById('amount');
    const orderInfoInput = document.getElementById('orderInfo');
    const initiatePaymentButton = document.getElementById('initiatePaymentButton');
    
    const paymentUrlSection = document.getElementById('paymentUrlSection');
    const vnpayLink = document.getElementById('vnpayLink');
    const vnpayLinkOutput = document.getElementById('vnpayLinkOutput');
    const responseOutput = document.getElementById('responseOutput');

    const paymentServiceBaseUrl = 'http://localhost:8070'; // Adjust if your payment-service runs elsewhere
    const createPaymentEndpoint = '/api/payments/vnpay/create-payment';
    // Replace with a valid token if your API needs auth for this endpoint
    
    const authToken = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0cnVvbmdzb24iLCJpYXQiOjE3NDc3MDQ4NzYsImV4cCI6MTc0NzcwODQ3Niwicm9sZXMiOlt7ImF1dGhvcml0eSI6IlJPTEVfVVNFUiJ9XSwidXNlcklkIjoyfQ.jbPPi5XXq1Of2diUs4mlFmkEI5Aq3XatSuII1sTgQ5A'; // Replace with a valid token if needed

    initiatePaymentButton.addEventListener('click', async () => {
        const transactionId = transactionIdInput.value.trim();
        const amount = amountInput.value.trim();
        const orderInfo = orderInfoInput.value.trim();

        if (!transactionId || !amount) {
            alert('Transaction ID and Amount are required.');
            return;
        }

        const payload = {
            transactionId: transactionId,
            amount: parseFloat(amount), // Ensure amount is a number
            orderInfo: orderInfo
        };

        responseOutput.textContent = 'Initiating payment...';
        paymentUrlSection.style.display = 'none';

        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': authToken // Uncomment and use if your API needs auth
            };

            const response = await fetch(`${paymentServiceBaseUrl}${createPaymentEndpoint}`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();
            responseOutput.textContent = JSON.stringify(responseData, null, 2);

            if (response.ok && responseData.paymentUrl) {
                vnpayLink.href = responseData.paymentUrl;
                vnpayLinkOutput.textContent = responseData.paymentUrl;
                paymentUrlSection.style.display = 'block';
                console.log('VNPay URL received:', responseData.paymentUrl);
            } else {
                console.error('Failed to get VNPay URL:', responseData);
                paymentUrlSection.style.display = 'none';
            }

        } catch (error) {
            responseOutput.textContent = `Error: ${error.message}`;
            console.error('Error initiating payment:', error);
            paymentUrlSection.style.display = 'none';
        }
    });
}); 