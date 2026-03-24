# jwt_utils.py - Utility functions for creating and decoding JWT access tokens
import os
# datetime and timedelta are used for handling token expiration times
from datetime import datetime, timedelta, timezone
# dotenv is used for loading environment variables from a .env file
from typing import Optional

# jose is used for encoding and decoding JWT tokens
from dotenv import load_dotenv
# Load environment variables from the .env file
from jose import jwt

# Load environment variables for JWT configuration, with default values if not set
load_dotenv()

# Secret key for signing JWT tokens, algorithm used for encoding, and token expiration time in minutes
SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


# Function to create a JWT access token with the given data and optional expiration time
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()

# Calculate the expiration time for the token, using the provided expires_delta or a default value
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Function to decode a JWT access token and return the contained data as a dictionary
def decode_access_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])