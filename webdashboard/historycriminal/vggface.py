import cv2
import threading
import time
import copy
import os

# --- AUTO INSTALLER ---
try:
    from deepface import DeepFace
except ImportError:
    print("Installing libraries...")
    os.system("pip install deepface tf-keras opencv-python")
    from deepface import DeepFace

# --- CONFIGURATION (LOW SPEC MODE) ---
# "VGG-Face" is often faster/lighter than FaceNet512 on CPUs.
# If you still have issues, change this to "SFace" (requires opencv-contrib-python)
MODEL_NAME = "VGG-Face" 
DETECTOR_BACKEND = "opencv" 
DB_PATH = "criminal_db"
ALERT_THRESHOLD = 3

# --- SHARED VARIABLES ---
latest_frame = None
detected_faces = []
lock = threading.Lock()
running = True
match_counter = {}

def ai_worker():
    """
    Background thread that runs recognition only once every 0.5 seconds
    so your laptop doesn't freeze.
    """
    global detected_faces, match_counter
    
    # Warmup
    print("[AI] Warming up model...")
    try:
        DeepFace.build_model(MODEL_NAME)
    except:
        pass
    print("[AI] Ready.")

    while running:
        # 1. Throttle the AI (Crucial for lag prevention)
        time.sleep(0.5) 

        if latest_frame is None:
            continue

        with lock:
            # Process a tiny copy of the image (320px width)
            # This makes recognition 4x-10x faster
            small_frame = cv2.resize(latest_frame, (320, 240))

        try:
            # Run DeepFace on the TINY frame
            dfs = DeepFace.find(img_path=small_frame, 
                              db_path=DB_PATH, 
                              model_name=MODEL_NAME, 
                              detector_backend=DETECTOR_BACKEND,
                              distance_metric="cosine",
                              enforce_detection=False,
                              silent=True)
            
            temp_faces = []
            current_seen = set()

            if len(dfs) > 0:
                for df in dfs:
                    if not df.empty:
                        # Get coordinates relative to the SMALL frame
                        x_small = int(df.iloc[0]['source_x'])
                        y_small = int(df.iloc[0]['source_y'])
                        w_small = int(df.iloc[0]['source_w'])
                        h_small = int(df.iloc[0]['source_h'])
                        
                        # Scale coordinates back up to normal size (multiply by ~2)
                        # Since we resized 640 -> 320, we multiply by 2
                        scale_x = 640 / 320
                        scale_y = 480 / 240
                        
                        x = int(x_small * scale_x)
                        y = int(y_small * scale_y)
                        w = int(w_small * scale_x)
                        h = int(h_small * scale_y)

                        path = df.iloc[0]['identity']
                        name = path.split("/")[-1].split("\\")[-1]

                        current_seen.add(name)
                        match_counter[name] = match_counter.get(name, 0) + 1
                        
                        temp_faces.append({
                            "box": (x, y, w, h),
                            "name": name,
                            "alert": match_counter[name] >= ALERT_THRESHOLD
                        })
                        
                        # Print alert to console immediately
                        if match_counter[name] >= ALERT_THRESHOLD:
                            print(f"\n>>> ALERT: {name} DETECTED! <<<\n")

            # Reset missing people
            for p in list(match_counter.keys()):
                if p not in current_seen:
                    match_counter[p] = 0

            with lock:
                detected_faces = temp_faces

        except Exception:
            pass

def main():
    global latest_frame, running
    
    # Start AI in background
    t = threading.Thread(target=ai_worker)
    t.daemon = True
    t.start()

    # Setup Camera
    cap = cv2.VideoCapture(0)
    # Force standard resolution
    cap.set(3, 640) 
    cap.set(4, 480)

    print("[Video] Starting feed... Press 'q' to exit.")

    while True:
        ret, frame = cap.read()
        if not ret: break

        # Send frame to AI
        with lock:
            latest_frame = frame.copy()

        # Draw boxes (matches will lag slightly behind video, but video is smooth)
        with lock:
            # We use a local copy so we don't block
            faces_to_draw = list(detected_faces)

        for face in faces_to_draw:
            x, y, w, h = face['box']
            color = (0, 0, 255) if face['alert'] else (0, 255, 0)
            cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
            cv2.putText(frame, face['name'], (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

        cv2.imshow("Ultra Fast CCTV", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            running = False
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()