require("dotenv").config();

const { sequelize } = require("./models");

async function DBConnection() {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log(`Connected to database!`);
  } catch (e) {
    console.log("Unable to connect to database:", e.message);
  }
}

module.exports = { DBConnection };
