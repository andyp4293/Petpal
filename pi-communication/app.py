
import time
import serial
import firebase_admin
from firebase_admin import credentials, db
import glob
import sys
import datetime

cred = credentials.Certificate("../Downloads/petpal-17cc8-firebase-adminsdk-fbsvc-ba3cc64679.json")
firebase_admin.initialize_app(cred, {
        "databaseURL": "https://petpal-17cc8-default-rtdb.firebaseio.com/"
})

# python3 app.py

def find_arduino_ports():
	ports = glob.glob('/dev/ttyACM*')
	print(ports)
	if not ports:
		print("no port found")
		sys.exit(1)
	return ports[0]

port = find_arduino_ports()
arduino = serial.Serial(port, 9600)
time.sleep(2)


# arduino = serial.Serial('/dev/ttyACM0',9600)
# time.sleep(2)


def handle_command(event):
	print("hello")
	data = event.data
	if data == "WATER":
		print("Triggering water motor")
		arduino.write(b'WATER\n')
	elif data == "FOOD": 
		print("Triggering food motor")
		arduino.write(b'FOOD\n')
	elif data == "POTTY":
		print("Triggering potty motor")
		arduino.write(b'POTTY\n')
	else:
		print("Set to command to default")


	db.reference("users/default/commands/motor_command").set("")

def format_current_time():
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

def check_schedule_and_trigger(last_triggered):
	"""
	Get the scheduling data and trigger motors if the current time matches.
	Also keep the last triggered event so the event doesn't trigger multiple times
	"""
	schedule_ref = db.reference("users/default/scheduling")
	data = schedule_ref.get() or {}
	food_times = data.get("foodRefillTimes", [])
	water_times = data.get("waterRefillTimes", [])
	potty_times = data.get("pottyRefillTimes", [])

	current_time_str = format_current_time()
	print("Current time: ", current_time_str)

	if current_time_str in food_times and last_triggered.get("food") != current_time_str:
		print("Activating food motor")
		arduino.write(b'FOOD\n')
		last_triggered["food"] = current_time_str

	if current_time_str in water_times and last_triggered.get("water") != current_time_str:
		print("Activating water motor")
		arduino.write(b'WATER\n')
		last_triggered["water"] = current_time_str

	if current_time_str in potty_times and last_triggered.get("potty") != current_time_str:
		print("Activating potty motors")
		arduino.write(b'POTTY\n')
		last_triggered["potty"] = current_time_str

	return last_triggered

# keep track of most recent events to avoid repetitive actions
last_triggered = {}



print("Checking Database")
command_ref = db.reference("users/default/commands/motor_command")
command_ref.listen(handle_command)
print("Database Checked")

while True:
	last_triggered = check_schedule_and_trigger(last_triggered)
	time.sleep(30)

