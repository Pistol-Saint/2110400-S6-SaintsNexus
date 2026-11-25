
import os
from datetime import datetime, timedelta, timezone

import jwt


JWT_ALGORITHM = "HS256"
JWT_ISSUER = "saints-nexus"
ACCESS_TOKEN_MINUTES = 15


def create_access_token(
    user_id: str,
    role: str,
    session_id: str,
) -> str:
    secret = os.getenv("JWT_SECRET_KEY")

    if not secret:
        raise RuntimeError("JWT_SECRET_KEY is missing from backend/.env")

    now = datetime.now(timezone.utc)

    payload = {
        "sub": user_id,
        "role": role,
        "session_id": session_id,
        "iss": JWT_ISSUER,
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_MINUTES),
    }

    return jwt.encode(payload, secret, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    secret = os.getenv("JWT_SECRET_KEY")

    if not secret:
        raise RuntimeError("JWT_SECRET_KEY is missing from backend/.env")

    return jwt.decode(
        token,
        secret,
        algorithms=[JWT_ALGORITHM],
        issuer=JWT_ISSUER,
        options={
            "require": [
                "sub",
                "role",
                "session_id",
                "exp",
                "iat",
                "iss",
            ]
        },
    )
