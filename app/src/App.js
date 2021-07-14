import PhotoStripCapture from "./PhotoStripCapture";
import "./App.css";
import LivePhoto from "./LivePhoto";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import PhotoStrips from "./PhotoStrips";

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

const App = () => {
    const [sessionPhotos, setSessionPhotos] = useState([]);
    const [photoStrips, setPhotoStrips] = useState([]);
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const fetchData = async () => {
        try {
            let response = await fetch(`${process.env.REACT_APP_API_URL}/data`);
            response = await response.json();
            setSessionPhotos(response.currentCapture);
            setPhotoStrips(response.allStrips);
        } catch (e) {
            console.log(e);
        }
    };

    const clearCapture = async () => {
        try {
            fetch(`${process.env.REACT_APP_API_URL}/clear`, { method: "POST" });
            setTimeout(() => {
                fetchData();
            }, 500);
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
        <div className="App">
            <AppBar position="static">
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="simple tabs example"
                >
                    <Tab label="Take Photos" />
                    <Tab label="View Photo Strips" />
                </Tabs>
            </AppBar>
            <TabPanel value={tabValue} index={0}>
                <Grid container spacing={2}>
                    <Grid item md={10} xs={12}>
                        <LivePhoto getData={fetchData} />
                        <br />
                    </Grid>
                    <Box display={{ xs: "block", sm: "none" }}>
                        <Divider variant="middle" />
                    </Box>

                    <Grid item md={2} xs={12}>
                        <PhotoStripCapture
                            photos={sessionPhotos}
                            clearData={clearCapture}
                        />
                    </Grid>
                </Grid>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <PhotoStrips photos={photoStrips} />
            </TabPanel>
        </div>
    );
};

export default App;
