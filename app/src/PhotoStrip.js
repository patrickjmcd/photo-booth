import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";

const PhotoStrip = ({ photos }) => {
    const photoImages = photos.map((p) => {
        return (
            <Card key={p}>
                <CardMedia
                    component="img"
                    alt="photobooth pic"
                    image={`http://localhost:8000/images/${p}`}
                    title={p}
                />
            </Card>
        );
    });
    return <div>{photoImages}</div>;
};

export default PhotoStrip;
