import serial
import json
import requests

SERIAL_PORT = 'COM3'  # Change to your Arduino's COM port, e.g. '/dev/ttyACM0' on Linux
BAUD_RATE = 9600
API_URL = 'http://localhost:3000/api/logEvent'  # Change to your Node.js backend URL

def main():
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    print(f"Listening on serial port {SERIAL_PORT}...")

    while True:
        try:
            line = ser.readline().decode('utf-8', errors='ignore').strip()
            if not line:
                continue

            # Check if line is JSON event log
            if line.startswith('{') and line.endswith('}'):
                data = json.loads(line)
                print("Received event:", data)

                # Send POST request to backend
                response = requests.post(API_URL, json=data)
                print(f"Sent to server, status {response.status_code}: {response.text}")
            else:
                print("Arduino:", line)
        except Exception as e:
            print("Error:", e)

if __name__ == "__main__":
    main()
