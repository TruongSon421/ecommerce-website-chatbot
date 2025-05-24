document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkoutForm');
    // const checkoutButton = document.getElementById('checkoutButton'); // Correctly target by ID

    if (checkoutForm) { // Check if the form itself exists
        checkoutForm.addEventListener('submit', async function(event) { // Make function async for potential fetch
            event.preventDefault(); // Prevent actual form submission

            const userId = document.getElementById('userId').value.trim();
            const fullName = document.getElementById('fullName').value.trim();
            const address = document.getElementById('address').value.trim();
            const city = document.getElementById('city').value.trim();
            const postalCode = document.getElementById('postalCode').value.trim();
            const country = document.getElementById('country').value.trim();
            const paymentMethod = document.getElementById('paymentMethod').value;

            if (!fullName || !address || !city || !postalCode || !country) {
                alert('Please fill in all shipping address fields.');
                return;
            }

            if (!paymentMethod) {
                alert('Please select a payment method.');
                return;
            }

            // Mocked selected items and total amount for the demo
            // In a real application, this would come from the cart.
            const selectedItems = [
                { name: 'Item 1', price: 10.00, quantity: 1 },
                { name: 'Item 2', price: 25.50, quantity: 1 }
            ];
            const totalAmount = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Data to be sent to your backend to generate the VNPay URL
            const paymentRequestData = {
                userId: userId, // Optional, based on your backend needs
                orderId: `DEMO_ORDER_${Date.now()}`, // Example: generate a unique order ID
                transactionId: `DEMO_TXN_${Date.now()}`, // Example: generate a unique transaction ID
                totalAmount: totalAmount, // e.g., 35.50
                paymentMethod: paymentMethod, // e.g., "vnpay_qr"
                orderInfo: `Payment for order DEMO_ORDER_${Date.now()}`,
                // You might need other details like shippingAddress for your backend
                shippingAddress: {
                    fullName: fullName,
                    address: address,
                    city: city,
                    postalCode: postalCode,
                    country: country
                }
            };

            console.log('Preparing to request VNPay URL with data:', paymentRequestData);

            // --- SIMULATION OF BACKEND CALL ---
            // In a real application, you would make a fetch request to your backend here.
            // Your backend would use PaymentServiceImpl.generateVNPayPaymentUrl()
            // and return the actual VNPay URL.
            // Example:
            // try {
            //     const response = await fetch('/api/payment/create-vnpay-url', { // Replace with your actual backend endpoint
            //         method: 'POST',
            //         headers: {
            //             'Content-Type': 'application/json',
            //             // Include any necessary auth headers
            //         },
            //         body: JSON.stringify(paymentRequestData)
            //     });
            //     if (!response.ok) {
            //         const errorData = await response.json();
            //         throw new Error(errorData.message || 'Failed to get VNPay URL');
            //     }
            //     const data = await response.json();
            //     const vnPayUrl = data.paymentUrl; // Assuming your backend returns { paymentUrl: '...' }
            //     console.log('Received VNPay URL:', vnPayUrl);
            //     window.location.href = vnPayUrl; // Redirect to actual VNPay URL
            // } catch (error) {
            //     console.error('Error getting VNPay URL:', error);
            //     alert('Error initiating payment: ' + error.message);
            // }
            // --- END OF SIMULATION ---

            // For this demo, we'll redirect to a placeholder.
            // REPLACE THIS with the actual redirection using the vnPayUrl from your backend.
            alert('Simulating backend call. In a real app, this would redirect to VNPay. Check console for payload.');
            const simulatedVnPayUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${paymentRequestData.totalAmount * 100}&vnp_Command=pay&vnp_CreateDate=${new Date().toISOString().slice(0,19).replace(/[-:T]/g,'')}&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=${encodeURIComponent(paymentRequestData.orderInfo)}&vnp_OrderType=other&vnp_ReturnUrl=${encodeURIComponent('http://localhost:yourport/your-vnpay-return-url')}&vnp_TmnCode=YOUR_TMN_CODE&vnp_TxnRef=${paymentRequestData.transactionId}&vnp_Version=2.1.0&vnp_SecureHash=SIMULATED_HASH`; // THIS IS A VERY ROUGH SIMULATION
            console.log('Simulated VNPay URL (for demo purposes only, structure might differ):', simulatedVnPayUrl);
            
            // To test redirection to a dummy URL that looks like VNPay:
            // Replace alert above with: window.location.href = simulatedVnPayUrl;
            // IMPORTANT: The simulatedVnPayUrl above will NOT work with actual VNPay as it's missing a valid secure hash and TmnCode.

        });
    }
}); 