import * as React from "react";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import { visuallyHidden } from "@mui/utils";
import axios from "axios";
import control from "../../reducers";
import ArrowDownward from "@mui/icons-material/KeyboardArrowDown";
import ArrowUpward from "@mui/icons-material/KeyboardArrowRight";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/AddCircle";

import Spin from "../DataLoad";
import Search from "./Search";

import { isInViewport } from "../../components/Tools";

import Deleted from "@mui/icons-material/Visibility";
import NoDeleted from "@mui/icons-material/VisibilityOff";

const CancelToken = axios.CancelToken;

let source = CancelToken.source();

function EnhancedTable(props) {
  const deleteMulti = (soft) => {
    props
      .deleteMulti({ selected: selected, soft, data: data })
      .then((result) => {
        var s = selected.slice();
        s.sort(function (a, b) {
          return b - a;
        });

        var r = data.rows.slice();

        s.forEach((re, i) => {
          if (!state.query.deleted || !soft) {
            r.splice(s[i], 1);
          } else {
            var _r = r[s[i]];
            _r.deleted = true;
          }
        });

        setSelected([]);

        setData({ ...data, rows: r });

        props.set("alert", {
          open: true,
          severity: result.data.severity,
          message: result.data.message,
        });
      })
      .catch((err) => console.log(err));
  };

  const search = props.search;

  const theme = useTheme();

  const Edit = props.edit;

  const defaultData = { columns: [], rows: [], total: 0 };
  const defaultState = {
    query: { deleted: false },
    cols: [],
    filter: {},
    total: 0,
    data: [],
    rowsPerPage: 25,
    page: 0,
    orderBy: "name",
    orderDirection: "asc",
  };

  const load = (_search) => {
    var _state = Object.assign({}, state);
    _state.page = 0;
    _state.selected = [];
    _state.refresh = true;
    _state.search = _search;

    setOpenRecord(null);
    clearAdding();
    setRefresh(_state);
  };

  const [selected, setSelected] = React.useState([]);

  const [adding, setAdding] = React.useState(false);

  const [refresh, setRefresh] = React.useState({
    page: defaultState.page,
    rowsPerPage: defaultState.rowsPerPage,
    refresh: true,
  });
  const [data, setData] = React.useState(defaultData);
  const [openRecord, setOpenRecord] = React.useState(null);

  const [state, setState] = React.useState(defaultState);
  const [loading, setLoading] = React.useState(true);
  const [initial, setInitial] = React.useState(false);

  const [filters, setFilters] = React.useState(false);

  const token = props.user.token;
  const dense = props.hooks.small;
  const advanced = props.advanced;

  React.useEffect(() => {
    var fetchData = async (data_filter, download) => {
      if (loading && initial) {
        return false;
      }
      setLoading(true);
      source.cancel("cancelled");
      source = CancelToken.source();

      var r = false;
      if (data_filter.refresh) {
        r = true;
        delete data_filter.refresh;
      }

      var pages = data_filter
        ? data_filter
        : { page: state.page, rowsPerPage: state.rowsPerPage };

      var filter = state.filter;
      filter.pagination = {};
      filter.pagination.limit = (pages.page + 1) * pages.rowsPerPage;
      filter.pagination.skip = pages.page * pages.rowsPerPage;
      filter.order_by = pages.orderBy ? pages.orderBy : null;
      filter.order_direction = pages.orderDirection;
      filter.search_term = data_filter.search;

      search(
        {
          token: token,
          download: download ? download : false,
          filter: filter,
          query: state.query,
          advanced: advanced,
        },
        { source }
      )
        .then(async (res) => {
          if (!initial) {
            setInitial(true);
          }
          if (r) {
            setState({ ...state, ...data_filter });
          }

          setData(res.data);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
    };

    if (refresh) {
      var r = Object.assign({}, refresh);
      setRefresh(null);
      fetchData(r, false);
    }
  }, [state, token, refresh, loading, initial, advanced, search]);

  React.useEffect(() => {
    return () => {
      source.cancel("cancelled");
      source = CancelToken.source();
    };
  }, []);

  const handleChangeRowsPerPage = (e) => {
    var _state = Object.assign({}, state);
    _state.page = 0;
    _state.selected = [];
    _state.rowsPerPage = e.target.value;
    _state.refresh = true;
    setRefresh(_state);
  };

  const handleRequestSort = (event, item) => {
    setData(defaultData);
    const isAsc = state.orderBy === item && state.orderDirection === "asc";

    var _state = Object.assign({}, state);
    _state.page = 0;
    _state.selected = [];
    _state.orderBy = item;
    _state.orderDirection = isAsc ? "desc" : "asc";
    _state.refresh = true;
    setRefresh(_state);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = data.rows.map((n, i) => i);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  var handleChangePage = (e, newPage) => {
    var _state = Object.assign({}, state);
    _state.page = newPage;
    _state.selected = [];
    _state.rowsPerPage = state.rowsPerPage;
    _state.refresh = true;
    setRefresh(_state);
  };

  const isOpen = (_id) => {
    return _id === openRecord;
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    state.page > 0
      ? Math.max(0, (1 + state.page) * state.rowsPerPage - data.rows.length)
      : 0;

  var numSelected = selected.length;
  var onSelectAllClick = handleSelectAllClick;
  var onRequestSort = handleRequestSort;
  var rowCount = data.rows.length ? data.rows.length : 0;

  const createSortHandler = (item) => (event) => {
    onRequestSort(event, item);
  };

  var hook_offset = props.hooks.offset;

  var h = window.innerHeight - parseInt(hook_offset) * 2 - 52;

  //const theme = useTheme();

  var dataRows = data.rows;

  var showEmpty = false;

  const MyTablePagination = styled(TablePagination)((theme) => ({
    //color: "#ffffff",
  }));

  //hide table layout before initial data is loaded
  /*
  if (!initial) {
    return (
      <div
        style={{
          width: "100%",
          overflow: "hidden",
          height: window.innerHeight - parseInt(hook_offset),
        }}
      >
        <Spin />
      </div>
    );
  }
  */

  const clearAdding = () => {
    setAdding(false);
    if (data.rows.length && data.rows[0]._id === "") {
      var _rows = data.rows.slice();
      _rows.splice(0, 1);
      setData({ ...data, rows: _rows });
    }
  };

  function scrollTo(offset, callback) {
    const fixedOffset = offset.top.toFixed();
    const onScroll = function () {
      if (
        document.getElementById("table-body").scrollTop.toFixed() ===
        fixedOffset
      ) {
        document
          .getElementById("table-body")
          .removeEventListener("scroll", onScroll);

        if (callback && props.hooks.isMobile) {
          callback();
        }
      }
    };

    document.getElementById("table-body").addEventListener("scroll", onScroll);
    onScroll();
    document.getElementById("table-body").scrollTo({
      top: offset.top,
      left: 0,
      behavior: "auto",
    });
  }

  return (
    <Paper
      sx={{
        width: "100%",
        overflow: "hidden",
        height: window.innerHeight - parseInt(hook_offset),
      }}
    >
      {loading ? <Spin /> : null}

      <Toolbar
        sx={{
          pl: { xs: 1, sm: 3 },
          pr: { xs: 1 },
          ...(numSelected > 0 && {
            bgcolor: (theme) =>
              alpha(
                theme.palette.primary.main,
                theme.palette.action.activatedOpacity
              ),
          }),
        }}
        className="noselect"
      >
        {numSelected > 0 ? (
          <Typography
            sx={{ flex: "1 1 100%" }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {numSelected} selected
          </Typography>
        ) : (
          <Typography
            sx={{ flex: "1 1 100%" }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            {props.title}
          </Typography>
        )}

        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton
              onClick={() => {
                var temp = Object.assign({}, props.temp);
                temp.confirm = {
                  title: "Are you sure?",
                  cancel_text: "No",
                  text: "Do you want to delete these rows?",
                  confirm_text: "Yes, Full",
                  callback_color: "error",
                  callback: () => {
                    deleteMulti(false);
                  },
                  alt_confirm_text: "Yes, Soft",
                  alt_callback_color: "warning",
                  alt_callback: () => {
                    deleteMulti(true);
                  },
                };
                props.set("temp", temp);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <React.Fragment>
            {!props.hide_add ? (
              <Tooltip title="Add row">
                <IconButton
                  disabled={adding}
                  onClick={() => {
                    if (adding) {
                      return false;
                    }

                    var r = data.rows.slice();
                    r.unshift({
                      status: "active",
                      _id: "",
                    });

                    setData({ ...data, rows: r });

                    setOpenRecord("");

                    setAdding(true);
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            ) : null}
            {filters ? (
              <span>
                <Tooltip title="Show deleted">
                  <IconButton
                    onClick={() => {
                      var new_state = Object.assign({}, state);
                      new_state.query.deleted = !new_state.query.deleted;
                      setOpenRecord(null);
                      clearAdding();
                      setState(new_state);

                      var _state = Object.assign({}, state);
                      _state.page = 0;
                      _state.selected = [];
                      _state.refresh = true;

                      setRefresh(_state);
                    }}
                  >
                    {state.query.deleted ? (
                      <Deleted
                        sx={{
                          color: theme.palette.tableicon.main,
                        }}
                      />
                    ) : (
                      <NoDeleted
                        sx={{
                          color: theme.palette.tableicon.light,
                        }}
                      />
                    )}
                  </IconButton>
                </Tooltip>
              </span>
            ) : null}
            <Tooltip title="Filter list">
              <IconButton
                onClick={() => {
                  setFilters(!filters);
                }}
              >
                <FilterListIcon
                  sx={{
                    color: filters
                      ? theme.palette.tableicon.main
                      : theme.palette.tableicon.light,
                  }}
                />
              </IconButton>
            </Tooltip>
            <Search disabled={adding} callback={load} />
          </React.Fragment>
        )}
      </Toolbar>

      <TableContainer
        style={{
          height: h,
        }}
        id="table-body"
      >
        <Table
          id="table-main"
          stickyHeader={true}
          sx={{ width: "100%" }}
          aria-labelledby="tableTitle"
          size={dense ? "small" : "medium"}
        >
          <TableHead>
            <TableRow>
              <TableCell
                padding="none"
                sx={{
                  textAlign: "center",
                  position: "sticky",
                  left: 0,
                  zIndex: 3,
                  width: "96px",
                }}
              >
                <div
                  style={{
                    minHeight: "73px",
                    display: "flex",
                    justifyContent: "left",
                    alignItems: "center",
                  }}
                >
                  <Checkbox
                    sx={{ marginLeft: "44px" }}
                    disabled={loading}
                    color="primary"
                    indeterminate={numSelected > 0 && numSelected < rowCount}
                    checked={rowCount > 0 && numSelected === rowCount}
                    onChange={onSelectAllClick}
                    inputProps={{
                      "aria-label": "select all",
                    }}
                  />
                </div>
                <div id="table-body-marker" style={{ height: "0px" }}></div>
              </TableCell>
              {data.columns.map((headCell) => {
                return (
                  <TableCell
                    key={headCell.id}
                    align={
                      headCell.numeric || headCell.id === "status"
                        ? "right"
                        : "left"
                    }
                    padding={headCell.disablePadding ? "none" : "normal"}
                    sortDirection={
                      state.orderBy === headCell.id
                        ? state.orderDirection
                        : false
                    }
                  >
                    <TableSortLabel
                      style={{ padding: "0px !important" }}
                      active={state.orderBy === headCell.id}
                      direction={
                        state.orderBy === headCell.id
                          ? state.orderDirection
                          : "asc"
                      }
                      onClick={createSortHandler(headCell.id)}
                    >
                      {headCell.label}
                      {state.orderBy === headCell.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {state.orderDirection === "desc"
                            ? "sorted descending"
                            : "sorted ascending"}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* if you don't need to support IE11, you can replace the `stableSort` call with:
                 rows.slice().sort(getComparator(order, orderBy)) */}
            {dataRows
              //.slice(state.page * state.rowsPerPage, state.page * state.rowsPerPage + state.rowsPerPage)
              .map((row, index) => {
                const isItemSelected = isSelected(index);
                const labelId = `enhanced-table-checkbox-${index}`;
                const isItemOpen = isOpen(row._id);
                const disabled =
                  (openRecord && !isItemOpen) ||
                  row.deleted ||
                  (adding && row._id && row._id.length)
                    ? true
                    : false;

                var cells = data.columns.map((c, i) => {
                  return (
                    <TableCell
                      align={c.align}
                      className="selectable"
                      padding={c.disablePadding ? "none" : "normal"}
                      key={c.accessor}
                    >
                      {row[c.accessor]
                        ? row[c.accessor]
                        : c.default
                        ? c.default
                        : "no value"}
                    </TableCell>
                  );
                });

                return (
                  <React.Fragment key={row._id}>
                    <TableRow
                      hover={isItemOpen ? false : true}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      selected={isItemSelected}
                      id={isItemOpen ? "editing-row" : ""}
                      style={{
                        height: "48px",
                        opacity: disabled ? (row.deleted ? 0.25 : 0.4) : 1,
                      }}
                      className={
                        isItemOpen
                          ? "editing-row"
                          : disabled
                          ? "disabled-row"
                          : ""
                      }
                      onClick={() => {
                        if (disabled) {
                          setOpenRecord(null);
                          clearAdding();
                        }
                      }}
                    >
                      <TableCell
                        padding="none"
                        sx={{
                          textAlign: "left",
                          width: "96px",
                          position: "sticky",
                          left: 0,
                        }}
                        id={labelId}
                      >
                        <IconButton
                          size="small"
                          aria-label="close"
                          style={{
                            marginLeft: "8px",
                          }}
                          color="inherit"
                          disabled={disabled || (adding && !row._id)}
                          onClick={(e) => {
                            if (disabled) {
                              return false;
                            }

                            if (!isItemOpen) {
                              setOpenRecord(row._id);
                              setTimeout(() => {
                                var canSee = isInViewport(
                                  document.getElementById("form-scroll")
                                );
                                if (!canSee) {
                                  var _top = document
                                    .getElementById("form-scroll")
                                    .getBoundingClientRect().y;

                                  var _scroll =
                                    _top -
                                    h -
                                    parseInt(hook_offset) -
                                    parseInt(hook_offset);

                                  scrollTo(
                                    {
                                      left: 0,
                                      top:
                                        document.getElementById("table-body")
                                          .scrollTop + _scroll,
                                      behavior: "auto",
                                    },
                                    () => {
                                      var table_pos = document
                                        .getElementById("table-body-marker")
                                        .getBoundingClientRect().y;
                                      var start_pos = document
                                        .getElementById("form-start")
                                        .getBoundingClientRect().y;

                                      console.log(table_pos);
                                      console.log(start_pos);

                                      if (start_pos < table_pos) {
                                        scrollTo({
                                          left: 0,
                                          top:
                                            document.getElementById(
                                              "table-body"
                                            ).scrollTop -
                                            (table_pos - start_pos) -
                                            17,
                                          behavior: "auto",
                                        });
                                      }
                                    }
                                  );
                                }
                              }, 1);
                            } else {
                              setOpenRecord(null);
                              clearAdding();
                            }
                          }}
                        >
                          {isItemOpen ? (
                            <ArrowDownward fontSize="small" />
                          ) : (
                            <ArrowUpward fontSize="small" />
                          )}
                        </IconButton>
                        <Checkbox
                          style={{
                            display: adding && !row._id ? "none" : "",
                          }}
                          disabled={disabled}
                          onClick={(event) => {
                            if (disabled) {
                              return false;
                            }
                            handleClick(event, index);
                          }}
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            "aria-labelledby": labelId,
                          }}
                        />
                      </TableCell>
                      {cells}
                    </TableRow>
                    {isItemOpen ? (
                      <TableRow
                        hover={false}
                        selected={false}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        id={"sub" + row._id}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          padding="none"
                          colSpan="12"
                          className="edit-row"
                          id="edit-row"
                        >
                          <Edit
                            clearAdding={clearAdding}
                            adding={adding}
                            setAdding={setAdding}
                            row={row}
                            setOpenRecord={setOpenRecord}
                            index={index}
                            data={data}
                            setData={setData}
                            state={state}
                          />
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </React.Fragment>
                );
              })}
            {showEmpty && emptyRows > 0 && (
              <TableRow
                style={{
                  height: (dense ? 33 : 53) * emptyRows,
                }}
                className={"filler-rows"}
              >
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <MyTablePagination
        className="noselect"
        labelRowsPerPage={props.hooks.isMobile ? "" : "Per page"}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={data.total}
        rowsPerPage={state.rowsPerPage}
        page={state.page}
        showFirstButton={true}
        showLastButton={true}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        style={{
          position: "absolute",
          bottom: "0px",
          width: "100%",
        }}
      />
    </Paper>
  );
}

export default control(EnhancedTable, [
  "user",
  "temp",
  "alert",
  "hooks",
  "small",
]);
