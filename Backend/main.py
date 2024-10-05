import os
import eel
import threading
from Engine.features import playAssistantSound
from Engine.command import takecommand
# Initialize Eel with frontend directory
eel.init("Frontend")

# Define the function to launch Eel and Chrome
def launchEel():
    # Launch Eel in a non-blocking manner
    eel.start('index.html', mode=None, host='localhost', block=False)

if __name__ == "__main__":
    # Start playing sound in a separate thread
    sound_thread = threading.Thread(target=playAssistantSound)
    sound_thread.start()

    # Launch Chrome in app mode
    os.system('start chrome --app="http://localhost:5173/index.html"')

    # Start Eel application
    launchEel()

    # # Start handling voice commands
    voice_thread = threading.Thread(target=takecommand)
    voice_thread.start()

    # Keep the main thread running
    eel.sleep(10000000)  # Adjust the sleep time as needed