import pyttsx3
import speech_recognition as sr
import eel
import time
import webbrowser
from playsound import playsound
import os
from groq import Groq

# Initialize Groq client
client = Groq(api_key="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")

def speak(text):
    engine = pyttsx3.init('sapi5')
    engine.setProperty('rate', 174)
    engine.say(text)
    engine.runAndWait()

def play_site_sound(site):
    sound_file = f"sounds/{site}.mp3"
    if os.path.exists(sound_file):
        playsound(sound_file)
    else:
        speak(f"Opening {site}")

def open_website(site):
    sites = {
        "youtube": "https://www.youtube.com",
        "google": "https://www.google.com",
        "github": "https://www.github.com",
        "facebook": "https://facebook.com",
        "netflix": "https://www.netflix.com"
    }
    
    if site in sites:
        play_site_sound(site)
        webbrowser.open(sites[site])
    else:
        speak(f"Sorry, I don't have {site} in my list of websites to open.")

def generate_ai_response(query):
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": query,
                }
            ],
            model="llama3-8b-8192",
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"Error generating AI response: {e}")
        return "I'm sorry, I couldn't generate a response at this time."

def listen_for_command(r, source):
    print('Listening for command...')
    r.pause_threshold = 1
    r.adjust_for_ambient_noise(source)
    try:
        audio = r.listen(source, timeout=10, phrase_time_limit=6)
        print('Recognizing command...')
        query = r.recognize_google(audio, language='en-in').lower()
        print(f"User said: {query}")
        return query
    except sr.WaitTimeoutError:
        print("Listening timed out")
        return ""
    except sr.UnknownValueError:
        print("Could not understand audio")
        return ""
    except Exception as e:
        print(f"Error: {e}")
        speak("Sorry, I couldn't understand that.")
        return ""

@eel.expose
def takecommand():
    activation_keyword = "hello jarvis"
    r = sr.Recognizer()
    
    while True:
        # Listen for activation keyword
        with sr.Microphone() as source:
            print('Listening for activation keyword...')
            r.pause_threshold = 1
            r.adjust_for_ambient_noise(source)
            try:
                audio = r.listen(source, timeout=10)
                print('Recognizing...')
                phrase = r.recognize_google(audio, language='en-in').lower()
                print(f"Heard: {phrase}")
                
                if activation_keyword in phrase:
                    print("Activation keyword detected!")
                    speak("Activation key detected")
                    speak("How may I help you?")
                    
                    while True:
                        with sr.Microphone() as command_source:
                            query = listen_for_command(r, command_source)
                            
                            if query == "exit":
                                speak("Goodbye!")
                                return "Exiting Jarvis"
                            
                            if "open" in query:
                                words = query.split()
                                if "open" in words:
                                    site = words[words.index("open") + 1]
                                    open_website(site)
                            else:
                                # Generate AI response for any query
                                ai_response = generate_ai_response(query)
                                speak(f"Here's what I think: {ai_response}")
                                print(f"AI Response: {ai_response}")
                            
                            # Wait for a few seconds before asking again
                            time.sleep(3)
                            speak("How may I help you?")
            
            except sr.WaitTimeoutError:
                continue
            except sr.UnknownValueError:
                print("Could not understand audio")
                continue
            except Exception as e:
                print(f"Error: {e}")
                continue

# Test the function
if __name__ == "__main__":
    takecommand()