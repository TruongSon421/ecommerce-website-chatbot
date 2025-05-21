from typing import List, Dict, Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict
from cart import CartItem
import requests
import logging

logger = logging.getLogger(__name__)

class InventoryResponse(BaseModel):
    productId: str
    productName: str
    color: str
    quantity: int
    originalPrice: int
    currentPrice: int
    model_config = ConfigDict(from_attributes=True)

    def to_json(self) -> str:
        """
        Converts the Customer object to a JSON string.

        Returns:
            A JSON string representing the Customer object.
        """
        return self.model_dump_json(indent=4)
    
    def get_and_check_inventory(productId: str, quantity: int, color: str) -> Optional["CartItem"]:
        # Kiểm tra xem sản phẩm có tồn tại trong kho không
        # Nếu có trả về CartItem
        url = "http://localhost:8070/api/inventory/product"
        headers = {
            "Content-Type": "application/json"
        }
        params = {
            "productId": productId,
            "color": color
        } 
        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            product_inventory = InventoryResponse(**response.json())
            if product_inventory.quantity >= quantity:
                return CartItem(
                    productId=product_inventory.productId,
                    productName=product_inventory.productName,
                    color=product_inventory.color,
                    quantity=quantity,
                    price=product_inventory.currentPrice,
                    available=True
                )
            else:
                return None
        except requests.RequestException as e:
            logger.error("Error checking inventory: %s", e)
            return None
