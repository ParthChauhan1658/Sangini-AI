import cv2
import yt_dlp
from inference_sdk import InferenceHTTPClient
from datetime import datetime
from collections import deque


yt_url = "https://www.youtube.com/watch?v=qHW8srS0ylo"

ydl_opts = {"format": "best"}
with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    info_dict = ydl.extract_info(yt_url, download=False)
    stream_url = info_dict["url"]

print("Stream URL:", stream_url)

# --- Step 2: Init client ---
CLIENT = InferenceHTTPClient(
    api_url="http://localhost:9001/",
    api_key="oHcYAEETIVuxAPoaMdBE"
)

# --- Step 3: Open stream ---
cap = cv2.VideoCapture(stream_url)

# ⚡ Keep only the latest frame to avoid lag
cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

frame_skip = 5   # skip frames to stay real-time
frame_count = 0


# Violence detection params
alert_classes = {"knife", "weapons", "violence"}
CONF_THRESHOLD = 0.90
TIME_WINDOW = 5     # seconds
MIN_ALERTS = 2
recent_detections = deque()

# --- Step 4: Processing loop ---
while True:
    ret, frame = cap.read()
    if not ret:
        print("Stream ended or connection lost.")
        break

    frame_count += 1
    if frame_count % frame_skip != 0:
        continue

    # Smaller resize → faster inference
    resized = cv2.resize(frame, (320, 320))
    cv2.imwrite("temp.jpg", resized)

    # --- Violence model ---
    violence_result = CLIENT.infer("temp.jpg", model_id="violence-detection-ydxh1/4")
    violence_detections = []

    if "predictions" in violence_result:
        for pred in violence_result["predictions"]:
            class_name = pred["class"]
            conf = pred["confidence"]
            if class_name in alert_classes and conf >= CONF_THRESHOLD:
                violence_detections.append((class_name, conf, pred))

    if violence_detections:
        now = datetime.now()
        recent_detections.append(now)
        while recent_detections and (now - recent_detections[0]).total_seconds() > TIME_WINDOW:
            recent_detections.popleft()

        if len(recent_detections) >= MIN_ALERTS:
            timestamp = now.strftime("%Y-%m-%d %H:%M:%S")
            print(f"{timestamp} ⚠️ ALERT: {len(recent_detections)} threats detected!")
            recent_detections.clear()

    for class_name, conf, pred in violence_detections:
        x, y = int(pred["x"]), int(pred["y"])
        w, h = int(pred["width"]), int(pred["height"])
        x1, y1 = int(x - w / 2), int(y - h / 2)
        x2, y2 = int(x + w / 2), int(y + h / 2)
        cv2.rectangle(resized, (x1, y1), (x2, y2), (0, 0, 255), 2)
        cv2.putText(resized, f"{class_name} {conf*100:.1f}%", (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

    # --- Gender model ---
    GENDER_CONF_THRESHOLD = 0.70  # 👈 threshold for gender detection

    gender_result = CLIENT.infer("temp.jpg", model_id="test-qlnza/1")
    if "predictions" in gender_result:
        for pred in gender_result["predictions"]:
            class_name = pred["class"]
            conf = pred["confidence"]

            if conf < GENDER_CONF_THRESHOLD:   # 👈 skip low confidence results
                continue

            x, y, w, h = int(pred["x"]), int(pred["y"]), int(pred["width"]), int(pred["height"])
            x1, y1 = int(x - w / 2), int(y - h / 2)
            x2, y2 = int(x + w / 2), int(y + h / 2)

            cv2.rectangle(resized, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(resized, f"{class_name} {conf:.2f}", (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    # --- Show live ---
    cv2.imshow("YT Live - Violence + Gender Detection", resized)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
