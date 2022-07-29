import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { NavLink } from "react-router-dom";
import control from "../../reducers";

function ImgMediaCard(props) {
  return (
    <Card>
      <CardMedia
        component="img"
        alt="Item Image"
        height="240"
        image={
          props.l.photos && props.l.photos.length
            ? props.l.photos[0].original
            : null
        }
      />
      <CardContent style={{ minHeight: "360px", maxHeight: "360px" }}>
        <Typography gutterBottom variant="h5" component="div">
          {props.l.title}
        </Typography>
        <Typography
          gutterBottom
          variant="h6"
          component="div"
          sx={{
            whiteSpace: "nowrap !important",
            overflow: "hidden !important",
            textOverflow: "ellipsis",
            flexGrow: 1,
          }}
        >
          {props.l.LocationSummary}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            maxHeight: "140px",
            //whiteSpace: "wrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flexGrow: 1,
          }}
        >
          {props.l.LocationDescription}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          onClick={() => {
            window.tempItem = props.l;
          }}
          component={NavLink}
          to={"/item/" + props.l.ItemId}
          //size="small"
          color="primary"
          fullWidth
        >
          View Full Item
        </Button>
      </CardActions>
    </Card>
  );
}

export default control(ImgMediaCard, ["item"]);
