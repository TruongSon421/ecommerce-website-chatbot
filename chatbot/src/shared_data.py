# shared_data.py

# WARNING: This global list is NOT thread-safe when used with ThreadPoolExecutor.
# Concurrent requests might interfere with each other's data.
# Consider alternative approaches for production environments.
CURRENT_REQUEST_GROUP_IDS = []