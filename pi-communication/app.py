import time
import serial
import firebase_admin
from firebase_admin import credentials, db
import glob
import sys
import datetime
import threading

# Initialize Firebase
cred = credentials.Certificate("../Downloads/petpal-17cc8-firebase-adminsdk-fbsvc-ba3cc64679.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://petpal-17cc8-default-rtdb.firebaseio.com/"
})

# Arduino connection setup
def find_arduino_ports():
    ports = glob.glob('/dev/ttyACM*')
    print(ports)
    if not ports:
        print("No Arduino port found")
        sys.exit(1)
    return ports[0]

port = find_arduino_ports()
arduino = None
serial_lock = threading.Lock()

def reconnect_arduino():
    global arduino, port
    try:
        if arduino and arduino.is_open:
            arduino.close()
    except:
        pass
    try:
        arduino = serial.Serial(port, 9600)
        time.sleep(2)  # Allow time for Arduino reset
        print("Successfully reconnected to Arduino")
    except Exception as e:
        print(f"Arduino reconnection failed: {e}")

reconnect_arduino()  # Initial connection

# Thread-safe serial writing with error recovery
def safe_serial_write(command):
    global arduino
    try:
        with serial_lock:
            if not arduino or not arduino.is_open:
                reconnect_arduino()
            arduino.write(command)
            arduino.flush()  # Force immediate send
            print(f"Sent command: {command.decode().strip()}")
    except Exception as e:
        print(f"Serial write error: {e}")
        reconnect_arduino()

# Firebase command handler
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

# Scheduling logic
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
        print(f"Critical error in scheduler: {e}")