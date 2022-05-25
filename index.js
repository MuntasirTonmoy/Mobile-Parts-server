const express = require("express");
const cors = require("cors");
const res = require("express/lib/response");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Manufacturer Server is running ");
});

app.listen(port, () => {
  console.log("listing to port ", port);
});
