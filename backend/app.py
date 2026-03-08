import os
import math
import numpy as np
import librosa
import tensorflow as tf
import keras
import pickle
import bcrypt
import datetime
import jwt
import glob 
import yt_dlp 
from functools import wraps
from pymongo import MongoClient
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from transformers import pipeline
from google import genai 
from bson.objectid import ObjectId

# NEW: The Language Traffic Cop
from langdetect import detect, LangDetectException

# =========================================================
# API & SERVER CONFIGURATION
# =========================================================
# ⚠️ PASTE YOUR GEMINI API KEY HERE 
GEMINI_API_KEY = "AIzaSyDL_3lCQGiLtNJJA1AhIFt8Jyh_fWRs71s"
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins="*")
app.config['SECRET_KEY'] = 'auralyze_super_secret_master_key_2026'

# =========================================================
# DATABASE & LOCAL AI SETUP
# =========================================================
print("Connecting to MongoDB Compass...")
client = MongoClient('mongodb://localhost:27017/')
db = client['auralyze_db'] 
users_collection = db['users'] 
history_collection = db['history'] 
print("Database Connected!")

# 1. Load Custom Audio CRNN
AUDIO_MODEL_PATH = "saved_models/auralyze_crnn_model.keras"
audio_model = keras.models.load_model(AUDIO_MODEL_PATH)
GENRES = ["blues", "classical", "country", "disco", "hiphop", "jazz", "metal", "pop", "reggae", "rock"]

# 2. Load Custom English BiLSTM
TEXT_MODEL_PATH = "saved_models/auralyze_bilstm_model.keras"
with open("saved_models/goemotions_labels.pkl", "rb") as f: emotion_list = pickle.load(f)
text_model = keras.models.load_model(TEXT_MODEL_PATH)

# 3. Load Vision Model
image_classifier = pipeline("zero-shot-image-classification", model="openai/clip-vit-base-patch32")
MUSIC_LABELS = ["someone playing a musical instrument", "sheet music or musical notes", "a live music concert or music studio", "song lyrics written on a page or screen", "a picture entirely unrelated to music"]

# 4. CHANGED: A highly stable, public Multilingual NLP model
print("Loading Multilingual Transformer fallback engine...")
multilingual_nlp = pipeline("text-classification", model="AnasAlokla/multilingual_go_emotions")
print("All AI Engines Online.")

# =========================================================
# HELPER FUNCTIONS
# =========================================================
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            return jsonify({}), 200
        token = None
        if 'Authorization' in request.headers:
            parts = request.headers['Authorization'].split()
            if len(parts) == 2 and parts[0] == 'Bearer': token = parts[1]
        if not token: return jsonify({'error': 'Security token is missing!'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user_email = data['email']
        except: return jsonify({'error': 'Security token is invalid or expired!'}), 401
        return f(current_user_email, *args, **kwargs)
    return decorated

def generate_expert_analysis(prompt):
    try:
        response = gemini_client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
        return response.text
    except Exception as e:
        print(f"LLM Error: {e}")
        return "* Detailed LLM analysis is currently unavailable. Please check your API key and connection."

def save_to_history(email, file_type, filename, prediction, confidence):
    if email: history_collection.insert_one({"email": email, "type": file_type, "filename": filename, "prediction": prediction, "confidence": confidence, "isFavorite": False, "date": datetime.datetime.now().strftime("%Y-%m-%d %H:%M")})

# =========================================================
# AUTH, DB, PROFILE & HISTORY ROUTES
# =========================================================
@app.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS': return jsonify({}), 200
    data = request.json
    email = data.get('email')
    if users_collection.find_one({"email": email}): return jsonify({"error": "User with this email already exists"}), 409
    users_collection.insert_one({"firstName": data.get('firstName'), "lastName": data.get('lastName'), "mobile": data.get('mobile'), "email": email, "password": bcrypt.hashpw(data.get('password').encode('utf-8'), bcrypt.gensalt())})
    return jsonify({"message": "Registered successfully!"}), 201

@app.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS': return jsonify({}), 200
    data = request.json
    user = users_collection.find_one({"email": data.get('email')})
    if user and bcrypt.checkpw(data.get('password').encode('utf-8'), user['password']):
        token = jwt.encode({'email': user['email'], 'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)}, app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({"message": "Success!", "token": token, "email": user['email']}), 200
    return jsonify({"error": "Invalid credentials!"}), 401

@app.route('/profile', methods=['GET', 'PUT', 'OPTIONS'])
@token_required
def profile(current_user_email):
    if request.method == 'GET':
        user = users_collection.find_one({"email": current_user_email}, {"_id": 0, "password": 0})
        if user: return jsonify(user), 200
        return jsonify({"error": "User not found"}), 404
    if request.method == 'PUT':
        data = request.json
        users_collection.update_one(
            {"email": current_user_email},
            {"$set": {"firstName": data.get('firstName'), "lastName": data.get('lastName'), "avatar": data.get('avatar'), "banner": data.get('banner')}}
        )
        return jsonify({"message": "Profile updated successfully!"}), 200

@app.route('/history', methods=['GET', 'OPTIONS'])
@token_required 
def get_history(current_user_email): 
    scans = list(history_collection.find({"email": current_user_email}).sort("_id", -1).limit(50))
    for scan in scans: scan['_id'] = str(scan['_id'])
    return jsonify(scans), 200

@app.route('/history/<scan_id>/favorite', methods=['PUT', 'OPTIONS'])
@token_required
def toggle_favorite(current_user_email, scan_id):
    if request.method == 'OPTIONS': return jsonify({}), 200
    try:
        scan = history_collection.find_one({"_id": ObjectId(scan_id), "email": current_user_email})
        if not scan: return jsonify({"error": "Scan not found"}), 404
        current_status = scan.get("isFavorite", False)
        history_collection.update_one({"_id": ObjectId(scan_id)}, {"$set": {"isFavorite": not current_status}})
        return jsonify({"message": "Toggled successfully", "isFavorite": not current_status}), 200
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/history/clear', methods=['DELETE', 'OPTIONS'])
@token_required
def clear_history(current_user_email):
    if request.method == 'OPTIONS': return jsonify({}), 200
    try:
        result = history_collection.delete_many({"email": current_user_email})
        return jsonify({"message": f"Successfully deleted {result.deleted_count} scans."}), 200
    except Exception as e: return jsonify({"error": str(e)}), 500

# =========================================================
# AI ROUTES
# =========================================================
@app.route('/predict_audio', methods=['POST', 'OPTIONS'])
@token_required
def predict_audio(current_user_email):
    file = request.files.get('file')
    url = request.form.get('url')
    if not file and not url: return jsonify({"error": "Please provide an audio file or a valid URL."}), 400
    temp_path = None
    filename_for_history = "Unknown Source"
    try:
        if url:
            socketio.emit('ai_status', {'message': 'Intercepting media URL...'})
            ydl_opts = {'format': 'bestaudio/best', 'outtmpl': 'temp_downloaded_audio.%(ext)s', 'quiet': True, 'noplaylist': True}
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.extract_info(url, download=True)
                filename_for_history = "URL Audio Stream"
            temp_path = glob.glob("temp_downloaded_audio.*")[0]
        else:
            socketio.emit('ai_status', {'message': 'Saving audio file securely...'})
            temp_path = "temp_audio.wav"
            filename_for_history = file.filename
            file.save(temp_path)
        
        socketio.emit('ai_status', {'message': 'Analyzing acoustic window...'})
        file_duration = librosa.get_duration(path=temp_path)
        start_time = 45.0 if file_duration > 60 else (file_duration / 4.0 if file_duration > 15 else 0)
        signal, sr = librosa.load(temp_path, sr=22050, offset=start_time, duration=min(15.0, file_duration - start_time))
        chunk_length = 3 * sr 
        predictions_list = []
        
        socketio.emit('ai_status', {'message': 'Running CRNN Model...'})
        for i in range(0, len(signal), chunk_length):
            chunk = signal[i:i + chunk_length]
            if len(chunk) < chunk_length: continue 
            mfcc = librosa.feature.mfcc(y=chunk, sr=sr, n_mfcc=13, n_fft=2048, hop_length=512).T
            expected = math.ceil((22050 * 3) / 512)
            if mfcc.shape[0] > expected: mfcc = mfcc[:expected, :]
            elif mfcc.shape[0] < expected: mfcc = np.pad(mfcc, pad_width=((0, expected - mfcc.shape[0]), (0, 0)), mode='constant')
            predictions_list.append(audio_model.predict(mfcc[np.newaxis, ..., np.newaxis], verbose=0)[0])
            
        if os.path.exists(temp_path): os.remove(temp_path)
            
        avg_preds = np.mean(predictions_list, axis=0) if len(predictions_list) > 0 else np.zeros(len(GENRES))
        predicted_index = np.argmax(avg_preds)
        conf = round(float(avg_preds[predicted_index] * 100), 2)
        result = GENRES[predicted_index].capitalize()
        
        socketio.emit('ai_status', {'message': 'Generating Structured Acoustic Report...'})
        prompt = f"You are an expert musicologist. An AI just classified an audio track named '{filename_for_history}' as '{result}' with {conf}% confidence. Write a detailed analysis formatted strictly in bullet points (using *). Cover standard frequencies/instruments, cultural context, and reasons for AI detection. Finally, include a 'Listening Recommendations' section listing 3 iconic tracks, providing a generalised YouTube search link for each (e.g., https://www.youtube.com/results?search_query=Artist+Track)."
        analysis_text = generate_expert_analysis(prompt)

        save_to_history(current_user_email, "Audio", filename_for_history, result, conf)
        return jsonify({"mood_genre": result, "confidence": conf, "analysis": analysis_text})
        
    except Exception as e: 
        if temp_path and os.path.exists(temp_path): os.remove(temp_path)
        return jsonify({"error": str(e)}), 500

# =========================================================
# THE HYBRID ROUTING LYRICS ENGINE
# =========================================================
@app.route('/predict_lyrics', methods=['POST', 'OPTIONS'])
@token_required
def predict_lyrics(current_user_email):
    if 'file' not in request.files: return jsonify({"error": "No file"}), 400
    file = request.files['file']
    
    try:
        socketio.emit('ai_status', {'message': 'Parsing raw text...'})
        raw_text = file.read().decode('utf-8')
        
        # 1. THE TRAFFIC COP: Detect Language
        socketio.emit('ai_status', {'message': 'Detecting language signature...'})
        try:
            language_code = detect(raw_text)
        except LangDetectException:
            language_code = 'en' # Fallback to English if detection fails
            
        # 2. THE HYBRID ROUTER
        if language_code == 'en':
            # ROUTE A: Use your Custom-Trained English Neural Network
            socketio.emit('ai_status', {'message': 'English detected. Running Custom BiLSTM...'})
            predictions = text_model.predict(tf.constant([raw_text]), verbose=0)
            predicted_index = np.argmax(predictions)
            result = emotion_list[predicted_index].capitalize()
            conf = round(float(predictions[0][predicted_index] * 100), 2)
            engine_used = "Custom English BiLSTM"
            
        else:
            # ROUTE B: Scalability Fallback - Use the Multilingual Hugging Face Transformer
            socketio.emit('ai_status', {'message': f'Non-English ({language_code}) detected. Routing to Multilingual NLP...'})
            
            # Robustly handle the pipeline output format
            hf_predictions = multilingual_nlp(raw_text[:512])
            if isinstance(hf_predictions, list) and isinstance(hf_predictions[0], list):
                best_pred = hf_predictions[0][0]
            elif isinstance(hf_predictions, list):
                best_pred = hf_predictions[0]
            else:
                best_pred = hf_predictions
                
            result = best_pred['label'].capitalize()
            conf = round(float(best_pred['score'] * 100), 2)
            engine_used = f"Multilingual BERT Transformer ({language_code})"

        # 3. THE LLM CULTURAL SYNTHESIS
        socketio.emit('ai_status', {'message': 'Generating Cultural Lyric Breakdown...'})
        prompt = f"""You are an expert global linguist and musicologist. An AI classified the core emotion in these lyrics as '{result}' with {conf}% confidence. 
        The AI routing engine used was: {engine_used}.
        
        Lyrics provided:
        {raw_text}
        
        Write a detailed analysis strictly using bullet points (*). 
        Identify the language natively, break down the emotional meaning of specific phrases, and explain why it evokes '{result}'. 
        End with a 'Discover Similar Moods' section listing 3 example songs that culturally match this specific language and emotion, providing a generalized YouTube search link for each."""
        
        analysis_text = generate_expert_analysis(prompt)

        save_to_history(current_user_email, "Lyrics", file.filename, result, conf)
        return jsonify({"mood_genre": result, "confidence": conf, "analysis": analysis_text})
        
    except Exception as e: 
        return jsonify({"error": str(e)}), 500

@app.route('/predict_image', methods=['POST', 'OPTIONS'])
@token_required
def predict_image(current_user_email):
    if 'file' not in request.files: return jsonify({"error": "No file"}), 400
    file = request.files['file']
    try:
        socketio.emit('ai_status', {'message': 'Running Vision Classifier...'})
        img = Image.open(file.stream)
        results = image_classifier(img, candidate_labels=MUSIC_LABELS)
        detected = results[0]['label']
        conf = round(float(results[0]['score'] * 100), 2)
        result = "No Music Elements Detected" if detected == "a picture entirely unrelated to music" else detected.capitalize()

        socketio.emit('ai_status', {'message': 'Generating Visual Composition Report...'})
        prompt = f"You are an expert music visual analyst. An AI vision model just looked at an image and classified it as: '{result}' with {conf}% confidence. Write a detailed analysis strictly using bullet points (*) explaining standard visual elements and lighting for such scenes. Also include a 'Visual Soundscapes' section listing 3 albums whose aesthetic matches this vibe, including a generalised YouTube search link for each (e.g., https://www.youtube.com/results?search_query=Artist+Album)."
        analysis_text = generate_expert_analysis(prompt)

        save_to_history(current_user_email, "Image", file.filename, result, conf)
        return jsonify({"mood_genre": result, "confidence": conf, "analysis": analysis_text})
    except Exception as e: return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    socketio.run(app, debug=True, port=5000)