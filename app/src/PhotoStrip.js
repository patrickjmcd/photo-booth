import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";

const PhotoStrip = ({ photos }) => {
    const photoImages = photos.map((p) => {
        return (
            <Grid item xs={12} key={p.id}>
                <Card key={p}>
                    <CardMedia
                        component="img"
                        alt="photobooth pic"
                        image={`http://localhost:8000/images/${p}`}
                        title={p}
                    />
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

export default PhotoStrip;
