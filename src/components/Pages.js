import React from "react";

import Paper from "@mui/material/Paper";
import Pagination from "@mui/material/Pagination";
import { connect } from "react-redux";
import { useTheme } from "@mui/material";

function Pages(props) {
  const theme = useTheme();

  const [pagination, setPagination] = React.useState(props.pagination);

  const handleChange = (event, value) => {
    var new_pagination = Object.assign({}, pagination);
    new_pagination.page = value;
    new_pagination.skip = pagination.max * (value - 1);
    new_pagination.limit = pagination.max * value;

    setPagination(new_pagination);

    if (props.setPagination) {
      props.setPagination(new_pagination);
    }

    props.callback(new_pagination);
  };

  React.useEffect(() => {
    setPagination(props.pagination);
  }, [props.pagination]);

  var content = (
    <div
      sx={{
        width: "100%",
        height: "32px",
      }}
      style={{
        padding: props.isSmall ? theme.spacing(1) : theme.spacing(0),
      }}
    >
      {props.total ? (
        <Pagination
          style={{
            width: "fit-content",
            marginLeft: props.align && props.align === "left" ? 0 : "auto",
            marginRight: props.align && props.align === "right" ? 0 : "auto",
          }}
          count={Math.ceil(props.total / pagination.max)}
          page={pagination.page}
          onChange={handleChange}
          showFirstButton={false}
          showLastButton={false}
          shape="rounded"
          variant="text"
          color="tableicon"
          size={props.size}
          siblingCount={1}
          boundaryCount={1}
          hidePrevButton={pagination.page > 1 ? false : false}
          hideNextButton={
            pagination.page === Math.ceil(props.total / pagination.max) ||
            props.total === 0
              ? false
              : false
          }
        />
      ) : null}
    </div>
  );

  if (props.total <= props.pagination.max) {
    return null;
  }

  return !content ? (
    <Paper
      sx={{
        "& > * + *": {
          marginTop: theme.spacing(2),
        },
        display: "block",
      }}
      style={{
        width: props.wide ? "100%" : "100%",
      }}
    >
      {content}
    </Paper>
  ) : (
    content
  );
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Pages);
