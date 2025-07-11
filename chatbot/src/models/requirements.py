from pydantic import BaseModel
from typing import Optional

# Yêu cầu cho điện thoại
class PhoneRequirements(BaseModel):
    phone_battery: bool
    phone_camera: bool
    phone_highSpecs: bool
    phone_livestream: bool
    phone_slimLight: bool
    phone_charge_fastCharge20: bool
    phone_charge_superFastCharge60: bool
    phone_charge_wirelessCharge: bool
    phone_specialFeature_5g: bool
    phone_specialFeature_aiEdit: bool
    phone_specialFeature_waterDustProof: bool

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
    laptop_screen_13inch: bool
    laptop_screen_14inch: bool
    laptop_screen_15inch: bool
    laptop_screen_16inch: bool
    laptop_specialFeature_touchScreen: bool
    laptop_specialFeature_360: bool
    laptop_specialFeature_antiGlare: bool
    laptop_specialFeature_oled: bool


    min_budget: Optional[int]
    max_budget: Optional[int]
    brand_preference: Optional[str]
    specific_requirements: Optional[str]

class EarHeadphoneRequirements(BaseModel):
    earHeadphone_tech_boneConduction: bool
    earHeadphone_tech_airConduction: bool
    earHeadphone_battery_under4: bool
    earHeadphone_battery_4to6: bool
    earHeadphone_battery_6to8: bool
    earHeadphone_battery_above8: bool
    earHeadphone_benefit_wirelessCharge: bool
    earHeadphone_benefit_waterProof: bool
    earHeadphone_benefit_mic: bool
    earHeadphone_benefit_anc: bool
    earHeadphone_benefit_enc: bool

    min_budget: Optional[int]
    max_budget: Optional[int]
    brand_preference: Optional[str]
    specific_requirements: Optional[str]


class BackupChargerRequirements(BaseModel):
    backupCharger_type_smallLight: bool
    backupCharger_type_forLaptop: bool
    backupCharger_battery_10k: bool
    backupCharger_battery_20k: bool
    backupCharger_battery_above20k: bool
    backupCharger_benefit_wirelessCharge: bool
    backupCharger_benefit_fastCharge: bool
    backupCharger_benefit_magsafe: bool

    min_budget: Optional[int]
    max_budget: Optional[int]
    brand_preference: Optional[str]
    specific_requirements: Optional[str]




    