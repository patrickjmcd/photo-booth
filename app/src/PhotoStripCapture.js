import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import CardMedia from "@material-ui/core/CardMedia";

const PhotoStripCapture = ({ photos, clearData }) => {
    const photoImages = photos.map((p) => {
        return (
            <Grid item xs={12} key={p.id}>
                <Card key={p}>
                    <CardMedia
                        component="img"
                        alt="photobooth pic"
                        image={`${process.env.REACT_APP_API_URL}/images/${p}`}
                        title={p}
                    />
                </Card>
            </Grid>
        );
    });
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Button
                    onClick={clearData}
                    variant="contained"
                    color="secondary"
                >
                    Clear current photo strip
                </Button>
            </Grid>

            {photoImages}
        </Grid>
    );
};

export default PhotoStripCapture;
