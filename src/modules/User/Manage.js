import * as React from "react";
import control from "../../reducers";
import Table from "../../components/Table/Table";
import Edit from "./Edit";
import axios from "axios";

function Manage(props) {
  const deleteMulti = async (opts) => {
    var mapped = opts.selected.map((s, si) => {
      return opts.data.rows[s]._id;
    });

    return axios.post("/remote/users/savemulti", {
      _ids: mapped,
      updates: {
        deleted: true,
      },
      soft: opts.soft,
    });
  };

  const search = async (payload, opts) => {
    return axios.post("/remote/users/list", payload, {
      cancelToken: opts.source.token,
    });
  };

  return (
    <React.Fragment>
      <Table
        edit={Edit}
        search={search}
        deleteMulti={deleteMulti}
        title="Users"
      />
    </React.Fragment>
  );
}

export default control(Manage, ["theme", "menu", "temp", "alert"]);
