from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_huggingface_status_disabled_by_default():
    response = client.get("/api/v1/ai/huggingface/status")
    assert response.status_code == 200
    body = response.json()
    assert body["provider"] == "huggingface"
    assert body["enabled"] is False


def test_huggingface_generate_returns_provider_not_enabled():
    response = client.post("/api/v1/ai/huggingface/generate", json={"prompt": "hello"})
    assert response.status_code == 200
    body = response.json()
    assert body["enabled"] is False
    assert body["error"] == "provider_not_enabled"
