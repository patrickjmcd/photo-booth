import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SwitchCamera } from "lucide-react";

function LivePhoto({ getData }) {
    const [imgSrc, setImgSrc] = useState("");
    const [useLocalCamera, setUseLocalCamera] = useState(false);
    const [hasLocalCamera, setHasLocalCamera] = useState(false);
    const [facingMode, setFacingMode] = useState("user");
    const [showFlash, setShowFlash] = useState(false);
    const [flashKey, setFlashKey] = useState(0);
    const webSocket = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const localStream = useRef(null);

    // Detect whether this device has its own camera to offer as an option.
    useEffect(() => {
        navigator.mediaDevices
            ?.enumerateDevices()
            .then((devices) => {
                if (devices.some((d) => d.kind === "videoinput")) {
                    setHasLocalCamera(true);
                }
            })
            .catch(() => {});
    }, []);

    // Booth camera: live feed over the websocket.
    useEffect(() => {
        if (useLocalCamera) return;

        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const ws_path = `${wsProtocol}//${window.location.host}/ws`;
        webSocket.current = new WebSocket(ws_path);
        webSocket.current.onopen = () => {
            webSocket.current.send(1);
        };
        webSocket.current.onmessage = (msg) => {
            setImgSrc(`data:image/jpg;base64,${msg.data}`);
            webSocket.current.send(1);
        };
        webSocket.current.onerror = (e) => {
            console.log(e);
            webSocket.current.send(1);
        };
        return () => webSocket.current.close();
    }, [useLocalCamera]);

    // Local camera: this device's own webcam via getUserMedia.
    useEffect(() => {
        if (!useLocalCamera) return;

        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: { ideal: facingMode } } })
            .then((stream) => {
                localStream.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch((e) => {
                console.log(e);
                setUseLocalCamera(false);
            });

        return () => {
            localStream.current?.getTracks().forEach((track) => track.stop());
            localStream.current = null;
        };
    }, [useLocalCamera, facingMode]);

    const flipCamera = () => {
        setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    };

    const triggerFlash = () => {
        setFlashKey((k) => k + 1);
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 400);
    };

    const snap = () => {
        triggerFlash();
        if (useLocalCamera) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext("2d").drawImage(video, 0, 0);
            const image = canvas.toDataURL("image/png");
            fetch("/upload-snap", {
                method: "POST",
                body: JSON.stringify({ image }),
            });
        } else {
            fetch("/snap", { method: "POST" });
        }
        setTimeout(() => {
            getData();
        }, 500);
    };

    return (
        <div className="space-y-3">
            {hasLocalCamera && (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant={!useLocalCamera ? "default" : "outline"}
                        onClick={() => setUseLocalCamera(false)}
                    >
                        Booth Camera
                    </Button>
                    <Button
                        size="sm"
                        variant={useLocalCamera ? "default" : "outline"}
                        onClick={() => setUseLocalCamera(true)}
                    >
                        This Device's Camera
                    </Button>
                </div>
            )}

            {/* 4:3 matches the server's strip-crop target (360x270), so this
                preview crops the same region that ends up in the print. */}
            <Card className="relative aspect-[4/3] w-full overflow-hidden">
                {useLocalCamera ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <img
                        src={imgSrc}
                        alt="live camera view"
                        className="h-full w-full object-cover"
                    />
                )}
                {showFlash && (
                    <div
                        key={flashKey}
                        className="pointer-events-none absolute inset-0 z-10 bg-white animate-flash"
                    />
                )}
                {useLocalCamera && (
                    <Button
                        onClick={flipCamera}
                        size="icon"
                        variant="secondary"
                        className="absolute bottom-2 right-2 z-10 rounded-full opacity-90"
                        aria-label="Switch camera"
                    >
                        <SwitchCamera className="h-5 w-5" />
                    </Button>
                )}
            </Card>
            <canvas ref={canvasRef} className="hidden" />

            <Button
                onClick={snap}
                size="lg"
                className="w-full sm:w-auto h-14 sm:h-10 text-lg sm:text-sm bg-green-600 text-white hover:bg-green-700 active:scale-95 active:bg-green-800 transition-transform"
            >
                Snap a Pic!
            </Button>
        </div>
    );
}

export default LivePhoto;
