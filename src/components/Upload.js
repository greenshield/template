import * as React from "react";
import control from "../reducers";
import axios from "axios";
import { TextField } from "@mui/material";

function Upload(props) {
  return (
    <React.Fragment>
      <TextField
        fullWidth
        inputProps={{
          multiple: true,
          style: {
            padding: "16px",
            paddingBottom: "21px",
            paddingLeft: "auto",
            paddingRight: "auto",
          },
        }}
        margin="none"
        type="file"
        onChange={(e) => {
          var target = e.target;

          if (target && target.files) {
            const files = Array.from(target.files);

            files.forEach(async (file, i) => {
              const formData = new FormData();

              formData.append("upload_type", "image");

              formData.append("file", file);

              await axios({
                method: "POST",
                url: "/remote/upload",
                data: formData,
                headers: {
                  Accept: "application/json",
                  "Content-Type": "multipart/form-data",
                },
                onUploadProgress: function (progressEvent) {
                  var percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                  );
                  console.log(percentCompleted);
                },
              })
                .then((res) => {
                  if (res.data.files && res.data.files.length) {
                    console.log(res.data);
                  }
                })
                .catch(function (thrown) {
                  console.log(thrown);
                });
            });
          }

          //this changes the value of the data that was passed down to state from props so that the text field updates, without updating state text field value will always come from state.data that was sent from (but now isolated from) props, so changing the text will do nothing unless this changes the state that provides the value to the field. This by itself does not trigger a save, the blur handler must happen to trigger a save or a save must be triggered. This is not needed at all if the async solution is in use, as it will update and save. Use this instead of the this.props.handleChange line  if you want to update the state locally and reflect changes, but trigger the save manually.
          //this.handleChange('data', obj);
        }}
        value={""}
        variant="filled"
        color="primary"
        multiline={false}
      />
    </React.Fragment>
  );
}

export default control(Upload, ["theme", "menu", "temp"]);
