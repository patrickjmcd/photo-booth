import { useState, useRef, useEffect } from "react";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";

function LivePhoto({ getData }) {
    const [imgSrc, setImgSrc] = useState("");
    const webSocket = useRef(null);

    useEffect(() => {
        const ws_path =
            // "ws://" + window.location.host + window.location.pathname + "ws";
            "ws://localhost:8000/ws";
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
        fetch("http://localhost:8000/snap", { method: "POST" });
        getData();
    };

    return (
        <div>
            <Card>
                <CardMedia
                    component="img"
                    alt="live camera view"
                    image={imgSrc}
                    title="Photo Booth"
                />
            </Card>
            <Button onClick={snap} variant="contained" color="primary">
                Snap a Pic!
            </Button>
        </div>
    );
}

export default LivePhoto;
