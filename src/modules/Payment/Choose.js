import React from "react";
import { set } from "../../reducers";
import axios from "axios";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CompanyIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";

export default function Choose(props) {
  const [search, setSearch] = React.useState("");
  const [companies, setCompanies] = React.useState([]);
  const [saving, setSaving] = React.useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    var company_list = await axios
      .post("/remote/users/companies", {
        search_term: search,
      })
      .catch((err) => {});

    setCompanies(company_list.data);
  };

  const selectCompany = async (company) => {
    setSaving(true);
    axios
      .post("/remote/users/company", {
        price: company.price,
      })
      .then((result) => {
        set("company", result.data);

        setSaving(false);
        navigate("/payment/checkout");
      })
      .catch((err) => {
        setSaving(false);
      });
  };

  var companyMap = companies.map((v, i) => {
    return (
      <div style={{ marginTop: "8px" }} key={"company_" + i}>
        <LoadingButton
          color="primary"
          variant="contained"
          style={{ width: "100%" }}
          onClick={() => {
            v.refresh = Date.now();

            selectCompany(v);
          }}
          startIcon={<CompanyIcon />}
          loading={saving}
          loadingPosition="start"
        >
          {v.name}
        </LoadingButton>
      </div>
    );
  });

  return (
    <Container maxWidth="xs">
      <Grid container spacing={1} sx={{ mt: 1, pt: 0, alignItems: "center" }}>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            size="small"
            type="text"
            className="input"
            required
            placeholder={"search for company"}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            onClick={handleSearch}
            variant="contained"
            color="primary"
            fullWidth
          >
            Search
          </Button>
        </Grid>
      </Grid>

      {companies.length ? (
        <Grid>
          <Grid
            sx={{
              mt: 1,
            }}
          >
            <Typography>Results:</Typography>
          </Grid>
          {companyMap}
        </Grid>
      ) : null}
    </Container>
  );
}
