import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { Sequelize, DataTypes } from "sequelize";

use(chaiAsPromised);

const sequelize = new Sequelize("sqlite::memory:", { logging: false });

let FAQ;
try {
  FAQ = (await import("../models/faq.js")).default(sequelize, DataTypes);
} catch (error) {
  console.log("Error while initializing FAQ model: ", error.message);
  process.exit(0);
}
describe("Testing the FAQ Model", () => {
  before(async () => {
    await sequelize.sync({ force: true });
  });

  after(async () => {
    await sequelize.close();
    console.log("Database connection closed!");
    setTimeout(() => process.exit(0), 2000);
  });

  it("should create an FAQ entry", async () => {
    const faq = await FAQ.create({
      question: "What is Node.js?",
      answer: "Node.js is a runtime environment.",
    });

    expect(faq).to.have.property("id");
    expect(faq.question).to.equal("What is Node.js?");
    expect(faq.answer).to.equal("Node.js is a runtime environment.");
  });

  it("should not accept null question field", async () => {
    await expect(
      FAQ.create({ question: null, answer: "Some answer" })
    ).to.be.rejectedWith(Error);
  });

  it("should delete FAQ entry", async () => {
    const faq = await FAQ.create({
      question: "What is Sequelize?",
      answer: "Sequelize is an ORM for Node.js",
    });

    await faq.destroy();
    const deleted = await FAQ.findByPk(faq.id);
    expect(deleted).to.be.null;
  });
});
