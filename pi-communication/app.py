import asyncio
import serial_asyncio
import firebase_admin
from firebase_admin import credentials, db
import glob
import sys
import datetime

cred = credentials.Certificate("../Downloads/petpal-17cc8-firebase-adminsdk-fbsvc-ba3cc64679.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://petpal-17cc8-default-rtdb.firebaseio.com/"
})

# Async function to find Arduino ports
async def find_arduino_ports():
    ports = glob.glob('/dev/ttyACM*')
    print(ports)
    if not ports:
        print("No port found")
        sys.exit(1)
    return ports[0]

# Async function to handle the command
async def handle_command(event):
    print("Hello")
    data = event.data
    if data == "WATER":
        print("Triggering water motor")
        await arduino.write(b'WATER\n')
    elif data == "FOOD": 
        print("Triggering food motor")
        await arduino.write(b'FOOD\n')
    elif data == "POTTY":
        print("Triggering potty motor")
        await arduino.write(b'POTTY\n')
    else:
        print("Set to command to default")

    # Reset the command in Firebase
    db.reference("users/default/commands/motor_command").set("")

# Async function to format the current time
async def format_current_time():
    """Formatting the time found on the PI for comparisons"""
    now = datetime.datetime.now()
    hour = now.hour
    minute = now.minute
    isAM = True
    if hour >= 12:
        if hour > 12:
            hour -= 12
        isAM = False
    if hour == 0:
        hour = 12
    return f"{str(hour).zfill(2)}:{str(minute).zfill(2)}:{'AM' if isAM else 'PM'}"

# Async function to check the schedule and trigger motors if necessary
async def check_schedule_and_trigger(last_triggered):
    """
    Get the scheduling data and trigger motors if the current time matches.
    Also keep the last triggered event so the event doesn't trigger multiple times
    """
    schedule_ref = db.reference("users/default/scheduling")
    data = await schedule_ref.get() or {}
    food_times = data.get("foodRefillTimes", [])
    water_times = data.get("waterRefillTimes", [])
    potty_times = data.get("pottyRefillTimes", [])

    current_time_str = await format_current_time()
    print("Current time: ", current_time_str)

    if current_time_str in food_times and last_triggered.get("food") != current_time_str:
        print("Activating food motor")
        await arduino.write(b'FOOD\n')
        last_triggered["food"] = current_time_str

    if current_time_str in water_times and last_triggered.get("water") != current_time_str:
        print("Activating water motor")
        await arduino.write(b'WATER\n')
        last_triggered["water"] = current_time_str

    if current_time_str in potty_times and last_triggered.get("potty") != current_time_str:
        print("Activating potty motors")
        await arduino.write(b'POTTY\n')
        last_triggered["potty"] = current_time_str

    return last_triggered

# Async function to initialize the Arduino connection
async def init_arduino():
    port = await find_arduino_ports()
    global arduino
    arduino = await serial_asyncio.create_serial_connection(None, port, 9600)
    print("Arduino connected")

# Async function to run the listener and scheduling checks
async def run():
    print("Checking Database")
    
    # Initialize the Arduino connection
    await init_arduino()

    # Listen to Firebase command reference
    command_ref = db.reference("users/default/commands/motor_command")
    command_ref.listen(handle_command)
    
    print("Database Checked")

    # Keep track of most recent events to avoid repetitive actions
    last_triggered = {}

    # Continuously check the schedule every 30 seconds asynchronously
    while True:
        last_triggered = await check_schedule_and_trigger(last_triggered)
        await asyncio.sleep(30)  # Non-blocking sleep

# Start the asyncio event loop
if __name__ == "__main__":
    asyncio.run(run())