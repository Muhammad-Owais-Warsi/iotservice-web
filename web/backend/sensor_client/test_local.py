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

def generate_signature(payload_str, timestamp):
    message = payload_str + timestamp
    key_bytes = SECRET.encode('utf-8')
    msg_bytes = message.encode('utf-8')
    return hmac.new(key_bytes, msg_bytes, hashlib.sha256).hexdigest()

def send_secure_data():
    temp = round(random.uniform(20.0, 30.0), 2)
    hum = round(random.uniform(40.0, 80.0), 2)
    
    now_sec = int(time.time())
    ts_ms = str(now_sec * 1000)
    ts_iso = datetime.fromtimestamp(now_sec, timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
    req_uuid = str(uuid.uuid4())

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
    
    payload_str = json.dumps(payload_dict, separators=(',', ':'))
    signature = generate_signature(payload_str, ts_ms)

    headers = {
        "Content-Type": "application/json",
        "X-Timestamp": ts_ms,
        "X-Device-Id": DEVICE_ID,
        "X-Signature": signature
    }

    print(f"Sending Secure Packet to {URL} (Temp: {temp})...", end=" ")
    
    try:
        req = urllib.request.Request(URL, data=payload_str.encode('utf-8'), headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=10) as response:
            status_code = response.getcode()
            response_text = response.read().decode('utf-8')
            if status_code == 200:
                print("✅ Accepted!")
                print(f"Response: {response_text}")
            else:
                print(f"❌ Error {status_code}")
                print(response_text)
    except urllib.error.HTTPError as e:
        print(f"❌ Error {e.code}")
        print(e.read().decode('utf-8'))
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    print(f"--- Testing FLOW to {URL} ---")
    send_secure_data()
