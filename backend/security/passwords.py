
import os
from pathlib import Path

from dotenv import load_dotenv
from pwdlib import PasswordHash


# Load environment variables from backend/.env
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

password_hasher = PasswordHash.recommended()


def _prepare_password(password: str) -> str:
    pepper = os.getenv("PASSWORD_PEPPER")

    if not pepper:
        raise RuntimeError("PASSWORD_PEPPER is missing from backend/.env")

    return password + pepper


def hash_password(password: str) -> str:
    prepared_password = _prepare_password(password)
    return password_hasher.hash(prepared_password)


def verify_password(password: str, password_hash: str) -> bool:
    prepared_password = _prepare_password(password)
    return password_hasher.verify(prepared_password, password_hash)
