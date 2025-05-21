from typing import List, Dict, Optional
from pydantic import BaseModel, Field, ConfigDict
from entities.cart import *
import requests
import logging

logger = logging.getLogger(__name__)

class TokenRequest(BaseModel):
    accessToken: str = None
    

class TokenResponse(BaseModel):
    accessToken: str = None
    

class LoginResponse(BaseModel):
    token: str = Field(..., description="Access token for authentication")
    refreshToken: str = Field(..., description="Refresh token for session management")
    id: int = Field(..., description="Unique identifier for the user")
    username: str = Field(..., description="Name of the user")
    email: str = Field(..., description="Email address of the user")
    roles: list[str] = Field(..., description="Role of the user in the system")
    model_config = ConfigDict(from_attributes=True)  # Enable attribute access for fields

    def to_json(self) -> str:
        """
        Converts the Customer object to a JSON string.

        Returns:
            A JSON string representing the Customer object.
        """
        return self.model_dump_json(indent=4)
    def get_user(username: str, password: str) -> Optional["LoginResponse"]:
        """
        Retrieves a user by username and password.

        Args:
            username (str): The username of the user.
            password (str): The password of the user.

        Returns:
            Optional[LoginResponse]: The user object if found, None otherwise.
        """
        # Using API to get user information
        url = "http://localhost:8070/api/auth/login"
        headers = {
            "Content-Type": "application/json"
        }
        data = {
            "username": username,
            "password": password
        }
        try:
            response = requests.post(url, headers=headers, json=data)
            response.raise_for_status()
            user_data = response.json()
            return LoginResponse(**user_data) 
        except requests.RequestException as e:
            logger.error("Error retrieving user: %s", e)
            return None
        
