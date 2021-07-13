
import cv2
import time
import os
import cups
import numpy as np
import redis

from PIL import Image

r = redis.Redis(host=os.getenv('REDIS_HOST', 'localhost'))


class PhotoBooth():

    def __init__(self, file_path="/tmp/photo-booth", printer_name="MITSUBISHI_CP9550DZ", photos_per_session=4, camera=0):

        # initialize Redis values
        r.set("photoStorageLocation", file_path)
        r.set("snap", 0)
        r.set("clear", 0)
        r.set("currentCounter", 0)

        self.session_captured = []
        self.file_path = file_path
        self.printer_name = printer_name
        self.file_dpi = 200
        self.photos_per_session = photos_per_session
        self.camera = camera

        if not os.path.exists(file_path):
            os.makedirs(file_path)

        self.face_cascade = cv2.CascadeClassifier(
            'haarcascades/haarcascade_frontalface_default.xml')
        self.smile_cascade = cv2.CascadeClassifier(
            'haarcascades/haarcascade_smile.xml')

    def print_photo(self, filename):
        conn = cups.Connection()
        printers = conn.getPrinters()
        if self.printer_name in printers.keys():
            print_id = conn.printFile(self.printer_name,
                                      filename, "Photo Booth", {})
            while conn.getJobs().get(print_id, None):
                time.sleep(1)
        else:
            print("Printer {} not attached".format(self.printer_name))

    def detect(self, gray, frame):

        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), ((x + w), (y + h)), (0, 255, 255), 2)
            roi_gray = gray[y:y + h, x:x + w]
            roi_color = frame[y:y + h, x:x + w]
            smiles = self.smile_cascade.detectMultiScale(roi_gray, 2.5, 20)
            if len(smiles) == 0:
                cv2.putText(frame, 'SMILE!',
                            (x+10, y-10),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            1,
                            (255, 255, 255),
                            2)
        return frame

    def make_photo_strip(self):
        border_x = 30  # 30 px border
        border_y = 30
        margin_y = 10
        width = 540
        height = 405

        template_image = cv2.imread("Template.png")
        for i in range(0, len(self.session_captured)):
            s_img = cv2.imread(
                '{}/{}'.format(self.file_path, self.session_captured[i]))
            resized = cv2.resize(s_img, (width, height),
                                 interpolation=cv2.INTER_AREA)

            y = border_y + (margin_y + height) * i

            template_image[y:y+height,
                           border_x:border_x+width] = resized

        img_name = "strip_{}.png".format(int(time.time()))
        photo_image = cv2.hconcat([template_image, template_image])
        converted_image = cv2.cvtColor(photo_image, cv2.COLOR_BGR2RGB)
        PILimage = Image.fromarray(converted_image)
        img_file = "{}/{}".format(self.file_path, img_name)
        PILimage.save(img_file, dpi=(self.file_dpi, self.file_dpi))

        r.rpush("allStrips", img_name)
        print("{} written!".format(img_name))
        self.print_photo(img_file)

    def snap(self, frame):
        """Snap a picture and save it to disk."""
        r.set("snap", 0)
        img_name = "opencv_frame_{}.png".format(int(time.time()))
        img_file = "{}/{}".format(self.file_path, img_name)
        cv2.imwrite(img_file, frame)
        print("{} written!".format(img_name))

        self.session_captured.append(img_name)
        r.rpush("sessionCaptured", img_name)
        r.rpush("allCaptured", img_name)

        if len(self.session_captured) == self.photos_per_session:
            self.make_photo_strip()
            self.session_captured = []
            r.delete("sessionCaptured")

    def clear_current(self):
        """Clear the current photo strip from the redis database"""
        r.set("clear", 0)
        r.delete("sessionCaptured")
        self.session_captured = []

    def stream(self, frame):
        """Stream the photo through redis"""
        _, image = cv2.imencode('.jpg', frame)
        value = np.array(image).tobytes()
        r.set('image', value)
        image_id = os.urandom(4)
        r.set('image_id', image_id)

    def counter_overlay(self, frame):
        counter_stored_value = r.get("currentCounter").decode('utf-8')
        captured_length = len(self.session_captured)
        if int(counter_stored_value) != captured_length:
            r.set("currentCounter", captured_length)
        counter_text = "{}/{}".format(captured_length+1,
                                      self.photos_per_session)
        cv2.putText(frame, counter_text,
                    (10, 25),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (0, 255, 255),
                    2)
        return frame

    def capture(self):
        self.session_captured = []

        video_capture = cv2.VideoCapture(self.camera)
        while True:
            # Captures video_capture frame by frame
            _, frame = video_capture.read()
            (x, y, w, h) = (0, 0, 960, 720)
            roi = cv2.flip(frame[y:y+h, x:x+w], 1)

            k = cv2.waitKey(1)
            if k % 256 == 27:
                # ESC pressed
                print("Escape hit, closing...")
                break
            elif k % 256 == 32 or int(r.get("snap")) == 1:
                # SPACE pressed
                self.snap(roi)

            if int(r.get("clear")) == 1:
                self.clear_current()

            # capture image in monochrome
            gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
            canvas = self.detect(gray, roi)  # detect faces
            canvas = self.counter_overlay(canvas)
            self.stream(canvas)

            # Displays the result on camera feed
            cv2.imshow('Photo Booth', canvas)

        # Release the capture once all the processing is done.
        video_capture.release()
        cv2.destroyAllWindows()
