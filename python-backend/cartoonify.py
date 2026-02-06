"""
Simple Cartoon/Caricature Generator using OpenCV
No external AI APIs needed - runs 100% locally
"""

import cv2
import numpy as np
from PIL import Image
import io
import base64

def cartoonify_image(image_path, output_path=None):
    """
    Convert a photo to cartoon/caricature style

    Args:
        image_path: Path to input image or base64 string
        output_path: Optional output path

    Returns:
        Cartoonified image (PIL Image or saved file)
    """

    # Read image
    if isinstance(image_path, str) and image_path.startswith('data:image'):
        # Handle base64 input
        image_data = base64.b64decode(image_path.split(',')[1])
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    else:
        img = cv2.imread(image_path)

    # Resize for faster processing
    height, width = img.shape[:2]
    max_dim = 800
    if max(height, width) > max_dim:
        scale = max_dim / max(height, width)
        img = cv2.resize(img, (int(width * scale), int(height * scale)))

    # Step 1: Edge detection
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray_blur = cv2.medianBlur(gray, 5)
    edges = cv2.adaptiveThreshold(
        gray_blur, 255,
        cv2.ADAPTIVE_THRESH_MEAN_C,
        cv2.THRESH_BINARY,
        blockSize=9,
        C=9
    )

    # Step 2: Bilateral filter for color smoothing (cartoon effect)
    color = cv2.bilateralFilter(img, d=9, sigmaColor=300, sigmaSpace=300)

    # Step 3: Combine edges with smoothed color
    cartoon = cv2.bitwise_and(color, color, mask=edges)

    # Optional: Enhance colors
    hsv = cv2.cvtColor(cartoon, cv2.COLOR_BGR2HSV)
    hsv[:, :, 1] = hsv[:, :, 1] * 1.2  # Increase saturation
    cartoon = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)

    if output_path:
        cv2.imwrite(output_path, cartoon)
        return output_path

    # Convert to PIL Image
    cartoon_rgb = cv2.cvtColor(cartoon, cv2.COLOR_BGR2RGB)
    return Image.fromarray(cartoon_rgb)


def create_caricature_advanced(image_path, exaggeration=1.5):
    """
    More advanced caricature with face detection and feature exaggeration

    Args:
        image_path: Path to input image
        exaggeration: How much to exaggerate features (1.0 = normal, 2.0 = very exaggerated)
    """

    img = cv2.imread(image_path)

    # Load face detector
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    for (x, y, w, h) in faces:
        # Get face region
        face = img[y:y+h, x:x+w]

        # Exaggerate features using warping
        center = (w // 2, h // 2)
        radius = min(w, h) // 2

        # Create distortion map (bulge effect for caricature)
        map_x = np.zeros((h, w), dtype=np.float32)
        map_y = np.zeros((h, w), dtype=np.float32)

        for i in range(h):
            for j in range(w):
                dx = j - center[0]
                dy = i - center[1]
                distance = np.sqrt(dx**2 + dy**2)

                if distance < radius:
                    # Bulge distortion
                    factor = 1 + (exaggeration - 1) * (1 - distance / radius)
                    map_x[i, j] = center[0] + dx * factor
                    map_y[i, j] = center[1] + dy * factor
                else:
                    map_x[i, j] = j
                    map_y[i, j] = i

        # Apply distortion
        distorted = cv2.remap(face, map_x, map_y, cv2.INTER_LINEAR)
        img[y:y+h, x:x+w] = distorted

    # Apply cartoon effect to the whole image
    cartoon = cartoonify_image_cv2(img)

    return cartoon


def cartoonify_image_cv2(img):
    """Helper function to apply cartoon effect to cv2 image"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray_blur = cv2.medianBlur(gray, 5)
    edges = cv2.adaptiveThreshold(gray_blur, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 9)
    color = cv2.bilateralFilter(img, 9, 300, 300)
    cartoon = cv2.bitwise_and(color, color, mask=edges)
    return cartoon


# Flask API endpoint (optional)
if __name__ == '__main__':
    from flask import Flask, request, jsonify, send_file
    from flask_cors import CORS
    import tempfile

    app = Flask(__name__)
    CORS(app)  # Enable CORS for Next.js frontend

    @app.route('/api/cartoonify', methods=['POST'])
    def api_cartoonify():
        """
        API endpoint to cartoonify an uploaded image

        Usage:
            POST /api/cartoonify
            Body: { "image": "base64_string" } or multipart file upload

        Returns:
            Cartoonified image as base64 or file
        """

        try:
            if 'file' in request.files:
                file = request.files['file']
                temp_input = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
                file.save(temp_input.name)
                input_path = temp_input.name
            elif request.json and 'image' in request.json:
                input_path = request.json['image']
            else:
                return jsonify({'error': 'No image provided'}), 400

            # Process image
            exaggeration = float(request.form.get('exaggeration', 1.3)) if 'exaggeration' in request.form else 1.3

            # Generate cartoon
            cartoon_img = cartoonify_image(input_path)

            # Convert to base64
            buffer = io.BytesIO()
            cartoon_img.save(buffer, format='PNG')
            buffer.seek(0)
            img_base64 = base64.b64encode(buffer.getvalue()).decode()

            return jsonify({
                'success': True,
                'image': f'data:image/png;base64,{img_base64}'
            })

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok', 'service': 'cartoonify-api'})

    print("🎨 Cartoon API Server starting...")
    print("📍 Endpoint: http://localhost:5000/api/cartoonify")
    app.run(host='0.0.0.0', port=5000, debug=True)
