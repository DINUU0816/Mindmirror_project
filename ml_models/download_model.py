import urllib.request
import os

def download_model():
    # URL to a full Keras model (architecture + weights)
    # This one is a known-good model for FER2013
    url = "https://github.com/oarriaga/face_classification/raw/master/trained_models/emotion_models/fer2013_mini_XCEPTION.102-0.66.hdf5"
    save_path = os.path.join(os.path.dirname(__file__), "emotion_model.h5")

    if os.path.exists(save_path):
        print(f"Model already exists at {save_path}")
        return

    print("Downloading high-accuracy pre-trained model (~60MB)...")
    try:
        urllib.request.urlretrieve(url, save_path)
        print(f"Successfully downloaded to {save_path}")
    except Exception as e:
        print(f"Failed to download: {e}")
        print("Falling back to manual training requirement.")

if __name__ == "__main__":
    download_model()
