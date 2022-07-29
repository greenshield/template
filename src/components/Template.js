import * as React from "react";
import control from "../reducers";

function Template(props) {
  return <React.Fragment>Template</React.Fragment>;
}

export default control(Template, ["theme", "menu", "temp"]);
