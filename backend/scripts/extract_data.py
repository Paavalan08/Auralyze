import os
import librosa
import math
import json

# 1. Define where the data is, and where we want to save the output
DATASET_PATH = r"Data\genres_original"
JSON_PATH = "data.json"

# Standard audio settings
SAMPLE_RATE = 22050 # Standard slices of sound per second
TRACK_DURATION = 30 # GTZAN tracks are 30 seconds long
SAMPLES_PER_TRACK = SAMPLE_RATE * TRACK_DURATION

def save_mfcc(dataset_path, json_path, num_segments=10, n_mfcc=13, n_fft=2048, hop_length=512):
    """
    Loops through all folders, slices songs, extracts MFCCs, and saves them.
    """
    
    # Create a dictionary to hold our data
    data = {
        "mapping": [], # This will hold the names of the genres (e.g., "blues", "pop")
        "labels": [],  # This will hold the genre target (e.g., 0 for blues, 1 for pop)
        "mfcc": []     # This will hold the actual audio math
    }

    samples_per_segment = int(SAMPLES_PER_TRACK / num_segments)
    
    # expected number of mfcc vectors per segment
    num_mfcc_vectors_per_segment = math.ceil(samples_per_segment / hop_length)

    print("Starting mass data extraction... This may take 5 to 10 minutes.")

    # 2. Loop through all the genre folders
    for i, (dirpath, dirnames, filenames) in enumerate(os.walk(dataset_path)):
        
        # Ensure we are not at the root level
        if dirpath is not dataset_path:
            
            # Save the genre label (i.e., the folder name)
            semantic_label = dirpath.split("\\")[-1] # Gets "blues" from "Data\genres_original\blues"
            data["mapping"].append(semantic_label)
            print(f"\nProcessing Folder: {semantic_label}")

            # 3. Loop through all the audio files in the current genre folder
            for f in filenames:
                file_path = os.path.join(dirpath, f)
                
                try:
                    # Load the audio file
                    signal, sample_rate = librosa.load(file_path, sr=SAMPLE_RATE)
                    
                    # 4. Slice the audio into segments
                    for d in range(num_segments):
                        start = samples_per_segment * d
                        finish = start + samples_per_segment

                        # Extract MFCCs (the math behind the spectrogram) for this slice
                        mfcc = librosa.feature.mfcc(y=signal[start:finish], 
                                                    sr=sample_rate, 
                                                    n_mfcc=n_mfcc, 
                                                    n_fft=n_fft, 
                                                    hop_length=hop_length)
                        mfcc = mfcc.T

                        # If the segment has the expected length, store it
                        if len(mfcc) == num_mfcc_vectors_per_segment:
                            data["mfcc"].append(mfcc.tolist())
                            data["labels"].append(i-1) # i-1 because the first iteration is the root folder
                            
                except Exception as e:
                    print(f"Skipping {file_path} due to error: {e}")

    # 5. Save everything into a single JSON file
    with open(json_path, "w") as fp:
        json.dump(data, fp, indent=4)
        
    print("\nExtraction complete! All data successfully saved to data.json")

# Run the function
if __name__ == "__main__":
    save_mfcc(DATASET_PATH, JSON_PATH, num_segments=10)