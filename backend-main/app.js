require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { DBConnection } = require("./dbConnection.js");
const { createFAQ, getFAQ, deleteFAQ } = require("./utils/utils.js");

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

DBConnection();

app.post("/create-faq/:lang", createFAQ);
app.get("/get-faqs", getFAQ);
app.delete("/del/:id", deleteFAQ);

if (require.main == module) {
  app.listen(process.env.PORT, () => {
    console.log(`App is listening to port ${process.env.PORT}`);
  });
}

module.exports = app;
