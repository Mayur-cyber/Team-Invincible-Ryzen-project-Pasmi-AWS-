import pytest
from fastapi.testclient import TestClient
from starlette.requests import Request

from app.routers import integrations
from app.core.config import settings
from app.models.user import User

# Import the FastAPI app
from main import app


class DummyUser:
    id = 123


@pytest.fixture(autouse=True)
def patch_user(monkeypatch):
    # make get_user_from_token always return a dummy user
    monkeypatch.setattr(integrations, "get_user_from_token", lambda token, db: DummyUser())


@pytest.fixture
def client():
    return TestClient(app)


def test_x_token_exchange_with_secret(monkeypatch, client):
    # ensure secret is present
    settings.TWITTER_CLIENT_ID = "test-client"
    settings.TWITTER_CLIENT_SECRET = "test-secret"

    # intercept the token endpoint call
    captured = {}

    class FakeResp:
        def __init__(self, status, json_data):
            self.status_code = status
            self._json = json_data
            self.text = str(json_data)

        def json(self):
            return self._json

    def fake_post(url, data=None, headers=None, auth=None):
        captured['url'] = url
        captured['data'] = data
        captured['headers'] = headers
        captured['auth'] = auth
        return FakeResp(200, {"access_token": "A", "refresh_token": "R", "expires_in": 3600})

    def fake_get(url, headers=None):
        return FakeResp(200, {"data": {"id": "999", "username": "tester"}})

    monkeypatch.setattr(integrations, "requests", type("R", (), {"post": fake_post, "get": fake_get}))

    # Step1: hit auth endpoint to set session cookie
    resp = client.get("/api/integrations/twitter/auth")
    assert resp.status_code == 307 or resp.status_code == 200
    # session cookie should be returned
    cookie = resp.cookies.get("pasmi_session")
    assert cookie

    # Now call callback carrying the same cookie
    headers = {"cookie": f"pasmi_session={cookie}"}
    resp2 = client.get(
        "/api/integrations/twitter/callback?code=CODE123&state=statejwt",
        headers=headers,
    )
    # should redirect to success
    assert resp2.status_code == 307
    assert "success=twitter" in resp2.headers["location"]

    # verify that the fake_post was called with auth tuple
    assert captured.get("auth") == ("test-client", "test-secret")
    assert captured.get("data")["code_verifier"]


def test_x_token_exchange_without_secret(monkeypatch, client):
    # remove secret in settings
    settings.TWITTER_CLIENT_ID = "test-client"
    settings.TWITTER_CLIENT_SECRET = None

    captured = {}

    class FakeResp:
        def __init__(self, status, json_data):
            self.status_code = status
            self._json = json_data
            self.text = str(json_data)

        def json(self):
            return self._json

    def fake_post(url, data=None, headers=None, auth=None):
        captured['auth'] = auth
        return FakeResp(200, {"access_token": "A", "refresh_token": "R"})

    def fake_get(url, headers=None):
        return FakeResp(200, {"data": {"id": "999"}})

    monkeypatch.setattr(integrations, "requests", type("R", (), {"post": fake_post, "get": fake_get}))

    # set session cookie as before
    resp = client.get("/api/integrations/twitter/auth")
    cookie = resp.cookies.get("pasmi_session")
    assert cookie

    headers = {"cookie": f"pasmi_session={cookie}"}
    resp2 = client.get("/api/integrations/twitter/callback?code=CODE123&state=statejwt", headers=headers)
    assert resp2.status_code == 307
    assert captured.get("auth") is None
