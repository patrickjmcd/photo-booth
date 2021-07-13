import os
from photobooth import PhotoBooth


def main():
    file_path = os.getenv("PHOTOBOOTH_FILE_PATH", "/photos")
    photobooth = PhotoBooth(file_path=file_path)
    photobooth.capture()


main()
