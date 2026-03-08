import tensorflow as tf
import keras
from keras import layers
from datasets import load_dataset
import pickle

# 1. Define paths 
MODEL_NAME = "saved_models/auralyze_bilstm_model.keras"
ENCODER_NAME = "saved_models/goemotions_labels.pkl"

# THE FIX: This function removes emojis and weird characters so Windows can save the file safely
def clean_text(text_list):
    return [str(t).encode('ascii', 'ignore').decode('utf-8') for t in text_list]

def train_advanced_lyrics_model():
    print("Downloading the state-of-the-art GoEmotions dataset from Google...")
    
    dataset = load_dataset("go_emotions", "simplified")

    emotion_names = dataset['train'].features['labels'].feature.names

    print(f"Dataset loaded! We now have {len(emotion_names)} distinct emotions.")

    with open(ENCODER_NAME, "wb") as f:
        pickle.dump(emotion_names, f)

    # 3. Extract and CLEAN Data 
    print("Sanitizing text to remove emojis...")
    X_train = clean_text(dataset['train']['text'])
    y_train = [labels[0] for labels in dataset['train']['labels']]

    X_val = clean_text(dataset['validation']['text'])
    y_val = [labels[0] for labels in dataset['validation']['labels']]

    print("Converting text into TensorFlow Tensors...")
    X_train_tf = tf.constant(X_train)
    X_val_tf = tf.constant(X_val)
    y_train_tf = tf.constant(y_train)
    y_val_tf = tf.constant(y_val)

    max_vocab_length = 15000  
    max_sequence_length = 100

    vectorize_layer = layers.TextVectorization(
        max_tokens=max_vocab_length,
        output_mode='int',
        output_sequence_length=max_sequence_length
    )

    print("Building the vocabulary dictionary. This might take a moment...")
    vectorize_layer.adapt(X_train_tf)

    print("Building the Bidirectional LSTM architecture...")
    model = keras.Sequential([
        keras.Input(shape=(1,), dtype=tf.string),
        vectorize_layer,
        
        layers.Embedding(input_dim=max_vocab_length, output_dim=128),
        layers.Bidirectional(layers.LSTM(64, return_sequences=True)),
        layers.Bidirectional(layers.LSTM(32)),

        layers.Dense(64, activation='relu'),
        layers.Dropout(0.4), 

        layers.Dense(len(emotion_names), activation='softmax')
    ])

    # Let's add an Early Stopping mechanism to stop training when the validation loss starts rising
    early_stopping = keras.callbacks.EarlyStopping(
        monitor='val_loss', 
        patience=2, 
        restore_best_weights=True
    )

    model.compile(optimizer='adam',
                  loss='sparse_categorical_crossentropy',
                  metrics=['accuracy'])

    print("==========================================================")
    print("Starting training!")
    print("==========================================================")
    
    model.fit(X_train_tf, y_train_tf,
              validation_data=(X_val_tf, y_val_tf),
              epochs=6, 
              batch_size=64,
              callbacks=[early_stopping]) # This ensures we keep the best epoch!

    # 8. Save
    model.save(MODEL_NAME)
    print(f"\nSuccess! Absolute Level NLP model saved as {MODEL_NAME}!")

if __name__ == "__main__":
    train_advanced_lyrics_model()