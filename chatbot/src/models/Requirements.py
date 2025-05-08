from pydantic import BaseModel
from typing import Optional

# Yêu cầu cho điện thoại
class PhoneRequirements(BaseModel):
    phone_battery: bool
    phone_camera: bool
    phone_highSpecs: bool
    phone_livestream: bool
    phone_slimLight: bool
    min_budget: Optional[int]
    max_budget: Optional[int]
    brand_preference: Optional[str]
    specific_requirements: Optional[str]

# Yêu cầu cho laptop
class LaptopRequirements(BaseModel):
    laptop_ai: bool
    laptop_engineer: bool
    laptop_gaming: bool
    laptop_graphic: bool
    laptop_office: bool
    laptop_premium: bool
    laptop_slimLight: bool 
    min_budget: Optional[int]
    max_budget: Optional[int]
    brand_preference: Optional[str]
    specific_requirements: Optional[str]