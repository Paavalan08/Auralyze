import google.generativeai as genai

# PASTE YOUR KEY HERE
genai.configure(api_key="AIzaSyDL_3lCQGiLtNJJA1AhIFt8Jyh_fWRs71s")

print("Checking Google Servers for unlocked models...")
try:
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"✅ UNLOCKED: {model.name}")
except Exception as e:
    print(f"❌ ERROR: {e}")