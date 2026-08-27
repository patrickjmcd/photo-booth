import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function LivePhoto({ getData }) {
    const [imgSrc, setImgSrc] = useState("");
    const webSocket = useRef(null);

    useEffect(() => {
        const ws_path = `${import.meta.env.VITE_WS_URL}/ws`;
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
    }, []);

    const snap = () => {
        fetch(`${import.meta.env.VITE_API_URL}/snap`, { method: "POST" });
        setTimeout(() => {
            getData();
        }, 500);
    };

    return (
        <div className="space-y-3">
            <Card className="overflow-hidden">
                <img
                    src={imgSrc}
                    alt="live camera view"
                    className="max-h-[600px] w-full object-cover"
                />
            </Card>
            <Button onClick={snap} size="lg">
                Snap a Pic!
            </Button>
        </div>
    );
}

export default LivePhoto;
