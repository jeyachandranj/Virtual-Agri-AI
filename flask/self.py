from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from werkzeug.utils import secure_filename
import os

# Initialize Flask app
app = Flask(__name__)

# Load the trained model
model = tf.keras.models.load_model("vgg16_shelf_life_model.h5")

# Define the upload folder
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Define class labels
class_labels = [
    "Apple(1-5)", "Apple(5-10)", "Apple(10-14)",
    "Banana(1-5)", "Banana(5-10)", "Banana(10-15)", "Banana(15-20)",
    "Carrot(1-2)", "Carrot(3-4)", "Carrot(5-6)", "Expired",
    "Tomato(1-5)", "Tomato(5-10)", "Tomato(10-15)"
]

# Function to preprocess the image
def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0  # Normalize
    return img_array

# Define the prediction route
@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    # Preprocess the image
    img_array = preprocess_image(filepath)

    # Perform prediction
    prediction = model.predict(img_array)
    predicted_index = np.argmax(prediction, axis=1)[0]
    predicted_class = class_labels[predicted_index]

    return jsonify({"predicted_class": predicted_class})

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)