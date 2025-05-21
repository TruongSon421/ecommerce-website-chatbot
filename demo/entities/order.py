"""Customer entity module."""

from typing import List, Dict, Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


class OrderItem(BaseModel):
    id: Optional[int] = None  # Khi tạo mới có thể chưa có ID
    product_id: str
    color: Optional[str] = None
    product_name: str
    quantity: int
    price: int  # để kiểu str vì bạn lưu giá dạng "10000" chứ không phải số float
    model_config = ConfigDict(from_attributes=True)

class OrderStatus(str):
    CREATED = "CREATED"
    RESERVING = "RESERVING"
    FAILED = "FAILED"
    PAYMENT_PENDING = "PAYMENT_PENDING"
    PAYMENT_COMPLETED = "PAYMENT_COMPLETED"
    PAYMENT_FAILED = "PAYMENT_FAILED"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class PaymentMethod(str):
    CREDIT_CARD = "CREDIT_CARD"
    DEBIT_CARD = "DEBIT_CARD"
    QR_CODE = "QR_CODE"
    TRANSFER_BANKING = "TRANSFER_BANKING"

class Order(BaseModel):
    id: Optional[UUID] = None  # Khi tạo mới chưa có ID
    user_id: str
    items: List[OrderItem]
    total_amount: str
    status: OrderStatus
    shipping_address: str
    payment_id: Optional[str] = None
    payment_method: Optional[PaymentMethod] = None
    model_config = ConfigDict(from_attributes=True)




