document.addEventListener('DOMContentLoaded', () => {
    const vnpAmountInput = document.getElementById('vnp_Amount');
    const vnpBankCodeInput = document.getElementById('vnp_BankCode');
    const vnpBankTranNoInput = document.getElementById('vnp_BankTranNo');
    const vnpCardTypeInput = document.getElementById('vnp_CardType');
    const vnpOrderInfoInput = document.getElementById('vnp_OrderInfo');
    const vnpPayDateInput = document.getElementById('vnp_PayDate');
    const vnpResponseCodeInput = document.getElementById('vnp_ResponseCode');
    const vnpTmnCodeInput = document.getElementById('vnp_TmnCode');
    const vnpTransactionNoInput = document.getElementById('vnp_TransactionNo');
    const vnpTransactionStatusInput = document.getElementById('vnp_TransactionStatus');
    const vnpTxnRefInput = document.getElementById('vnp_TxnRef'); // This is your system's transactionId
    const vnpSecureHashInput = document.getElementById('vnp_SecureHash');

    const simulateCallbackButton = document.getElementById('simulateCallbackButton');
    const responseOutput = document.getElementById('responseOutput');

    const paymentServiceBaseUrl = 'http://localhost:8070'; // Adjust if your payment-service runs elsewhere
    // This should be the endpoint in your payment-service that handles VNPay's IPN or return URL
    const vnpayCallbackPath = '/api/payments/vnpay_return'; 

    simulateCallbackButton.addEventListener('click', async () => {
        const params = {
            vnp_Amount: vnpAmountInput.value.trim(),
            vnp_BankCode: vnpBankCodeInput.value.trim(),
            vnp_BankTranNo: vnpBankTranNoInput.value.trim(),
            vnp_CardType: vnpCardTypeInput.value.trim(),
            vnp_OrderInfo: vnpOrderInfoInput.value.trim(),
            vnp_PayDate: vnpPayDateInput.value.trim(),
            vnp_ResponseCode: vnpResponseCodeInput.value.trim(),
            vnp_TmnCode: vnpTmnCodeInput.value.trim(),
            vnp_TransactionNo: vnpTransactionNoInput.value.trim(),
            vnp_TransactionStatus: vnpTransactionStatusInput.value.trim(),
            vnp_TxnRef: vnpTxnRefInput.value.trim(),
            vnp_SecureHash: vnpSecureHashInput.value.trim() // For testing, your backend might need to bypass this or use a known test hash
        };

        if (!params.vnp_TxnRef) {
            alert('vnp_TxnRef (Your Order/Transaction ID) is required.');
            return;
        }

        // Construct query string
        const queryString = Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
        
        const callbackUrl = `${paymentServiceBaseUrl}${vnpayCallbackPath}?${queryString}`;

        responseOutput.textContent = `Simulating GET request to: ${callbackUrl}`;

        try {
            // VNPay callbacks are typically GET requests to your return URL
            const response = await fetch(callbackUrl, {
                method: 'GET',
                // VNPay doesn't use Content-Type for GET, and no body
                // Add any specific headers if your payment service expects them for callbacks, though unusual
            });

            // The response from a VNPay callback endpoint might be HTML (a success/failure page) or JSON
            // For this test, we'll try to parse as text first, then JSON if it seems appropriate
            const responseText = await response.text();
            responseOutput.textContent = `Status: ${response.status}\n\nResponse Body:\n${responseText}`;
            
            console.log('Callback simulation response status:', response.status);
            console.log('Callback simulation response text:', responseText);

            // You might want to try parsing as JSON if your callback endpoint is designed to return JSON
            // try {
            //     const jsonData = JSON.parse(responseText);
            //     responseOutput.textContent += "\n\nParsed JSON:\n" + JSON.stringify(jsonData, null, 2);
            // } catch (e) {
            //     // Not JSON, or invalid JSON
            // }

        } catch (error) {
            responseOutput.textContent = `Error: ${error.message}`;
            console.error('Error during callback simulation:', error);
        }
    });
}); 