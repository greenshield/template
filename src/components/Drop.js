import React from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { useSelector } from "react-redux";
import LinearProgress from "@mui/material/LinearProgress";
import { Container, Box, Typography, Grid, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import { set } from "../reducers";

function Basic(props) {
  const [files, setFiles] = React.useState([]);

  const [photos, setPhotos] = React.useState([]);

  const [complete, setComplete] = React.useState(false);

  var store = {
    user: useSelector((s) => s.user),
  };

  var setPreview = props.setPreview;

  var deletefile = async (_id) => {
    await axios.post("/remote/delete", {
      _id: _id,
      token: store.user.token,
    });
    reloadPhotos();
  };

  var reloadPhotos = async () => {
    var _photos = await axios.post("/remote/photos", {
      token: store.user.token,
    });
    setPhotos(_photos.data.slice());

    if (setPreview && _photos.data.length) {
      setPreview(_photos.data[0]);
    }

    if (setPreview && _photos.data.length === 0) {
      setPreview(null);
    }
  };

  const removePhoto = (_id) => {
    var temp = Object.assign({}, props.temp);
    temp.confirm = {
      title: "Delete Photos",
      cancel_text: "Close",

      load: true,
      loading_icon: <DeleteIcon />,
      confirm_text: "Yes, Delete",
      callback_color: "error",
      callback: () => {
        deletefile(_id);
      },
    };
    set("temp", temp);
  };

  React.useEffect(() => {
    var getPhotos = async () => {
      var _photos = await axios.post("/remote/photos", {
        token: store.user.token,
      });
      setPhotos(_photos.data.slice());
      if (setPreview && _photos.data.length) {
        setPreview(_photos.data[0]);
      }
    };

    getPhotos();
  }, [store.user.token, setPreview]);

  React.useEffect(() => {
    var getPhotos = async () => {
      var _photos = await axios.post("/remote/photos", {
        token: store.user.token,
      });
      setPhotos(_photos.data.slice());
      if (setPreview && _photos.data.length) {
        setPreview(_photos.data[0]);
      }
    };

    if (complete) {
      getPhotos();
    }
  }, [store.user.token, complete, setPreview]);

  var theme = useTheme();

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      //var f = files.slice();

      if (props.max && photoList.length >= props.max) {
        set("alert", {
          open: true,
          severity: "danger",
          message:
            "You can only upload one photo before your item is saved. After saving you can upload additional photos.",
        });
        return false;
      }

      var n = acceptedFiles.map((file) => {
        return file;
      });

      var _new = n;

      window.uploadCount = 0;

      setComplete(false);

      _new.forEach(async (file, i) => {
        if (!file.uploaded) {
          const formData = new FormData();

          formData.append("upload_type", "image");

          formData.append("file", file);

          formData.append("token", store.user.token);

          await axios({
            method: "POST",
            url: "/remote/dropload",
            data: formData,
            headers: {
              Accept: "application/json",
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: function (progressEvent) {
              var percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              file.percent = Math.round(percentCompleted);
              _new[i] = file;
              setFiles(_new.slice());
            },
          })
            .then((res) => {
              if (res.data && res.data.length) {
                file.uploaded = true;

                if (!window.uploadCount) {
                  window.uploadCount = 0;
                }
                window.uploadCount++;

                if (window.uploadCount === _new.length) {
                  setComplete(true);
                }
              }
            })
            .catch(function (thrown) {
              //console.log(thrown);
            });
        }
      });
      setFiles(_new);
    },
  });

  const fileList = files.map((file, i) => {
    return (
      <li key={i}>
        {!file || !file.percent ? "0" : null}
        {file?.percent?.toFixed(0)}% - {file.path} - {file.size} bytes
      </li>
    );
  });

  const photoList = photos.map((photo, i) => {
    return (
      <Grid
        container
        item
        key={i}
        sx={{
          display: "flex",
          alignContent: "center",
          alignItems: "center",
          mt: 1,
          height: "320px",
        }}
        xs={12}
        md={props.compact ? 12 : 3}
      >
        <Grid
          item
          sx={{
            display: "flex",
            alignContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "320px",
            overflow: "hidden",
            position: "relative",
            background: "url(" + photo.thumb_path + ")",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          xs={12}
        >
          <Button
            style={{
              position: "absolute",
              bottom: 0,
            }}
            fullWidth
            size="small"
            variant="contained"
            onClick={() => {
              removePhoto(photo._id);
            }}
            startIcon={<DeleteIcon />}
          >
            Remove
          </Button>
        </Grid>
      </Grid>
    );
  });

  React.useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  var sx = {};

  if (
    !window.uploadCount ||
    !fileList.length ||
    fileList.length - window.uploadCount === 0
  ) {
    sx = {
      "& .MuiLinearProgress-bar": {
        transition: "none !important",
      },
    };
  }

  if (window.uploadCount) {
    var per = (window.uploadCount / fileList.length) * 100;
  } else {
    per = 0;
  }

  return (
    <section
      style={{
        padding: "8px",
      }}
    >
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>
          {props.message
            ? props.message
            : "Drop some files here or tap to select files"}
        </p>
      </div>
      <aside>
        <h4 style={{ padding: 0, margin: 0, marginTop: "8px" }}>Files</h4>

        {fileList.length ? (
          <React.Fragment>
            <Container
              sx={{
                mt: 2,

                "& .MuiLinearProgress-root": {
                  backgroundColor:
                    theme.palette.secondary.light + " !important",
                },
                "& .MuiLinearProgress-bar": {
                  backgroundColor:
                    theme.palette[per === 100 ? "success" : "info"].main +
                    " !important",
                },
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", height: "24px" }}
              >
                {fileList.length > 0 ? (
                  <Box sx={{ width: "100%", mr: 1 }}>
                    <LinearProgress
                      sx={sx}
                      variant="determinate"
                      value={per > 0 ? per : 0}
                      key="complete"
                    />
                  </Box>
                ) : null}
                {fileList.length > 0 ? (
                  <Box sx={{ minWidth: 35 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >{`${Math.round(per)}%`}</Typography>
                  </Box>
                ) : null}
              </Box>
            </Container>

            <ul>{fileList}</ul>
          </React.Fragment>
        ) : null}

        {photoList.length ? (
          <Grid container spacing={1}>
            {photoList}
          </Grid>
        ) : (
          <Grid container>Your uploaded photos will appear here.</Grid>
        )}
      </aside>
    </section>
  );
}

<Basic />;

export default Basic;
