import cv2
from inference_sdk import InferenceHTTPClient

# initialize client
CLIENT = InferenceHTTPClient(
    api_url="http://localhost:9001/",  
    api_key="oHcYAEETIVuxAPoaMdBE"
)

# open webcam (0) or video file ("video.mp4")
cap = cv2.VideoCapture("videos/test.mp4")

frame_skip = 3
frame_count = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame_count += 1
    if frame_count % frame_skip != 0:
        # skip this frame
        continue

    # resize frame before inference (smaller = faster)
    resized = cv2.resize(frame, (640, 640))

    # save frame temporarily (you can also send raw bytes for even more speed)
    cv2.imwrite("temp.jpg", resized)

    # send to Roboflow for inference
    result = CLIENT.infer("temp.jpg", model_id="test-qlnza/1")

    # draw bounding boxes
    if "predictions" in result:
        for pred in result["predictions"]:
            x, y, w, h = int(pred["x"]), int(pred["y"]), int(pred["width"]), int(pred["height"])
            class_name = pred["class"]
            conf = pred["confidence"]

            # convert from center x,y,w,h → box corners
            x1, y1 = int(x - w / 2), int(y - h / 2)
            x2, y2 = int(x + w / 2), int(y + h / 2)

            # draw rectangle
            cv2.rectangle(resized, (x1, y1), (x2, y2), (0, 255, 0), 2)

            # draw label with confidence
            label = f"{class_name} {conf:.2f}"
            cv2.putText(resized, label, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    # show frame with detections
    cv2.imshow("Live Feed", resized)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
