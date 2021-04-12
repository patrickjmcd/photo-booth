import PhotoStrip from "./PhotoStrip";
import "./App.css";
import LivePhoto from "./LivePhoto";
import { useEffect, useState } from "react";
import { Grid } from "@material-ui/core";

const App = () => {
    const [sessionPhotos, setSessionPhotos] = useState([]);

    const fetchData = async () => {
        try {
            let response = await fetch("http://localhost:8000/data");
            response = await response.json();
            setSessionPhotos(response.currentCapture);
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        async function getData() {
            try {
                await fetchData();
            } catch (e) {
                console.log(e);
            }
        }
        getData();
    }, []);
    return (
        <Grid container>
            <Grid item xs={12} md={8}>
                <LivePhoto getData={fetchData} />
                <br />
            </Grid>
            <Grid item xs={12} md={4}>
                <PhotoStrip photos={sessionPhotos} />
            </Grid>
        </Grid>
    );
};

export default App;
