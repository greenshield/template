import * as React from "react";
import control from "../../reducers";
import Display from "./Display";

function Auth(props) {
  return (
    <Routes>
      <Route path={`/`} exact element={<Display />} />
    </Routes>
  );
}

export default control(Auth, ["theme", "menu", "temp"]);
