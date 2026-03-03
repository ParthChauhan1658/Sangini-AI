import cv2
import os
import time
import threading
from datetime import datetime
from inference_sdk import InferenceHTTPClient

# Reusing config from camera.py (ideally config.py)
ROBOFLOW_API_URL = "http://localhost:9001/"
ROBOFLOW_API_KEY = "oHcYAEETIVuxAPoaMdBE"
VIOLENCE_MODEL_ID = "violence-detection-ydxh1/4"

class VideoAnalyzer:
    def __init__(self, upload_folder="uploads", output_folder="outputs"):
        self.upload_folder = upload_folder
        self.output_folder = output_folder
        
        if not os.path.exists(upload_folder): os.makedirs(upload_folder)
        if not os.path.exists(output_folder): os.makedirs(output_folder)
        
        self.client = InferenceHTTPClient(
            api_url=ROBOFLOW_API_URL,
            api_key=ROBOFLOW_API_KEY
        )
        self.active_jobs = {} # job_id -> status dict

    def start_analysis(self, filename, options=None):
        if options is None: options = {"violence": True, "gender": True, "face": True}
        
        job_id = f"job_{int(time.time())}"
        filepath = os.path.join(self.upload_folder, filename)
        
        self.active_jobs[job_id] = {
            "status": "processing",
            "progress": 0,
            "detections": {"violence": 0, "gender": 0, "faces": 0},
            "output_file": None
        }
        
        t = threading.Thread(target=self._process_video, args=(job_id, filepath, filename, options))
        t.start()
        return job_id

    def _process_video(self, job_id, filepath, filename, options):
        cap = cv2.VideoCapture(filepath)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames == 0: total_frames = 1
        
        output_filename = f"processed_{filename}"
        output_path = os.path.join(self.output_folder, output_filename)
        
        # Setup Writer
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
        
        frame_idx = 0
        skip_frames = 5 
        
        while True:
            ret, frame = cap.read()
            if not ret: break
            
            frame_idx += 1
            if frame_idx % 10 == 0:
                self.active_jobs[job_id]["progress"] = int((frame_idx / total_frames) * 100)
            
            if frame_idx % skip_frames == 0:
                temp_img = f"temp_analyze_{job_id}.jpg"
                cv2.imwrite(temp_img, frame)
                
                # Violence
                if options.get("violence"):
                    try:
                        res = self.client.infer(temp_img, model_id=VIOLENCE_MODEL_ID)
                        has_violence = False
                        if "predictions" in res:
                            for p in res["predictions"]:
                                if p["confidence"] > 0.6:
                                    has_violence = True
                                    x, y, w, h = p["x"], p["y"], p["width"], p["height"]
                                    x1, y1 = int(x - w / 2), int(y - h / 2)
                                    x2, y2 = int(x + w / 2), int(y + h / 2)
                                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                                    cv2.putText(frame, "VIOLENCE", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
                            
                            if has_violence:
                                self.active_jobs[job_id]["detections"]["violence"] += 1
                    except: pass

                # Gender (Placeholder / Assuming model exists or same logic)
                if options.get("gender"):
                    # Add Gender Logic Here
                    pass

                # Face (Placeholder)
                if options.get("face") or options.get("criminal"): # User said 'criminal' but technically it's deepface
                     # Add DeepFace Logic Here
                     pass
                
                if os.path.exists(temp_img): os.remove(temp_img)
            
            out.write(frame)
            
        cap.release()
        out.release()
        
        self.active_jobs[job_id]["status"] = "completed"
        self.active_jobs[job_id]["progress"] = 100
        self.active_jobs[job_id]["output_file"] = output_filename

analyzer = VideoAnalyzer()
