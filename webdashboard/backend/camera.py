import cv2
import threading
import time
import os
import queue
from datetime import datetime
from collections import deque
from inference_sdk import InferenceHTTPClient
from deepface import DeepFace
import numpy as np

# Enable GPU acceleration if available
try:
    if cv2.cuda.getCudaEnabledDeviceCount() > 0:
        print(f"CUDA GPU detected: {cv2.cuda.getCudaEnabledDeviceCount()} device(s)")
        cv2.ocl.setUseOpenCL(True)
        USE_GPU = True
    else:
        USE_GPU = False
        print("No CUDA GPU detected, using CPU")
except:
    USE_GPU = False
    print("CUDA not available, using CPU")

# Configuration
ROBOFLOW_API_URL = "http://localhost:9001/"
ROBOFLOW_API_KEY = "oHcYAEETIVuxAPoaMdBE"
VIOLENCE_MODEL_ID = "violence-detection-ydxh1/4"
GENDER_MODEL_ID = "test-qlnza/1"
CRIMINAL_DB_PATH = "criminal_db"
CRIMINAL_MODEL_NAME = "ArcFace"
ALERT_LOG_FILE = "alert_log.txt"

# Violence Settings
VIOLENCE_CLASSES = {"knife", "weapons", "violence"}
VIOLENCE_CONF_THRESHOLD = 0.70
VIOLENCE_TIME_WINDOW = 5
VIOLENCE_MIN_ALERTS = 3

# Face Recognition Settings
FACE_ALERT_THRESHOLD = 3

# YouTube URL extraction
def get_youtube_stream_url(url):
    """Extract direct stream URL from YouTube using yt-dlp"""
    try:
        import yt_dlp
        ydl_opts = {
            'format': 'best[ext=mp4]/best',
            'quiet': True,
            'no_warnings': True
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return info.get('url', url)
    except Exception as e:
        print(f"YouTube extraction failed: {e}")
        return url

def is_youtube_url(url):
    """Check if URL is a YouTube link"""
    if isinstance(url, str):
        return 'youtube.com' in url or 'youtu.be' in url
    return False

class VideoProcessor:
    def __init__(self, source_id, source_path, name="Camera", lat=None, lng=None):
        self.id = source_id
        self.name = name
        self.lat = lat
        self.lng = lng
        
        # Handle YouTube URLs
        if is_youtube_url(source_path):
            print(f"Extracting YouTube stream for {name}...")
            self.source_path = get_youtube_stream_url(source_path)
        else:
            self.source_path = source_path # 0, "rtsp://...", "video.mp4"
        
        # Toggles - disabled by default for performance
        self.settings = {
            "violence": False,
            "gender": True,
            "face": False
        }
        self.enabled = True  # Camera enabled/disabled state

        # Initialize Capture
        self.cap = cv2.VideoCapture(self.source_path)
        
        # Clients
        self.roboflow_client = InferenceHTTPClient(
            api_url=ROBOFLOW_API_URL,
            api_key=ROBOFLOW_API_KEY
        )

        # State
        self.frame_lock = threading.Lock()
        self.latest_frame = None 
        self.running = True
        
        # Data
        self.recent_violence_detections = deque()
        self.current_roboflow_detections = [] 
        self.detected_criminals = []
        
        # Face Rec State
        self.face_lock = threading.Lock()
        self.face_match_counter = {}
        
        # Start Threads
        self.thread_processor = threading.Thread(target=self._processing_loop)
        self.thread_processor.daemon = True
        self.thread_processor.start()

        self.thread_face = threading.Thread(target=self._face_recognition_loop)
        self.thread_face.daemon = True
        self.thread_face.start()

    def update_settings(self, settings_dict):
        self.settings.update(settings_dict)

    def _face_recognition_loop(self):
        # Load Model once (globally or per thread? DeepFace models are heavy. 
        # Ideally we load globally, but for simplicity we assume model is cached/loaded)
        while self.running:
            if not self.settings["face"]:
                with self.face_lock:
                    self.detected_criminals = []
                time.sleep(1)
                continue

            time.sleep(1.0)  # Reduced frequency from 0.4s to 1s for better performance 
            
            with self.frame_lock:
                if self.latest_frame is None:
                    continue
                frame_copy = self.latest_frame.copy()

            small_frame = cv2.resize(frame_copy, (320, 240))
            
            try:
                faces = DeepFace.extract_faces(
                    img_path=small_frame,
                    detector_backend="opencv",
                    enforce_detection=False
                )
                
                temp_faces = []
                current_seen = set()

                for face_obj in faces:
                    box = face_obj["facial_area"]
                    x_s, y_s, w_s, h_s = box["x"], box["y"], box["w"], box["h"]
                    face_crop = face_obj["face"]

                    df_list = DeepFace.find(
                        img_path=face_crop,
                        db_path=CRIMINAL_DB_PATH,
                        model_name=CRIMINAL_MODEL_NAME,
                        detector_backend="skip",
                        distance_metric="cosine",
                        enforce_detection=False,
                        silent=True
                    )
                    
                    if len(df_list) > 0 and not df_list[0].empty:
                        identity_path = df_list[0].iloc[0]['identity']
                        name = os.path.basename(identity_path)
                        current_seen.add(name)
                        
                        self.face_match_counter[name] = self.face_match_counter.get(name, 0) + 1
                        
                        # Scale box (from 320x240 to 480x360)
                        scale_x = 480 / 320
                        scale_y = 360 / 240
                        x = int(x_s * scale_x)
                        y = int(y_s * scale_y)
                        w = int(w_s * scale_x)
                        h = int(h_s * scale_y)
                        
                        is_alert = self.face_match_counter[name] >= FACE_ALERT_THRESHOLD
                        
                        temp_faces.append({
                            "box": (x, y, w, h),
                            "name": name,
                            "alert": is_alert
                        })
                        
                        if self.face_match_counter[name] == FACE_ALERT_THRESHOLD:
                            # Notify Manager
                             camera_manager.add_alert(f"CRIMINAL DETECTED: {name}", "critical", self.name)

                # Reset counters
                for p in list(self.face_match_counter.keys()):
                    if p not in current_seen:
                        self.face_match_counter[p] = 0

                with self.face_lock:
                    self.detected_criminals = temp_faces

            except Exception:
                pass


    def _processing_loop(self):
        # Captures frames and runs Roboflow logic
        frame_skip = 10  # Process every 10th frame for inference (reduced for performance)
        count = 0
        target_fps = 30  # Target frame rate
        frame_time = 1.0 / target_fps
        
        while self.running:
            loop_start = time.time()
            
            # Skip processing if camera is disabled
            if not self.enabled:
                time.sleep(0.1)
                continue
                
            success, frame = self.cap.read()
            if not success:
                if isinstance(self.source_path, str):
                    self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue
                else:
                    break # Webcam fail?

            frame = cv2.resize(frame, (480, 360))
            
            with self.frame_lock:
                self.latest_frame = frame
            
            count += 1
            if count % frame_skip == 0:
                self.run_roboflow_inference(frame)
            
            # Maintain target FPS
            elapsed = time.time() - loop_start
            sleep_time = frame_time - elapsed
            if sleep_time > 0:
                time.sleep(sleep_time)
    
    def run_roboflow_inference(self, frame):
        # Use in-memory encoding instead of temp file for better performance
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        img_bytes = buffer.tobytes()
        
        # Also keep temp file as fallback (some SDK versions need file path)
        temp_file = f"temp_{self.id}.jpg"
        
        detections = []
        
        # Violence
        if self.settings["violence"]:
            try:
                # Try with bytes first, fallback to file
                try:
                    v_res = self.roboflow_client.infer(img_bytes, model_id=VIOLENCE_MODEL_ID)
                except:
                    cv2.imwrite(temp_file, frame)
                    v_res = self.roboflow_client.infer(temp_file, model_id=VIOLENCE_MODEL_ID)
                
                if "predictions" in v_res:
                    for pred in v_res["predictions"]:
                         if pred["class"] in VIOLENCE_CLASSES and pred["confidence"] >= VIOLENCE_CONF_THRESHOLD:
                             detections.append({
                                "type": "violence", "class": pred["class"], 
                                "conf": pred["confidence"], "box": (pred["x"], pred["y"], pred["width"], pred["height"])
                             })
            except Exception: pass
            
        # Gender
        if self.settings["gender"]:
            try:
                try:
                    g_res = self.roboflow_client.infer(img_bytes, model_id=GENDER_MODEL_ID)
                except:
                    cv2.imwrite(temp_file, frame)
                    g_res = self.roboflow_client.infer(temp_file, model_id=GENDER_MODEL_ID)
                
                if "predictions" in g_res:
                    for pred in g_res["predictions"]:
                        detections.append({
                            "type": "gender", "class": pred["class"],
                            "conf": pred["confidence"], "box": (pred["x"], pred["y"], pred["width"], pred["height"])
                        })
            except Exception: pass
            
        self.current_roboflow_detections = detections
        
        # --- STAGED ALERT SYSTEM ---
        now = datetime.now()
        current_hour = now.hour
        is_night = current_hour >= 18 or current_hour < 6  # 6PM to 6AM
        
        # Count genders
        male_count = sum(1 for d in detections if d["type"] == "gender" and d["class"].lower() in ["male", "man"])
        female_count = sum(1 for d in detections if d["type"] == "gender" and d["class"].lower() in ["female", "woman"])
        
        # Check violence
        violence_found = any(d["type"] == "violence" for d in detections)
        
        # Stage 1: Gender Ratio Alert (1 woman with more than 1 male)
        gender_alert = female_count == 1 and male_count > 1
        
        # Determine alert stage
        alert_stage = 0
        if gender_alert:
            alert_stage = 1
        if gender_alert and is_night:
            alert_stage = 2
        if gender_alert and is_night and violence_found:
            alert_stage = 3
        
        # Trigger staged alerts
        if alert_stage >= 1:
            stage_labels = {
                1: "Stage 1: Gender Imbalance Detected",
                2: "Stage 2: Night + Gender Imbalance",
                3: "Stage 3: CRITICAL - Violence + Night + Gender"
            }
            level = "warning" if alert_stage < 3 else "danger"
            camera_manager.add_alert(f"{stage_labels[alert_stage]} on {self.name}", level, self.name)
        
        # Original violence alert (if no staged alert triggered but violence exists)
        elif violence_found:
            self.recent_violence_detections.append(now)
            while self.recent_violence_detections and (now - self.recent_violence_detections[0]).total_seconds() > VIOLENCE_TIME_WINDOW:
                self.recent_violence_detections.popleft()
            
            if len(self.recent_violence_detections) >= VIOLENCE_MIN_ALERTS:
                 camera_manager.add_alert(f"Violence detected on {self.name}", "danger", self.name)
                 self.recent_violence_detections.clear()

    def get_frame(self):
        with self.frame_lock:
             if self.latest_frame is None: return None
             frame = self.latest_frame.copy()  # Copy needed since we draw on it
        
        # Helper for fancy box
        def draw_fancy_box(img, x, y, w, h, label, color_bgr):
             # 1. Transparent Fill
             overlay = img.copy()
             x1, y1 = int(x - w / 2), int(y - h / 2)
             x2, y2 = int(x + w / 2), int(y + h / 2)
             
             # Clamp coordinates
             x1, y1 = max(0, x1), max(0, y1)
             x2, y2 = min(img.shape[1], x2), min(img.shape[0], y2)
             
             cv2.rectangle(overlay, (x1, y1), (x2, y2), color_bgr, -1)
             alpha = 0.2
             cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0, img)
             
             # 2. Solid Border
             cv2.rectangle(img, (x1, y1), (x2, y2), color_bgr, 2)
             
             # 3. Pill Label
             (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
             cv2.rectangle(img, (x1, y1 - 25), (x1 + tw + 20, y1), color_bgr, -1)
             cv2.putText(img, label, (x1 + 10, y1 - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        # Draw Overlays
        # 1. Roboflow
        for d in self.current_roboflow_detections:
            color = (0, 0, 255) if d["type"] == "violence" else (255, 100, 0) # Red or Blue/Cyan
            label = f"{d['class']} {d['conf']:.2f}"
            draw_fancy_box(frame, d["box"][0], d["box"][1], d["box"][2], d["box"][3], label, color)

        # 2. Face
        with self.face_lock:
            for f in self.detected_criminals:
                x, y, w, h = f['box']
                # Convert top-left w/h to center x/y for helper
                cx = x + w/2
                cy = y + h/2
                color = (0, 0, 255) if f['alert'] else (0, 255, 0)
                draw_fancy_box(frame, cx, cy, w, h, f['name'], color)

        return frame

    def release(self):
        self.running = False
        self.cap.release()


CAMERAS_CONFIG_FILE = "cameras_config.json"

class CameraManager:
    def __init__(self):
        self.cameras = {} # id -> VideoProcessor
        self.alerts = []
        self.stats = {"violence": 0, "criminal": 0}
        
        # Load saved cameras from config file
        self._load_cameras()
        
        # If no cameras loaded, add default webcam
        if not self.cameras:
            self.add_camera("cam1", 0, "Main Entrance")

    def _load_cameras(self):
        """Load cameras from JSON config file"""
        import json
        if os.path.exists(CAMERAS_CONFIG_FILE):
            try:
                with open(CAMERAS_CONFIG_FILE, 'r') as f:
                    saved_cameras = json.load(f)
                for cam_data in saved_cameras:
                    cam_id = cam_data.get('id')
                    source = cam_data.get('source')
                    name = cam_data.get('name', 'Camera')
                    lat = cam_data.get('lat')
                    lng = cam_data.get('lng')
                    
                    # Parse source as int if it's a digit (webcam)
                    if str(source).isdigit():
                        source = int(source)
                    
                    self.cameras[cam_id] = VideoProcessor(cam_id, source, name, lat=lat, lng=lng)
                print(f"Loaded {len(saved_cameras)} cameras from config")
            except Exception as e:
                print(f"Failed to load cameras: {e}")

    def _save_cameras(self):
        """Save cameras to JSON config file"""
        import json
        cameras_data = []
        for cam_id, cam in self.cameras.items():
            cameras_data.append({
                'id': cam_id,
                'source': str(cam.source_path) if not isinstance(cam.source_path, int) else cam.source_path,
                'name': cam.name,
                'lat': cam.lat,
                'lng': cam.lng
            })
        try:
            with open(CAMERAS_CONFIG_FILE, 'w') as f:
                json.dump(cameras_data, f, indent=2)
        except Exception as e:
            print(f"Failed to save cameras: {e}")

    def add_camera(self, cam_id, source, name, lat=None, lng=None):
        if cam_id in self.cameras:
            return False
        self.cameras[cam_id] = VideoProcessor(cam_id, source, name, lat=lat, lng=lng)
        self._save_cameras()  # Auto-save after adding
        return True

    def remove_camera(self, cam_id):
        if cam_id in self.cameras:
            self.cameras[cam_id].release()
            del self.cameras[cam_id]
            self._save_cameras()  # Auto-save after removing
            return True
        return False

    def get_camera(self, cam_id):
        return self.cameras.get(cam_id)

    def add_alert(self, message, level, source):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.alerts.insert(0, {
            "timestamp": timestamp, "message": message, "level": level, "source": source
        })
        if len(self.alerts) > 50: self.alerts.pop()
        
        # Simple stats update
        if "Violence" in message: self.stats["violence"] += 1
        if "CRIMINAL" in message: self.stats["criminal"] += 1

# Global Singleton
camera_manager = CameraManager()
