# This script will detect faces via your webcam.
# Tested with OpenCV3

import cv2
import time

face_cascade = cv2.CascadeClassifier(
    'haarcascades/haarcascade_frontalface_default.xml')
eye_cascade = cv2.CascadeClassifier('haarcascades/haarcascade_eye.xml')
smile_cascade = cv2.CascadeClassifier('haarcascades/haarcascade_smile.xml')


def detect(gray, frame):
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    for (x, y, w, h) in faces:
        cv2.rectangle(frame, (x, y), ((x + w), (y + h)), (255, 0, 0), 2)
        roi_gray = gray[y:y + h, x:x + w]
        roi_color = frame[y:y + h, x:x + w]
        smiles = smile_cascade.detectMultiScale(roi_gray, 2.5, 20)
        if len(smiles) == 0:
            cv2.putText(frame, 'SMILE, YOU SOURPUSS!',
                        (x+10, y-10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1,
                        (255, 255, 255),
                        2)
        for (sx, sy, sw, sh) in smiles:
            cv2.rectangle(roi_color, (sx, sy),
                          ((sx + sw), (sy + sh)), (0, 0, 255), 2)

    return frame


video_capture = cv2.VideoCapture(0)
while True:
   # Captures video_capture frame by frame
    _, frame = video_capture.read()
    (x, y, w, h) = (10, 10, 980, 980)
    roi = cv2.flip(frame[y:y+h, x:x+w], 1)

    k = cv2.waitKey(1)
    if k % 256 == 27:
        # ESC pressed
        print("Escape hit, closing...")
        break
    elif k % 256 == 32:
        # SPACE pressed
        img_name = "opencv_frame_{}.png".format(int(time.time()))
        cv2.imwrite(img_name, roi)
        print("{} written!".format(img_name))

    # To capture image in monochrome
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)

    # calls the detect() function
    canvas = detect(gray, roi)

    # Displays the result on camera feed
    cv2.imshow('Photo Booth', canvas)


# Release the capture once all the processing is done.
video_capture.release()
cv2.destroyAllWindows()
