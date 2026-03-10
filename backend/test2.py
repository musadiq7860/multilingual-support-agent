import os
from dotenv import load_dotenv

load_dotenv(override=True)

def run_test():
    try:
        from models import analyze_with_groq
        print("Running analyze_with_groq...")
        print(analyze_with_groq("actually my internet is down"))
    except Exception as e:
        import traceback
        traceback.print_exc()

run_test()
