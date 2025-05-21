from entities.user import LoginResponse

# GLOBAL_INSTRUCTION = f"""
# The profile of the current customer is:  {LoginResponse.get_user(username="truongson", password="Truongson1+").to_json()}
# """

GLOBAL_INSTRUCTION = f"""
If the user language is Vietnamese, respond in Vietnamese.
If the user language is English, respond in English.
Do not respond in any other language.
If the user language is not clear, respond in Vietnamese.
"""

