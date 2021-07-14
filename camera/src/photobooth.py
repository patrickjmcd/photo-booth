
import cv2
import time
import cups
import numpy as np
from PIL import Image
from os import listdir, makedirs, urandom
from os.path import isfile, join, exists


class PhotoBooth():

    def __init__(self, file_path="/tmp/photo-booth", printer_name="MITSUBISHI_CP9550DZ", photos_per_session=4, camera=0):

        self.startup_time = time.time()
        self.session_captured = []
        self.file_path = file_path
        self.printer_name = printer_name
        self.file_dpi = 200
        self.photos_per_session = photos_per_session
        self.camera = camera

        if not exists(file_path):
            makedirs(file_path)

        self.face_cascade = cv2.CascadeClassifier(
            'haarcascades/haarcascade_frontalface_default.xml')
        self.smile_cascade = cv2.CascadeClassifier(
            'haarcascades/haarcascade_smile.xml')

        files_already_in_folder = [f for f in listdir(
            file_path) if isfile(join(file_path, f))]
        self.all_captured = [f for f in files_already_in_folder if f.endswith(
            ".png") and f.startswith("opencv_frame_")]
        self.all_strips = [f for f in files_already_in_folder if f.endswith(
            ".png") and f.startswith("strip_")]

        # self.backgrounds = [f for f in files_already_in_folder if f.startswith("background_")]

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

    def print_strip_by_name(self, strip_name):
        """Print a photo strip by name"""
        img_name = "{}/{}".format(self.file_path, strip_name)
        self.print_photo(img_name)
        return True

    def detect(self, gray, frame):
        f = frame.copy()

        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
        for (x, y, w, h) in faces:
            cv2.rectangle(f, (x, y), ((x + w), (y + h)), (0, 255, 255), 2)
            roi_gray = gray[y:y + h, x:x + w]
            roi_color = f[y:y + h, x:x + w]
            smiles = self.smile_cascade.detectMultiScale(roi_gray, 2.5, 20)
            if len(smiles) == 0:
                cv2.putText(f, 'SMILE!',
                            (x+10, y-10),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            1,
                            (255, 255, 255),
                            2)
        return f

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

        self.all_strips.append(img_name)
        print("{} written!".format(img_name))
        self.print_photo(img_file)

    def snap(self):
        """Snap a picture and save it to disk."""
        img_name = "opencv_frame_{}.png".format(int(time.time()))
        img_file = "{}/{}".format(self.file_path, img_name)
        cv2.imwrite(img_file, self.frame)
        print("{} written!".format(img_name))

        self.session_captured.append(img_name)
        self.all_captured.append(img_name)

        if len(self.session_captured) == self.photos_per_session:
            self.make_photo_strip()
            self.session_captured = []

    def clear_current(self):
        """Clear the current photo strip from the redis database"""
        self.session_captured = []

    def stream(self, frame):
        """Stream the photo through redis"""
        _, image = cv2.imencode('.jpg', frame)
        self.live_image = np.array(image).tobytes()
        self.live_image_id = urandom(4)

    def counter_overlay(self, frame):
        captured_length = len(self.session_captured)
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
            video_ok, this_frame = video_capture.read()
            if video_ok:
                (x, y, w, h) = (0, 0, 960, 720)
                self.frame = cv2.flip(this_frame[y:y+h, x:x+w], 1)

                k = cv2.waitKey(1)
                if k % 256 == 27:
                    # ESC pressed
                    print("Escape hit, closing...")
                    break
                elif k % 256 == 32:
                    # SPACE pressed
                    self.snap()

                # capture image in monochrome
                gray = cv2.cvtColor(self.frame, cv2.COLOR_BGR2GRAY)
                canvas = self.detect(gray, self.frame)  # detect faces
                self.stream(canvas)

                # Displays the result on camera feed
                # cv2.imshow('Photo Booth', canvas)
            else:
                print("camera not ready")
        # Release the capture once all the processing is done.
        video_capture.release()
        cv2.destroyAllWindows()
