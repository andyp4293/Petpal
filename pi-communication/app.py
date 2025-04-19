import time
import serial
import firebase_admin
from firebase_admin import credentials, db
import glob
import sys
import datetime
import threading
from serial.tools import list_ports  # Added for robust port detection

# Initialize Firebase
cred = credentials.Certificate("../Downloads/petpal-17cc8-firebase-adminsdk-fbsvc-ba3cc64679.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://petpal-17cc8-default-rtdb.firebaseio.com/"
})

# Arduino connection setup
def find_arduino_ports():
    """Find all Arduino-compatible ports using vendor/product ID"""
    arduino_ports = []
    for port in list_ports.comports():
        if port.vid == 0x2341 and port.pid == 0x0043:  # Common Arduino Uno IDs
            arduino_ports.append(port.device)
    if not arduino_ports:
        print("No Arduino found")
        return None
    return arduino_ports[0]

arduino = None
serial_lock = threading.Lock()
connection_attempts = 0

def reconnect_arduino():
    global arduino, connection_attempts
    try:
        if arduino and arduino.is_open:
            arduino.close()
    except Exception as e:
        print(f"Error closing port: {e}")
    
    max_retries = 5
    for attempt in range(max_retries):
        try:
            port = find_arduino_ports()
            if not port:
                print("Arduino not detected")
                time.sleep(2 ** attempt)  # Exponential backoff
                continue
                
            arduino = serial.Serial(port, 9600, timeout=1)
            time.sleep(2 + attempt)  # Longer wait after reset
            arduino.reset_input_buffer()
            arduino.reset_output_buffer()
            print(f"Connected to {port}")
            connection_attempts = 0
            return True
        except Exception as e:
            print(f"Connection attempt {attempt+1} failed: {e}")
            time.sleep(1)
    
    print("Max reconnection attempts reached")
    return False

# Initial connection
if not reconnect_arduino():
    sys.exit(1)

# Thread-safe serial writing with advanced recovery
def safe_serial_write(command):
    global arduino, connection_attempts
    try:
        with serial_lock:
            if not arduino or not arduino.is_open:
                if not reconnect_arduino():
                    return False
            
            arduino.write(command)
            arduino.flush()
            print(f"Sent: {command.decode().strip()}")
            return True
            
    except Exception as e:
        print(f"Write failed: {e}")
        connection_attempts += 1
        if connection_attempts >= 3:
            print("Critical connection failure")
            sys.exit(1)
        return False

# Firebase command handler (unchanged except for safe_serial_write calls)
def handle_command(event):
    data = event.data
    if data == "WATER":
        print("Triggering water motor")
        safe_serial_write(b'WATER\n')
    elif data == "FOOD":
        print("Triggering food motor")
        safe_serial_write(b'FOOD\n')
    elif data == "POTTY":
        print("Triggering potty motor")
        safe_serial_write(b'POTTY\n')
    else:
        print("Unknown command")

    db.reference("users/default/commands/motor_command").set("")

# Scheduling logic (unchanged except for safe_serial_write calls)
def format_current_time():
    now = datetime.datetime.now()
    hour = now.hour
    minute = now.minute
    is_am = hour < 12
    display_hour = hour if 1 <= hour <= 12 else abs(hour - 12)
    return f"{display_hour:02d}:{minute:02d}:{'AM' if is_am else 'PM'}"

def check_schedule_and_trigger(last_triggered):
    ref = db.reference("users/default/scheduling")
    schedule = ref.get() or {}
    
    current_time = format_current_time()
    print(f"Scheduler check at {current_time}")

    with serial_lock:
        for task in ["food", "water", "potty"]:
            times = schedule.get(f"{task}RefillTimes", [])
            if current_time in times and last_triggered.get(task) != current_time:
                print(f"Activating {task} motor")
                safe_serial_write(f"{task.upper()}\n".encode())
                last_triggered[task] = current_time

    return last_triggered

# Main execution
last_triggered = {}
print("Initializing Firebase listener...")
command_ref = db.reference("users/default/commands/motor_command")
command_ref.listen(handle_command)

print("Starting scheduler loop")
while True:
    try:
        last_triggered = check_schedule_and_trigger(last_triggered)
        time.sleep(30)
    except KeyboardInterrupt:
        print("Exiting...")
        break
    except Exception as e:
        print(f"Critical error: {e}")