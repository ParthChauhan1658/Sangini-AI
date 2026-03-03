import cv2
from inference_sdk import InferenceHTTPClient
from datetime import datetime, timedelta
from collections import deque

# initialize client
CLIENT = InferenceHTTPClient(
    api_url="http://localhost:9001/",  # local inference server
    api_key="oHcYAEETIVuxAPoaMdBE"
)

# open webcam (0) or video file
cap = cv2.VideoCapture("videos/test.mp4")

frame_skip = 3
frame_count = 0

# classes we care about
alert_classes = {"knife", "weapons", "violence"}

# thresholds
CONF_THRESHOLD = 0.70
TIME_WINDOW = 5   # seconds
MIN_ALERTS = 2    # if 2 or more within window → alert

# store recent detections (timestamps)

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

        # resize frame for faster inference
        resized = cv2.resize(frame, (640, 640))
        cv2.imwrite("temp.jpg", resized)

        # inference
        result = CLIENT.infer("temp.jpg", model_id="violence-detection-ydxh1/4")

        detections = []
        if "predictions" in result and len(result["predictions"]) > 0:
            for pred in result["predictions"]:
                class_name = pred["class"]
                conf = pred["confidence"]

                if class_name in alert_classes and conf >= CONF_THRESHOLD:
                    detections.append((class_name, conf, pred))

        # if any detection in this frame → log timestamp
        if detections:
            now = datetime.now()
            recent_detections.append(now)

            # remove detections older than TIME_WINDOW seconds
            while recent_detections and (now - recent_detections[0]).total_seconds() > TIME_WINDOW:
                recent_detections.popleft()

            # check if enough detections happened in window
            if len(recent_detections) >= MIN_ALERTS:
                timestamp = now.strftime("%Y-%m-%d %H:%M:%S")
                message = f"{timestamp} ⚠️ ALERT: {len(recent_detections)} threats detected in last {TIME_WINDOW}s!"
                print(message)
                log_file.write(message + "\n")

                # clear to avoid repeated alerts for same window
                recent_detections.clear()

        # draw bounding boxes
        for class_name, conf, pred in detections:
            x, y = int(pred["x"]), int(pred["y"])
            w, h = int(pred["width"]), int(pred["height"])
            x1, y1 = int(x - w / 2), int(y - h / 2)
            x2, y2 = int(x + w / 2), int(y + h / 2)

            cv2.rectangle(resized, (x1, y1), (x2, y2), (0, 0, 255), 2)
            label = f"{class_name} {conf*100:.1f}%"
            cv2.putText(resized, label, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

        # show frame
        cv2.imshow("Violence Detection", resized)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

cap.release()
cv2.destroyAllWindows()
print("Processing finished.")
