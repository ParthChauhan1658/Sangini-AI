import cv2
import threading
import time
import os
from deepface import DeepFace

# -------------------- CONFIG --------------------
MODEL_NAME = "ArcFace"              # HIGH ACCURACY
DETECTOR_BACKEND = "opencv"         # FASTEST + STABLE
DB_PATH = "criminal_db"             # Criminal faces folder
ALERT_THRESHOLD = 3                 # Alerts after 3 continuous matches

# Threads shared data
latest_frame = None
detected_faces = []
lock = threading.Lock()
running = True
match_counter = {}

# -------------------- AI THREAD --------------------
def ai_worker():
    global detected_faces, match_counter

    print("[AI] Loading ArcFace model...")
    DeepFace.build_model(MODEL_NAME)
    print("[AI] Model Ready.")

    while running:
        time.sleep(0.4)  # Throttle AI, avoid CPU overload

        if latest_frame is None:
            continue

        # Get a safe copy of latest frame
        with lock:
            frame = latest_frame.copy()

        # Resize for faster processing (half resolution)
        small_frame = cv2.resize(frame, (320, 240))

        try:
            # -----------------------------------------
            # STEP 1: Detect faces
            # -----------------------------------------
            faces = DeepFace.extract_faces(
                img_path=small_frame,
                detector_backend=DETECTOR_BACKEND,
                enforce_detection=False
            )

            temp_faces = []
            current_seen = set()

            for face_obj in faces:

                # Facial bounding box (relative to 320×240)
                box = face_obj["facial_area"]
                x_s, y_s, w_s, h_s = box["x"], box["y"], box["w"], box["h"]

                # Crop the face image
                face_crop = face_obj["face"]

                # -----------------------------------------
                # STEP 2: Recognition on cropped face
                # -----------------------------------------
                df_list = DeepFace.find(
                    img_path=face_crop,
                    db_path=DB_PATH,
                    model_name=MODEL_NAME,
                    detector_backend="skip",     # Already detected, so skip detector
                    distance_metric="cosine",
                    enforce_detection=False,
                    silent=True
                )

                if len(df_list) == 0 or df_list[0].empty:
                    continue

                identity_path = df_list[0].iloc[0]['identity']
                name = os.path.basename(identity_path)

                current_seen.add(name)
                match_counter[name] = match_counter.get(name, 0) + 1

                # Scale bounding box back to full resolution (640x480)
                scale_x = 640 / 320
                scale_y = 480 / 240

                x = int(x_s * scale_x)
                y = int(y_s * scale_y)
                w = int(w_s * scale_x)
                h = int(h_s * scale_y)

                temp_faces.append({
                    "box": (x, y, w, h),
                    "name": name,
                    "alert": match_counter[name] >= ALERT_THRESHOLD
                })

                if match_counter[name] == ALERT_THRESHOLD:
                    print(f"\n>>> ALERT! Criminal Detected: {name} <<<\n")

            # Reset counters for people not seen in this frame
            for p in list(match_counter.keys()):
                if p not in current_seen:
                    match_counter[p] = 0

            with lock:
                detected_faces = temp_faces

        except Exception as e:
            print("AI Error:", e)
            pass


# -------------------- MAIN VIDEO LOOP --------------------
def main():
    global latest_frame, running

    # Start AI thread
    t = threading.Thread(target=ai_worker)
    t.daemon = True
    t.start()

    cap = cv2.VideoCapture(0)
    cap.set(3, 640)
    cap.set(4, 480)

    print("[Video] Press 'q' to quit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Send frame to AI
        with lock:
            latest_frame = frame.copy()

        # Draw recognized faces
        with lock:
            faces_draw = list(detected_faces)

        for f in faces_draw:
            x, y, w, h = f['box']
            color = (0, 0, 255) if f['alert'] else (0, 255, 0)
            cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
            cv2.putText(frame, f['name'], (x, y-10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

        cv2.imshow("ARC-FACE CRIMINAL CCTV", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            running = False
            break

    cap.release()
    cv2.destroyAllWindows()


# -------------------- RUN --------------------
if __name__ == "__main__":
    main()
