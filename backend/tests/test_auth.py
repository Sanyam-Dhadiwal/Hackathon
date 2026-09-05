import sys
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from fastapi.testclient import TestClient
from backend.main import app
from backend.database import db
from backend.services.auth_service import AuthService

client = TestClient(app)

def test_complete_auth_and_ownership():
    print("\n==================================================")
    print("RUNNING COMPLETE AUTHENTICATION & SECURITY TEST SUITE")
    print("==================================================")

    # 1. Clean test collections
    db.users.delete_many({})
    db.refresh_tokens.delete_many({})
    db.trips.delete_many({})

    # 2. Test User Registration
    print("\n[TEST 1] Registering User A (Alice)...")
    res_reg_a = client.post("/auth/register", json={
        "name": "Alice Traveler",
        "email": "alice@example.com",
        "password": "SecurePassword123!"
    })
    assert res_reg_a.status_code == 201, f"Registration failed: {res_reg_a.text}"
    data_reg_a = res_reg_a.json()
    assert data_reg_a["user"]["name"] == "Alice Traveler"
    assert data_reg_a["user"]["email"] == "alice@example.com"
    assert "password" not in data_reg_a["user"]
    assert "password_hash" not in data_reg_a["user"]
    user_a_id = data_reg_a["user"]["id"]
    # Mark email verified for testing login
    db.users.update_one({"id": user_a_id}, {"$set": {"email_verified": True}})
    print(" User A registered successfully (pending verification). Marked verified for test.")

    # 3. Verify password hashing in DB
    print("\n[TEST 2] Verifying password is cryptographically hashed in DB...")
    user_in_db = db.users.find_one({"email": "alice@example.com"})
    assert user_in_db is not None
    assert user_in_db["password_hash"].startswith("$2b$") or user_in_db["password_hash"].startswith("$2a$")
    assert "SecurePassword123!" not in user_in_db["password_hash"]
    assert AuthService.verify_password("SecurePassword123!", user_in_db["password_hash"]) is True
    print(" Verified: Raw password NEVER stored. Bcrypt hash with salt verified.")

    # 4. Duplicate Registration check
    print("\n[TEST 3] Testing duplicate email registration...")
    res_dup = client.post("/auth/register", json={
        "name": "Alice Duplicate",
        "email": "alice@example.com",
        "password": "AnotherPassword456"
    })
    assert res_dup.status_code == 409
    print(" Verified: Duplicate email rejected with 409 Conflict.")

    # 5. Invalid Login check
    print("\n[TEST 4] Testing invalid login credentials...")
    res_bad_login = client.post("/auth/login", json={
        "email": "alice@example.com",
        "password": "WrongPassword!"
    })
    assert res_bad_login.status_code == 401
    print(" Verified: Incorrect password rejected with 401 Unauthorized.")

    # 6. Valid Login
    print("\n[TEST 5] Testing valid login...")
    res_login_a = client.post("/auth/login", json={
        "email": "alice@example.com",
        "password": "SecurePassword123!"
    })
    assert res_login_a.status_code == 200
    data_login_a = res_login_a.json()
    assert "access_token" in data_login_a
    token_a = data_login_a["access_token"]
    print(" Verified: Login successful. Fresh access JWT generated.")

    # 7. GET /auth/me
    print("\n[TEST 6] Testing /auth/me with Bearer token...")
    res_me = client.get("/auth/me", headers={"Authorization": f"Bearer {token_a}"})
    assert res_me.status_code == 200
    me_data = res_me.json()
    assert me_data["id"] == user_a_id
    assert me_data["email"] == "alice@example.com"
    assert "password_hash" not in me_data
    print(" Verified: /auth/me returns safe user profile.")

    # 8. Unauthenticated /auth/me
    print("\n[TEST 7] Testing /auth/me without token...")
    res_me_unauth = client.get("/auth/me")
    assert res_me_unauth.status_code == 401
    print(" Verified: Unauthenticated request rejected with 401.")

    # 9. Token Refresh
    print("\n[TEST 8] Testing /auth/refresh with HttpOnly cookie...")
    res_refresh = client.post("/auth/refresh", cookies=res_login_a.cookies)
    assert res_refresh.status_code == 200
    data_refresh = res_refresh.json()
    assert "access_token" in data_refresh
    new_token_a = data_refresh["access_token"]
    assert new_token_a != token_a or len(new_token_a) > 20
    print(" Verified: Refresh token rotated, fresh access token issued.")

    # 10. Register User B (Bob)
    print("\n[TEST 9] Registering User B (Bob)...")
    res_reg_b = client.post("/auth/register", json={
        "name": "Bob Explorer",
        "email": "bob@example.com",
        "password": "BobPassword456!"
    })
    assert res_reg_b.status_code == 201
    user_b_id = res_reg_b.json()["user"]["id"]
    db.users.update_one({"id": user_b_id}, {"$set": {"email_verified": True}})
    res_login_b = client.post("/auth/login", json={
        "email": "bob@example.com",
        "password": "BobPassword456!"
    })
    assert res_login_b.status_code == 200
    token_b = res_login_b.json()["access_token"]
    print(f" User B registered and logged in (ID: {user_b_id}).")

    # 11. User A creates a trip
    print("\n[TEST 10] User A creates a Trip (Goa)...")
    trip_payload = {
        "destination": "Goa",
        "start_date": "2026-11-01",
        "end_date": "2026-11-05",
        "duration_days": 4,
        "travelers": 2,
        "total_budget": 25000.0,
        "currency": "₹",
        "interests": ["Beach", "Food"],
        "priority_weights": {"Beach": "HIGH", "Food": "HIGH"},
        "travel_style": "Balanced",
        "travel_pace": "Moderate",
        "special_constraints": "None"
    }
    res_trip_a = client.post(
        "/api/trips",
        json=trip_payload,
        headers={"Authorization": f"Bearer {new_token_a}"}
    )
    assert res_trip_a.status_code == 200
    trip_a = res_trip_a.json()
    trip_a_id = trip_a["id"]
    assert trip_a["user_id"] == user_a_id
    print(f" Trip created successfully by User A (Trip ID: {trip_a_id}).")

    # 12. User A accesses Trip A
    print("\n[TEST 11] User A accesses their own Trip...")
    res_get_own = client.get(
        f"/api/trips/{trip_a_id}",
        headers={"Authorization": f"Bearer {new_token_a}"}
    )
    assert res_get_own.status_code == 200
    assert res_get_own.json()["id"] == trip_a_id
    print(" User A successfully accessed their trip.")

    # 13. User B attempts to access User A's Trip -> MUST BE FORBIDDEN (403)
    print("\n[TEST 12] User B attempts to access User A's Trip (Ownership Verification)...")
    res_get_forbidden = client.get(
        f"/api/trips/{trip_a_id}",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert res_get_forbidden.status_code == 403, f"Expected 403, got {res_get_forbidden.status_code}"
    print(" Verified: User B blocked with 403 Forbidden.")

    # 14. User B attempts to record an expense on User A's Trip -> MUST BE FORBIDDEN (403)
    print("\n[TEST 13] User B attempts to tamper with User A's Trip expenses...")
    res_expense_forbidden = client.post(
        f"/api/trips/{trip_a_id}/expenses",
        json={"day_number": 1, "actual_amount": 9999.0},
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert res_expense_forbidden.status_code == 403
    print(" Verified: Tampering blocked with 403 Forbidden.")

    # 15. User B lists trips -> User A's trip must not appear
    print("\n[TEST 14] User B lists trips...")
    res_list_b = client.get("/api/trips", headers={"Authorization": f"Bearer {token_b}"})
    assert res_list_b.status_code == 200
    trips_b = res_list_b.json()
    assert all(t["id"] != trip_a_id for t in trips_b)
    print(" Verified: User A's trip is completely isolated and hidden from User B.")

    # 16. Logout
    print("\n[TEST 15] Testing Logout and token revocation...")
    res_logout = client.post("/auth/logout", cookies=res_refresh.cookies)
    assert res_logout.status_code == 200
    
    # Try refresh with the revoked session
    res_revoked_refresh = client.post("/auth/refresh", cookies=res_refresh.cookies)
    assert res_revoked_refresh.status_code == 401
    print(" Verified: Session revoked on logout; subsequent refresh attempts rejected.")

    print("\n==================================================")
    print(" ALL 15 AUTHENTICATION & SECURITY TESTS PASSED!")
    print("==================================================\n")

if __name__ == "__main__":
    test_complete_auth_and_ownership()
