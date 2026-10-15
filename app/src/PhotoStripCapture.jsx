import { Button } from "@/components/ui/button";

// Must match PhotoBooth's photos_per_session default in camera/src/photobooth.py
const PHOTOS_PER_SESSION = 4;

const PhotoStripCapture = ({ photos, clearData }) => {
    const slots = Array.from({ length: PHOTOS_PER_SESSION }, (_, i) => photos[i]);

    return (
        <div className="space-y-3">
            <Button onClick={clearData} variant="destructive" className="w-full">
                Clear current photo strip
            </Button>

            <div className="mx-auto flex w-full max-w-[220px] flex-col gap-2 rounded-sm bg-white p-3 shadow-md">
                {slots.map((p, i) =>
                    p ? (
                        <div
                            key={p}
                            className="aspect-4/3 overflow-hidden rounded-sm border border-neutral-200"
                        >
                            <img
                                src={`/images/${p}`}
                                alt="photobooth pic"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ) : (
                        <div
                            key={i}
                            className="aspect-4/3 rounded-sm border border-dashed border-neutral-300 bg-neutral-50"
                        />
                    )
                )}
            </div>
        </div>
    );
};

export default PhotoStripCapture;
