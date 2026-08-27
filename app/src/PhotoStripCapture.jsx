import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PhotoStripCapture = ({ photos, clearData }) => {
    const photoImages = photos.map((p) => (
        <Card key={p} className="overflow-hidden">
            <img
                src={`${import.meta.env.VITE_API_URL}/images/${p}`}
                alt="photobooth pic"
                className="w-full"
            />
        </Card>
    ));

    return (
        <div className="space-y-3">
            <Button onClick={clearData} variant="destructive">
                Clear current photo strip
            </Button>

            {photoImages}
        </div>
    );
};

export default PhotoStripCapture;
