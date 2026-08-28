import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const reprintStrip = (filename) => {
    fetch("/reprint", {
        method: "POST",
        body: JSON.stringify({ filename }),
    });
};

const PhotoStrips = ({ photos }) => {
    const [openPhotoModal, setOpenPhotoModal] = useState(false);
    const [modalImage, setModalImage] = useState("");

    const handleOpen = (img) => {
        setOpenPhotoModal(true);
        setModalImage(img);
    };

    const photoImages = photos.map((p) => (
        <Card key={p} className="overflow-hidden">
            <img
                src={`/images/${p}`}
                alt="photobooth pic"
                className="w-full cursor-pointer"
                onClick={() => handleOpen(p)}
            />
            <Button
                onClick={() => reprintStrip(p)}
                className="m-2"
            >
                Re-Print
            </Button>
        </Card>
    ));

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                {photoImages}
            </div>
            <Dialog open={openPhotoModal} onOpenChange={setOpenPhotoModal}>
                <DialogContent>
                    <Card className="overflow-hidden">
                        <img
                            src={`/images/${modalImage}`}
                            alt="photobooth pic"
                            className="max-h-[400px] w-full object-contain"
                        />
                        <Button
                            onClick={() => reprintStrip(modalImage)}
                            className="m-2"
                        >
                            Re-Print
                        </Button>
                    </Card>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PhotoStrips;
