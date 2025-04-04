import time
import serial
import firebase_admin
from firebase_admin import credentials, db
import glob
import sys

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
	else:
		print("Set to command to default")


	db.reference("users/default/commands/motor_command").set("")

print("Checking Database")
command_ref = db.reference("users/default/commands/motor_command")
command_ref.listen(handle_command)
print("Database Checked")

