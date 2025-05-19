import logging
from fastapi.openapi.models import HTTPBearer as OpenAPIHTTPBearer
from google.adk.auth import AuthConfig
logger = logging.getLogger(__name__)



auth_scheme = OpenAPIHTTPBearer(
    type="http",
    scheme="bearer",
    bearerFormat="JWT",
)

auth_config = AuthConfig(
    auth_scheme=auth_scheme
)

