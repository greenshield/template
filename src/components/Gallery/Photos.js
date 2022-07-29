import * as React from "react";
import "../../../node_modules/react-image-gallery/styles/css/image-gallery.css";
import ImageGallery from "react-image-gallery";
import control from "../../reducers";
import Grid from "@mui/material/Grid";

function generateURL(img, thumb, isMobile) {
  return {
    original: img,
    thumbnail: thumb,
    originalWidth: "1920px",
    thumbnailHeight: "56px",
    loading: "eager",
    thumbnailLoading: "eager",
  };
}

function Gallery(props) {
  const [images, setImages] = React.useState([]);

  const item = props.item;

  const isMobile = props.hooks.isMobile;

  React.useEffect(() => {
    if (item) {
      var images = item.photos ? item.photos : [];

      var files = [];

      for (var i = 0; i < images.length; i++) {
        var imageURL = generateURL(
          images[i].original,
          images[i].thumbnail,
          isMobile
        );
        files.push(imageURL);
      }

      setImages(files);
    }
  }, [item, isMobile]);

  var mh = props.hooks.isXs
    ? "320px"
    : props.hooks.isXl
    ? "520px"
    : props.hooks.isLg
    ? "320px"
    : !props.hooks.set
    ? "520px"
    : "240px";

  return (
    <Grid
      sx={{
        "& .image-gallery-slides": {
          maxHeight: props.hooks.isMobile ? "320px" : "500px",
          minHeight: mh,
        },
        "& .fullscreen .image-gallery-slides": {
          maxHeight: props.hooks.isMobile
            ? "none !important"
            : "none !important",
          minHeight: props.hooks.isMobile
            ? "none !important"
            : "none !important",
        },
      }}
    >
      <ImageGallery
        lazyLoad={false}
        slideDuration={0}
        thumbnailPosition="bottom"
        items={images}
        additionalClass="photo-gallery"
        showPlayButton={false}
      />
    </Grid>
  );
}

export default control(Gallery, ["theme", "menu", "temp", "item", "hooks"]);
