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
URL = "http://localhost:5000/api/sensors/ingest"
SECRET = "9vA3xKp2nR8sL7qW4eY1zU6tH5mJ0cB2"
DEVICE_ID = "sensor-001"
SENSOR_ID = "550e8400-e29b-41d4-a716-446655440031"

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
                "sensor_id": SENSOR_ID,
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
        "X-Signature": signature,
        "Idempotency-Key": req_uuid
    }

    print(f"Sending Secure Packet (Temp: {temp})...", end=" ")
    
    try:
        req = urllib.request.Request(URL, data=payload_str.encode('utf-8'), headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=5) as response:
            status_code = response.getcode()
            response_text = response.read().decode('utf-8')
            if status_code == 200:
                print("✅ Accepted!")
            elif status_code == 401:
                print("❌ REJECTED (Signature Mismatch)")
                print(response_text)
            else:
                print(f"❌ Error {status_code}")
    except urllib.error.HTTPError as e:
        print(f"❌ Error {e.code}")
        print(e.read().decode('utf-8'))
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    print(f"--- Sending ENCRYPTED data to {URL} ---")
    print("Press Ctrl+C to stop.\n")
    
    while True:
        send_secure_data()
        time.sleep(3)
