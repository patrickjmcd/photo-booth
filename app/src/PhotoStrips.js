import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import CardMedia from "@material-ui/core/CardMedia";

const reprintStrip = (filename) => {
    fetch(`${process.env.REACT_APP_API_URL}/reprint`, {
        method: "POST",
        body: JSON.stringify({ filename }),
    });
};

const PhotoStrips = ({ photos }) => {
    const photoImages = photos.map((p) => {
        return (
            <Grid item md={2} xs={12} key={p.id}>
                <Card key={p}>
                    <CardMedia
                        component="img"
                        alt="photobooth pic"
                        image={`${process.env.REACT_APP_API_URL}/images/${p}`}
                        title={p}
                    />
                    <Button
                        onClick={() => reprintStrip(p)}
                        variant="contained"
                        color="Primary"
                        style={{ marginBottom: "10px" }}
                    >
                        Re-Print
                    </Button>
                </Card>
            </Grid>
        );
    });
    return (
        <Grid container spacing={2}>
            {photoImages}
        </Grid>
    );
};

export default PhotoStrips;
