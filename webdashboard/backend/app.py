from flask import Flask, jsonify, Response, request, send_from_directory
from flask_cors import CORS
from camera import camera_manager
from video_analysis import analyzer
import os
import cv2
import time

app = Flask(__name__)
CORS(app)

# --- Video Analysis Routes ---
@app.route('/upload_video', methods=['POST'])
def upload_video():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    filename = file.filename
    save_path = os.path.join(analyzer.upload_folder, filename)
    file.save(save_path)
    
    options = {
        "violence": request.form.get('violence') == 'true',
        "gender": request.form.get('gender') == 'true',
        "criminal": request.form.get('criminal') == 'true'
    }
    
    job_id = analyzer.start_analysis(filename, options)
    return jsonify({"status": "processing", "job_id": job_id})

@app.route('/analysis_status/<job_id>', methods=['GET'])
def analysis_status(job_id):
    if job_id in analyzer.active_jobs:
        return jsonify(analyzer.active_jobs[job_id])
    return jsonify({"error": "Job not found"}), 404

@app.route('/download_video/<filename>', methods=['GET'])
def download_video(filename):
    return send_from_directory(analyzer.output_folder, filename)

# --- Camera Routes ---
# --- Video Streaming ---
def generate_frames(cam_id):
    cam = camera_manager.get_camera(cam_id)
    if not cam: return
    
    # JPEG encoding params for better performance
    encode_params = [cv2.IMWRITE_JPEG_QUALITY, 70]  # Lower quality = faster streaming
    
    while True:
        frame = cam.get_frame()
        if frame is None:
            time.sleep(0.01)  # Small sleep to prevent CPU spinning
            continue
        
        ret, buffer = cv2.imencode('.jpg', frame, encode_params)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        time.sleep(0.033)  # ~30 FPS cap to reduce load

@app.route('/video_feed/<cam_id>')
def video_feed(cam_id):
    return Response(generate_frames(cam_id), mimetype='multipart/x-mixed-replace; boundary=frame')

# --- Cameras API ---
@app.route('/cameras', methods=['GET'])
def get_cameras():
    # List all active cameras
    cams = []
    for cid, cam in camera_manager.cameras.items():
        cams.append({
            "id": cid, 
            "name": cam.name, 
            "settings": cam.settings,
            "source": str(cam.source_path),
            "lat": getattr(cam, 'lat', None),
            "lng": getattr(cam, 'lng', None),
            "enabled": getattr(cam, 'enabled', True)
        })
    return jsonify(cams)

@app.route('/cameras', methods=['POST'])
def add_camera():
    data = request.json
    cam_id = f"cam_{len(camera_manager.cameras) + 1}_{int(cv2.getTickCount())}"
    source = data.get('source')
    name = data.get('name', 'New Camera')
    lat = data.get('lat')
    lng = data.get('lng')
    
    # Try to parse source as int if it's a number (webcam index)
    if str(source).isdigit():
        source = int(source)
    
    # Parse lat/lng as floats if provided
    try:
        lat = float(lat) if lat else None
        lng = float(lng) if lng else None
    except:
        lat, lng = None, None
    
    camera_manager.add_camera(cam_id, source, name, lat=lat, lng=lng)
    return jsonify({"status": "success", "id": cam_id})

@app.route('/cameras/<cam_id>', methods=['DELETE'])
def remove_camera(cam_id):
    if camera_manager.remove_camera(cam_id):
        return jsonify({"status": "success"})
    return jsonify({"error": "Camera not found"}), 404

@app.route('/cameras/<cam_id>/settings', methods=['POST'])
def update_settings(cam_id):
    data = request.json
    cam = camera_manager.get_camera(cam_id)
    if cam:
        cam.update_settings(data)
        return jsonify({"status": "success", "settings": cam.settings})
    return jsonify({"error": "Camera not found"}), 404

@app.route('/cameras/<cam_id>/enable', methods=['POST'])
def toggle_camera_enable(cam_id):
    data = request.json
    enabled = data.get('enabled', True)
    cam = camera_manager.get_camera(cam_id)
    if cam:
        cam.enabled = enabled
        return jsonify({"status": "success", "enabled": cam.enabled})
    return jsonify({"error": "Camera not found"}), 404

# --- Data API ---
@app.route('/alerts')
def get_alerts():
    return jsonify(camera_manager.alerts)

@app.route('/alerts/clear', methods=['POST'])
def clear_alerts():
    camera_manager.alerts = []
    camera_manager.stats = {"violence": 0, "criminal": 0}
    return jsonify({"status": "success", "message": "All alerts cleared"})

@app.route('/stats')
def get_stats():
    return jsonify(camera_manager.stats)

# --- Criminal DB API ---
@app.route('/criminals', methods=['GET'])
def get_criminals():
    # List files in criminal_db
    if not os.path.exists("criminal_db"): return jsonify([])
    files = [f for f in os.listdir("criminal_db") if f.lower().endswith(('.jpg', '.png'))]
    return jsonify(files)

@app.route('/criminals', methods=['POST'])
def upload_criminal():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    path = os.path.join("criminal_db", file.filename)
    file.save(path)
    # Re-trigger specific logic if needed? standard DeepFace.find might autoscan, but better to be safe.
    # DeepFace might need cache clearing or it just scans folder.
    return jsonify({"status": "success", "filename": file.filename})

if __name__ == '__main__':
    print("Starting Sangini V2 Backend on 5000...")
    app.run(host='0.0.0.0', port=5000, threaded=True, debug=False)
