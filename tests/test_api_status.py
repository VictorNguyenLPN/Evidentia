def test_read_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "endpoints" in data
    assert data["endpoints"]["status"] == "/api/status"
