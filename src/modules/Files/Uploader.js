import React, { useState } from "react";

import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";

import axios from "axios";
import { Container, Box, Typography } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import useTheme from "@mui/styles/useTheme";

registerPlugin(FilePondPluginImageExifOrientation);

function Uploader(props) {
  var theme = useTheme();

  const [files, setFiles] = React.useState([]);

  const [info, setInfo] = useState({
    total: 0,
    complete: 0,
    incomplete: 0,
    uploading: 0,
  });
  var per = (info.complete / info.total) * 100;

  /*
  const [preFiles, setPrefiles] = useState([
    {
      source: "http://localhost:4000/file/1b434560bf70638a186c_23tpftFIAD0.jpg",
      options: {
        type: "local",
        file: {
          name: "1b434560bf70638a186c_23tpftFIAD0.jpg",
          size: "559858",
          type: "image/jpg",
        },
      },
    },
  ]);
  */

  var pond = React.useRef();

  /*
  function isLoadingCheck() {
    var isLoading =
      pond.current?.getFiles().filter((x) => x.status !== 5).length !== 0;

    return isLoading;
  }
*/

  const server = {
    url: "/remote",
    revert: (files) => {
      axios
        .post("/remote/remove", { files: JSON.parse(files) })
        .then((result) => {});
    },
    process: {
      url: "/upload",
    },
    fetch: (url, load, error, progress, abort, headers) => {
      error("oh my goodness");

      progress(true, 0, 1024);

      load(url);

      return {
        abort: () => {
          abort();
        },
      };
    },
  };

  var sx = {};

  if (info.total - info.complete === 0) {
    sx = {
      "& .MuiLinearProgress-bar": {
        transition: "none !important",
      },
    };
  }

  var label = `<div>Drag & Drop your files or <span class="filepond--label-action">Browse</span></div>`;

  return (
    <Container
      sx={{
        mt: 2,

        "& .MuiLinearProgress-root": {
          backgroundColor: theme.palette.secondary.light + " !important",
        },
        "& .MuiLinearProgress-bar": {
          backgroundColor:
            theme.palette[per === 100 ? "success" : "info"].main +
            " !important",
        },
      }}
    >
      <div>
        Uploaded Files: {info.complete}/{info.total}
      </div>

      <Box sx={{ display: "flex", alignItems: "center", height: "24px" }}>
        {info.total > 0 ? (
          <Box sx={{ width: "100%", mr: 1 }}>
            <LinearProgress
              sx={sx}
              variant="determinate"
              value={info.total > 0 ? per : 0}
              key="complete"
            />
          </Box>
        ) : null}
        {info.total > 0 ? (
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">{`${Math.round(
              per
            )}%`}</Typography>
          </Box>
        ) : null}
      </Box>

      <FilePond
        ref={pond}
        files={files}
        allowMultiple={true}
        maxFiles={100}
        maxParallelUploads={10}
        server={server}
        name="file"
        dropOnPage={true}
        dropOnElement={false}
        labelIdle={label}
        allowRemove={true}
        //allowRevert={false}
        credits={false}
        allowMinimumUploadDuration={false}
        itemInsertInterval={0}
        class="no-back"
        infooadDuration={false}
        onupdatefiles={(files) => {
          var _temp = {
            complete: 0,
            incomplete: 0,
            uploading: 0,
            total: files.length,
          };

          files.forEach((f, i) => {
            if (f.status === 5) {
              _temp.complete++;
            }
            if (f.status === 2 || f.status === 9 || f.status === 3) {
              _temp.incomplete++;
            }
            if (f.status === 3) {
              _temp.uploading++;
            }
          });

          setInfo(_temp);
          setFiles(files);
        }}
        onprocessfile={(file) => {
          var _temp = {
            complete: 0,
            incomplete: 0,
            uploading: 0,
            total: 0,
          };

          var files = pond.current?.getFiles();

          _temp.total = files.length;

          files.forEach((f, i) => {
            if (f.status === 5) {
              _temp.complete++;
            }
            if (f.status === 2 || f.status === 9 || f.status === 3) {
              _temp.incomplete++;
            }
            if (f.status === 3) {
              _temp.uploading++;
            }
          });

          setInfo(_temp);
        }}
        onprocessfiles={(files) => {}}
        onaddfilestart={(file) => {}}
        onremovefile={(error, file) => {}}
        onprocessfilerevert={() => {
          var _temp = {
            complete: 0,
            incomplete: 0,
            uploading: 0,
            total: 0,
          };

          var files = pond.current?.getFiles();

          _temp.total = files.length;

          files.forEach((f, i) => {
            if (f.status === 5) {
              _temp.complete++;
            }
            if (f.status === 2 || f.status === 9 || f.status === 3) {
              _temp.incomplete++;
            }
            if (f.status === 3) {
              _temp.uploading++;
            }
          });

          setInfo(_temp);
        }}
        onprocessfilestart={(file) => {
          var _temp = {
            complete: 0,
            incomplete: 0,
            uploading: 0,
            total: 0,
          };

          var files = pond.current?.getFiles();

          _temp.total = files.length;

          files.forEach((f, i) => {
            if (f.status === 5) {
              _temp.complete++;
            }
            if (f.status === 2 || f.status === 9 || f.status === 3) {
              _temp.incomplete++;
            }
            if (f.status === 3) {
              _temp.uploading++;
            }
          });

          setInfo(_temp);
        }}
      />
    </Container>
  );
}

export default Uploader;
