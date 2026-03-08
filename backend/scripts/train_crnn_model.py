import json
import numpy as np
from sklearn.model_selection import train_test_split
import keras
from keras import layers

# 1. Define paths (Looking into saved_models since we run from the root folder)
DATA_PATH = "saved_models/data.json"
MODEL_NAME = "saved_models/auralyze_crnn_model.keras" # Using the modern .keras format!

def load_data(data_path):
    print("Loading mathematical audio data from data.json...")
    with open(data_path, "r") as fp:
        data = json.load(fp)

    X = np.array(data["mfcc"])
    y = np.array(data["labels"])
    print(f"Data successfully loaded! We have {len(X)} audio slices.")
    return X, y

def prepare_datasets(test_size, validation_size):
    X, y = load_data(DATA_PATH)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)
    X_train, X_validation, y_train, y_validation = train_test_split(X_train, y_train, test_size=validation_size, random_state=42)

    # A CRNN still expects a 3D array for the CNN part
    X_train = X_train[..., np.newaxis]
    X_validation = X_validation[..., np.newaxis]
    X_test = X_test[..., np.newaxis]

    return X_train, X_validation, X_test, y_train, y_validation, y_test

def build_crnn_model(input_shape):
    """Builds the State-of-the-Art Convolutional Recurrent Neural Network"""
    print("Building the CRNN (Convolutional + Recurrent) architecture...")
    
    # We use the Functional API here because CRNNs are complex
    inputs = keras.Input(shape=input_shape)

    # --- THE EARS (CNN Blocks) ---
    # Block 1
    x = layers.Conv2D(32, (3, 3), activation='relu', padding='same')(inputs)
    x = layers.MaxPooling2D((3, 3), strides=(2, 2), padding='same')(x)
    x = layers.BatchNormalization()(x)

    # Block 2
    x = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(x)
    x = layers.MaxPooling2D((3, 3), strides=(2, 2), padding='same')(x)
    x = layers.BatchNormalization()(x)

    # Block 3
    x = layers.Conv2D(128, (2, 2), activation='relu', padding='same')(x)
    x = layers.MaxPooling2D((2, 2), strides=(2, 2), padding='same')(x)
    x = layers.BatchNormalization()(x)

    # --- THE BRIDGE ---
    # We must reshape the data before handing it to the memory layer.
    # We flatten the frequency channels but KEEP the time steps.
    shape_before_lstm = x.shape
    # -1 means "calculate the time steps automatically", the second part is frequency * features
    x = layers.Reshape((-1, shape_before_lstm[2] * shape_before_lstm[3]))(x)

    # --- THE MEMORY (LSTM Blocks) ---
    # The LSTM tracks how the sound evolves over time
    x = layers.LSTM(64, return_sequences=True)(x)
    x = layers.LSTM(64)(x)

    # --- THE DECISION ---
    x = layers.Dense(64, activation='relu')(x)
    x = layers.Dropout(0.3)(x)
    
    # Output: 10 target genres/moods
    outputs = layers.Dense(10, activation='softmax')(x)

    model = keras.Model(inputs=inputs, outputs=outputs)
    return model

if __name__ == "__main__":
    X_train, X_validation, X_test, y_train, y_validation, y_test = prepare_datasets(0.25, 0.2)

    input_shape = (X_train.shape[1], X_train.shape[2], 1)
    model = build_crnn_model(input_shape)

    model.compile(optimizer=keras.optimizers.Adam(learning_rate=0.0001),
                  loss='sparse_categorical_crossentropy',
                  metrics=['accuracy'])

    # Early stopping ensures we don't overfit
    early_stopping = keras.callbacks.EarlyStopping(
        monitor='val_accuracy', 
        patience=5, 
        restore_best_weights=True
    )

    print("==========================================================")
    print("Starting CRNN Audio Training!")
    print("==========================================================")
    
    # We can run more epochs now because EarlyStopping protects us
    model.fit(X_train, y_train, 
              validation_data=(X_validation, y_validation), 
              batch_size=32, 
              epochs=50, 
              callbacks=[early_stopping])

    print("\nTaking the final exam on unseen data...")
    test_error, test_accuracy = model.evaluate(X_test, y_test, verbose=1)
    print(f"Absolute Level Accuracy on test set: {test_accuracy * 100:.2f}%")

    model.save(MODEL_NAME)
    print(f"Model successfully saved as {MODEL_NAME}!")