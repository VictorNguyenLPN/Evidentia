from datetime import timedelta

from backend.auth.auth_handler import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_password_hashing_and_verification():
    raw_password = "SecurePassword123!"
    hashed = hash_password(raw_password)

    assert hashed != raw_password
    assert verify_password(raw_password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_generation_and_decoding():
    payload_data = {"sub": "user_12345", "role": "admin"}
    token = create_access_token(payload_data, expires_delta=timedelta(minutes=15))

    assert isinstance(token, str)
    decoded = decode_access_token(token)

    assert decoded is not None
    assert decoded.get("sub") == "user_12345"
    assert decoded.get("role") == "admin"
    assert "exp" in decoded


def test_jwt_token_invalid():
    invalid_token = "invalid.token.string"
    decoded = decode_access_token(invalid_token)
    assert decoded is None
