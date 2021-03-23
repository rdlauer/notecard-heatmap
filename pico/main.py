from machine import I2C, Pin
from machine_i2c_lcd import I2cLcd
from time import sleep
import keys
import notecard

# set some constants
GEOFENCE_METERS = 20
PRODUCTUID = keys.PRODUCTUID

# init onboard led
#led = Pin(25, Pin.OUT)

# init i2c bus and lcd
i2c = I2C(1, sda=Pin(2), scl=Pin(3))
lcd_i2c_addr = i2c.scan()[1]
lcd = I2cLcd(i2c, lcd_i2c_addr, 2, 16)
lcd.clear()

# init notecard
card = notecard.OpenI2C(i2c, 0, 0, debug=True)
print("Successfully Connected to Notecard!")

# reset the card (optional)
req = {"req": "card.restore", "delete": True}
rsp = card.Transaction(req)
sleep(2)

# configure card to communicate with notehub
req = {"req": "hub.set"}
req["product"] = PRODUCTUID
req["mode"] = "periodic"
req["inbound"] = 60
req["outbound"] = 5
rsp = card.Transaction(req)

# init gps on notecard in continuous mode
req = {"req": "card.location.mode", "mode": "continuous"}
rsp = card.Transaction(req)

# perform a manual sync with notehub (THIS SHOULD NOT BE NECESSARY...)
req = {"req": "hub.sync"}
rsp = card.Transaction(req)
sleep(30)  # giving time for GPS to rev up...

# init variable to tell us if gps is active
is_gps_active = False


def track_location(lat, lon):
    """ if gps is active and location has changed significantly, create a note in notehub """
    set_geofence(lat, lon)
    loc_changed = False

    while not loc_changed:
        req = {"req": "card.location"}
        rsp = card.Transaction(req)

        # double check that gps is still active!
        if "{gps-sats}" in rsp["status"] and "lat" in rsp and rsp["max"] >= GEOFENCE_METERS:
            loc_changed = True
            lcd_msg("LOCATION CHANGED")
            new_lat = rsp["lat"]
            new_lon = rsp["lon"]
            sleep(1)  # just to catch a glimpse on lcd
            # get the current cell signal measure
            bars = get_cell_bars()
            add_note(new_lat, new_lon, bars)
            # reset and start tracking location again!
            track_location(new_lat, new_lon)
        else:
            lcd_msg("NO LOCATION CHANGE")
            sleep(5)


def add_note(lat, lon, bars):
    """ uploads the note/event to notehub.io """
    req = {"req": "note.add"}
    req["file"] = "bars.qo"
    req["start"] = True
    req["body"] = {"lat": lat, "lon": lon, "bars": bars}
    rsp = card.Transaction(req)


def set_geofence(lat, lon):
    """ sets a new geofence with center point on provided lat/lon """
    req = {"req": "card.location.mode", "mode": "continuous", "minutes": 0,
           "lat": lat, "lon": lon, "max": GEOFENCE_METERS}
    rsp = card.Transaction(req)


def get_cell_bars():
    """ gets the cell signal strength from card.wireless """
    req = {"req": "card.wireless"}
    rsp = card.Transaction(req)
    return rsp["count"]


def lcd_msg(msg):
    """ displays a message on the lcd screen """
    lcd.clear()
    lcd.putstr(msg)
    print("*****" + msg + "*****")


while not is_gps_active:
    """ checks to see if the gps module is active """
    req = {"req": "card.location"}
    rsp = card.Transaction(req)

    if ("{gps-sats}" in rsp["status"] and "lat" in rsp):
        is_gps_active = True
        lcd_msg("GPS ACTIVATED")
        sleep(2)
        track_location(rsp["lat"], rsp["lon"])
    else:
        lcd_msg("GPS STILL INACTIVE")
        sleep(20)
