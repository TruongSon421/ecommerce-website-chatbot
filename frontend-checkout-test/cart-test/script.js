document.addEventListener('DOMContentLoaded', () => {
    const userIdInput = document.getElementById('userId');
    const getCartButton = document.getElementById('getCartButton');
    const createCartButton = document.getElementById('createCartButton');
    const cartDetailsSection = document.getElementById('cartDetailsSection');
    const cartDetailsOutput = document.getElementById('cartDetailsOutput');

    const addItemProductIdInput = document.getElementById('addItemProductId');
    const addItemProductNameInput = document.getElementById('addItemProductName');
    const addItemPriceInput = document.getElementById('addItemPrice');
    const addItemQuantityInput = document.getElementById('addItemQuantity');
    const addItemColorInput = document.getElementById('addItemColor');
    const addItemToCartButton = document.getElementById('addItemToCartButton');

    const shippingAddressInput = document.getElementById('shippingAddress');
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const checkoutProductIdInput = document.getElementById('checkoutProductId');
    const checkoutProductColorInput = document.getElementById('checkoutProductColor');
    const addCheckoutItemButton = document.getElementById('addCheckoutItemButton');
    const selectedCheckoutItemsContainer = document.getElementById('selectedCheckoutItemsContainer');
    const checkoutButton = document.getElementById('checkoutButton');
    
    const responseOutput = document.getElementById('responseOutput');

    const cartServiceBaseUrl = 'http://localhost:8070'; // Adjust if your cart-service runs elsewhere
    // Assume a default auth token if your service needs it for all requests.
    // For simplicity, this is hardcoded. In a real app, this would be managed securely.
    const authToken = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0cnVvbmdzb24iLCJpYXQiOjE3NDc3MDQ4NzYsImV4cCI6MTc0NzcwODQ3Niwicm9sZXMiOlt7ImF1dGhvcml0eSI6IlJPTEVfVVNFUiJ9XSwidXNlcklkIjoyfQ.jbPPi5XXq1Of2diUs4mlFmkEI5Aq3XatSuII1sTgQ5A'; // Replace with a valid token if needed

    let selectedCheckoutItems = [];

    async function makeApiCall(endpoint, method = 'GET', body = null, displayIn = responseOutput) {
        if (displayIn) displayIn.textContent = `Loading ${method} ${endpoint}...`;
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': authToken
            };
            const config = {
                method: method,
                headers: headers
            };
            if (body) {
                config.body = JSON.stringify(body);
            }
            const response = await fetch(`${cartServiceBaseUrl}${endpoint}`, config);
            // Try to parse as JSON, but don't fail if it's not (e.g. for non-JSON responses or empty responses)
            let responseData = {};
            try {
                responseData = await response.json();
            } catch (e) {
                // Could be non-JSON response, or empty. Log for debugging but don't necessarily throw.
                console.warn("Response was not JSON or empty:", e);
                // If response is ok but not JSON, we might still want to proceed or have specific handling
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                // For non-JSON but ok responses, responseData remains {} or could be response.text() if needed
            }

            if (displayIn) displayIn.textContent = JSON.stringify(responseData, null, 2);
            
            if (!response.ok) {
                console.error(`${method} ${endpoint} failed:`, responseData);
                // Construct a more informative error message
                const errorDetail = responseData.message || response.statusText || 'Unknown error';
                throw new Error(`API call to ${endpoint} failed with status ${response.status}: ${errorDetail}`);
            }
            return responseData; // Return data for further processing
        } catch (error) {
            if (displayIn) displayIn.textContent = `Error: ${error.message}`;
            console.error(`Error during ${method} ${endpoint}:`, error);
            throw error;
        }
    }

    getCartButton.addEventListener('click', () => {
        const userId = userIdInput.value.trim();
        if (!userId) {
            alert('User ID is required.');
            return;
        }
        cartDetailsSection.style.display = 'block';
        makeApiCall(`/api/carts?userId=${userId}`, 'GET', null, cartDetailsOutput);
    });

    createCartButton.addEventListener('click', () => {
        const userId = userIdInput.value.trim();
        if (!userId) {
            alert('User ID is required.');
            return;
        }
        makeApiCall(`/api/carts`, 'POST', { userId }); // Assuming this endpoint structure
    });

    addItemToCartButton.addEventListener('click', () => {
        const userId = userIdInput.value.trim();
        if (!userId) {
            alert('User ID is required for adding items.');
            return;
        }
        const item = {
            productId: addItemProductIdInput.value.trim(),
            productName: addItemProductNameInput.value.trim(),
            price: parseInt(addItemPriceInput.value),
            quantity: parseInt(addItemQuantityInput.value),
            color: addItemColorInput.value.trim()
        };
        if (!item.productId || !item.color || item.quantity <= 0) {
            alert('Product ID, Color, and valid Quantity are required.');
            return;
        }
        makeApiCall(`/api/carts/items?userId=${userId}`, 'POST', item);
    });

    addCheckoutItemButton.addEventListener('click', () => {
        const productId = checkoutProductIdInput.value.trim();
        const color = checkoutProductColorInput.value.trim();
        if (productId && color) {
            selectedCheckoutItems.push({ productId, color });
            renderSelectedCheckoutItems();
            checkoutProductIdInput.value = '';
            checkoutProductColorInput.value = '';
        } else {
            alert('Please enter both Product ID and Color for checkout selection.');
        }
    });

    function renderSelectedCheckoutItems() {
        selectedCheckoutItemsContainer.innerHTML = '';
        selectedCheckoutItems.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');
            itemDiv.textContent = `Checkout Item: ${item.productId}, Color: ${item.color}`;
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', () => {
                selectedCheckoutItems.splice(index, 1);
                renderSelectedCheckoutItems();
            });
            itemDiv.appendChild(removeButton);
            selectedCheckoutItemsContainer.appendChild(itemDiv);
        });
    }

    checkoutButton.addEventListener('click', async () => {
        const userId = userIdInput.value.trim();
        if (!userId) {
            alert('User ID is required for checkout.');
            return;
        }
        const paymentMethod = paymentMethodSelect.value;
        const payload = {
            checkoutRequest: {
                userId: userId,
                shippingAddress: shippingAddressInput.value.trim(),
                paymentMethod: paymentMethod
            },
            selectedItems: selectedCheckoutItems
        };

        try {
            const responseData = await makeApiCall(`/api/carts/checkout`, 'POST', payload);
            // If VNPAY is used and a redirect URL is provided, redirect the user
            if (paymentMethod === 'VNPAY' && responseData && responseData.vnpayRedirectUrl) {
                responseOutput.textContent = `Redirecting to VNPay: ${responseData.vnpayRedirectUrl}`;
                window.location.href = responseData.vnpayRedirectUrl;
            } else if (paymentMethod === 'VNPAY') {
                // Handle case where VNPAY was selected but no redirect URL was provided
                responseOutput.textContent = 'VNPay selected, but no redirect URL received. Check backend response.';
                console.warn('VNPay checkout initiated, but no vnpayRedirectUrl in response:', responseData);
            }
            // For other payment methods or if no redirect, the response is already displayed by makeApiCall
        } catch (error) {
            // Error is already displayed by makeApiCall, but we catch it here to prevent unhandled promise rejection
            console.error('Checkout failed:', error);
            // Optionally, provide more user-friendly error feedback here if needed
        }
    });

}); 