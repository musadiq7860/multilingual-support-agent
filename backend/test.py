import os
from dotenv import load_dotenv

load_dotenv()

def run_test():
    import traceback
    try:
        from models import analyze_with_gemini
        print(analyze_with_gemini("actually my internet is down"))
    except Exception as e:
        print("EXCEPTION HAPPENED:", e)
        traceback.print_exc()

run_test()
