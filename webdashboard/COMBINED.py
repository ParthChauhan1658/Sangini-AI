import cv2
from inference_sdk import InferenceHTTPClient
from datetime import datetime, timedelta
from collections import deque

# initialize client
CLIENT = InferenceHTTPClient(
    api_url="http://localhost:9001/",  
    api_key="oHcYAEETIVuxAPoaMdBE"
)

# open webcam (0) or video file
cap = cv2.VideoCapture("videos/test.mp4")

frame_skip = 3
frame_count = 0

# --- Violence detection settings ---
alert_classes = {"knife", "weapons", "violence"}
CONF_THRESHOLD = 0.70
TIME_WINDOW = 5   # seconds 
MIN_ALERTS = 2    # if 2 or more within window → alert
recent_detections = deque()

# open log file
with open("alert_log.txt", "w", encoding="utf-8") as log_file:
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        if frame_count % frame_skip != 0:
            continue

        # resize frame before inference
        resized = cv2.resize(frame, (640, 640))
        cv2.imwrite("temp.jpg", resized)

        # --- Run violence model ---
        violence_result = CLIENT.infer("temp.jpg", model_id="violence-detection-ydxh1/4")

        violence_detections = []
        if "predictions" in violence_result and len(violence_result["predictions"]) > 0:
            for pred in violence_result["predictions"]:
                class_name = pred["class"]
                conf = pred["confidence"]

                if class_name in alert_classes and conf >= CONF_THRESHOLD:
                    violence_detections.append((class_name, conf, pred))

        # if any detection in this frame → add to queue
        if violence_detections:
            now = datetime.now()
            recent_detections.append(now)

            # remove detections older than TIME_WINDOW seconds
            while recent_detections and (now - recent_detections[0]).total_seconds() > TIME_WINDOW:
                recent_detections.popleft()

            # trigger alert if threshold reached
            if len(recent_detections) >= MIN_ALERTS:
                timestamp = now.strftime("%Y-%m-%d %H:%M:%S")
                message = f"{timestamp} ⚠️ ALERT: {len(recent_detections)} threats detected in last {TIME_WINDOW}s!"
                print(message)
                log_file.write(message + "\n")
                recent_detections.clear()

        # draw violence boxes
        for class_name, conf, pred in violence_detections:
            x, y = int(pred["x"]), int(pred["y"])
            w, h = int(pred["width"]), int(pred["height"])
            x1, y1 = int(x - w / 2), int(y - h / 2)
            x2, y2 = int(x + w / 2), int(y + h / 2)

            cv2.rectangle(resized, (x1, y1), (x2, y2), (0, 0, 255), 2)
            label = f"{class_name} {conf*100:.1f}%"
            cv2.putText(resized, label, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

        # --- Run gender model ---
        gender_result = CLIENT.infer("temp.jpg", model_id="test-qlnza/1")

        if "predictions" in gender_result:
            for pred in gender_result["predictions"]:
                x, y, w, h = int(pred["x"]), int(pred["y"]), int(pred["width"]), int(pred["height"])
                class_name = pred["class"]
                conf = pred["confidence"]

                x1, y1 = int(x - w / 2), int(y - h / 2)
                x2, y2 = int(x + w / 2), int(y + h / 2)

                cv2.rectangle(resized, (x1, y1), (x2, y2), (0, 255, 0), 2)
                label = f"{class_name} {conf:.2f}"
                cv2.putText(resized, label, (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        # show combined frame
        cv2.imshow("Violence + Gender Detection", resized)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

cap.release()
cv2.destroyAllWindows()
print("Processing finished.")
