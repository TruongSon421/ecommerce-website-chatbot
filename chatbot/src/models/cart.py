from typing import List, Dict, Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum


class CartIdentity(BaseModel):
    productId: str
    color: str
    model_config = ConfigDict(from_attributes=True)

class CartItem(BaseModel):
    productId: str
    productName: str
    price: int
    quantity: int
    color: str
    available: bool
    model_config = ConfigDict(from_attributes=True)

class CartResponse(BaseModel):
    userId: str
    totalPrice: int
    items: List[CartItem]
    model_config = ConfigDict(from_attributes=True)  # Enable attribute access for fields


class PaymentMethod(str, Enum):
    CREDIT_CARD = "CREDIT_CARD"
    DEBIT_CARD = "DEBIT_CARD"
    QR_CODE = "QR_CODE"
    TRANSFER_BANKING = "TRANSFER_BANKING"


class CheckoutRequest(BaseModel):
    userId: str
    shipping_address: str
    payment_method: PaymentMethod
    selected_items: List[CartIdentity] = []
    model_config = ConfigDict(from_attributes=True)