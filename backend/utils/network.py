from fastapi import Request


def get_client_ip(request: Request) -> str:
    """
    Extract client IP address considering proxy headers (X-Forwarded-For, X-Real-IP).
    """
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()
    if request.client and request.client.host:
        return request.client.host
    return "127.0.0.1"
