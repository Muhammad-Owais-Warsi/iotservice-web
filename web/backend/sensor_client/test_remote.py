import json
import time
import hmac
import hashlib
import uuid
import urllib.request
import urllib.error
from datetime import datetime, timezone
import random

# --- CONFIGURATION ---
URL = "https://secure-dashboard-kk3f.onrender.com/api/ingest/readings"
SECRET = "9vA3xKp2nR8sL7qW4eY1zU6tH5mJ0cB2"
DEVICE_ID = "sensor-001"

def generate_signature(payload_str, timestamp):
    """
    Formula: Payload + Timestamp
    """
    message = payload_str + timestamp
    key_bytes = SECRET.encode('utf-8')
    msg_bytes = message.encode('utf-8')
    return hmac.new(key_bytes, msg_bytes, hashlib.sha256).hexdigest()

def send_secure_data():
    # 1. Generate Fake Data
    temp = round(random.uniform(20.0, 30.0), 2)
    hum = round(random.uniform(40.0, 80.0), 2)
    
    # 2. Timestamps
    now_sec = int(time.time())
    ts_ms = str(now_sec * 1000)
    ts_iso = datetime.fromtimestamp(now_sec, timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
    req_uuid = str(uuid.uuid4())

    # 3. Payload
    payload_dict = {
        "readings": [
            {
                "ts": ts_iso,
                "temperature": temp, 
                "humidity": hum,
                "door_status": "closed"
            }
        ]
    }
    
    # 4. Stringify (Compact)
    payload_str = json.dumps(payload_dict, separators=(',', ':'))

    # 5. Sign
    signature = generate_signature(payload_str, ts_ms)

    # 6. Send
    headers = {
        "Content-Type": "application/json",
        "X-Timestamp": ts_ms,
        "X-Device-Id": DEVICE_ID,
        "X-Signature": signature
    }

    print(f"Sending Secure Packet to {URL} (Temp: {temp})...")
    
    try:
        req = urllib.request.Request(URL, data=payload_str.encode('utf-8'), headers=headers, method='POST')
        # Using a slightly longer timeout for Render's cold start or latency
        with urllib.request.urlopen(req, timeout=15) as response:
            status_code = response.getcode()
            response_text = response.read().decode('utf-8')
            if status_code == 200:
                print("✅ End-to-End Success! Data accepted by Remote Backend.")
                print(f"Response: {response_text}")
                return True
            else:
                print(f"❌ Backend returned status {status_code}")
                print(f"Response: {response_text}")
                return False
    except urllib.error.HTTPError as e:
        print(f"❌ HTTP Error {e.code}: {e.reason}")
        print(e.read().decode('utf-8'))
        return False
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return False

if __name__ == "__main__":
    print(f"--- TESTING END-TO-END FLOW (Sensor -> Render Backend) ---")
    print(f"Target: {URL}")
    print("-" * 50)
    
    success = send_secure_data()
    
    if success:
        print("\n[REPORT] FLOW TEST PASSED")
        print("1. Client: Sensor data generated and HMAC signed successfully.")
        print("2. Transport: Request delivered to Render cloud instance.")
        print("3. Backend: Remote server validated signature and stored data.")
    else:
        print("\n[REPORT] FLOW TEST FAILED")
        print("Check if the Render service is awake (it may sleep on free tiers).")
