import { use, expect } from "chai";
import chaiHttp from "chai-http";
import app from "../app.js";
import http from "http";
const chai = use(chaiHttp);

let server;

describe("Testing API routes", () => {
  let faqIDen;
  let faqIDhi;

  before(async () => {
    server = http.createServer(app);
    server.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT} for testing!`);
    });
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    console.log("Server shut down gracefully!");
  });

  it("should retrieve all FAQ entries", async () => {
    const res = await chai.request.execute(app).get("/get-faqs").send({});
    const response = JSON.parse(res.text);
    expect(response.success).to.equal(true);
    expect(response.content).to.be.an("array");
    expect(response.content[0]).to.have.property("question");
  }).timeout(5000);

  it("should add a new FAQ to db in english", async () => {
    const temp = await chai.request.execute(app).post("/create-faq/en").send({
      question: "What is Sequelize?",
      answer: "<p>Sequelize is an <strong>ORM</strong> for Node.js</p>",
    });
    const res = JSON.parse(temp.text);
    faqIDen = res.content.id;
    expect(res.success).to.equal(true);
    expect(temp.statusCode).to.equal(201);
  }).timeout(4000);

  it("should add a new FAQ to db in hindi", async () => {
    const temp = await chai.request
      .execute(app)
      .post("/create-faq/hi")
      .send({
        question: "React क्या है?",
        answer: `<p>React एक जावास्क्रिप्ट लाइब्रेरी है जिसका उपयोग वेब एप्लिकेशन्स के यूज़र इंटरफेस (UI) को बनाने के 
        लिए किया जाता है। इसे Facebook द्वारा विकसित किया गया है और इसका मुख्य उद्देश्य UI को कंप्रोनेन्ट्स 
        (components) के रूप में विभाजित करना है। React में, हर UI तत्व एक component होता है, जिसे आप आसानी से 
        modify कर सकते हैं और ऐप के प्रदर्शन को बेहतर बना सकते हैं। React की विशेषता है कि यह Virtual DOM का उपयोग 
        करता है, जिससे rendering प्रक्रिया को तेज़ और अधिक efficient बनाया जा सकता है। React का उपयोग करके आप 
        single-page applications (SPA) भी बना सकते हैं, जिसमें page reload के बिना dynamic content लोड होता है।</p>`,
      });
    const res = JSON.parse(temp.text);
    faqIDhi = res.content.id;
    expect(res.success).to.equal(true);
    expect(temp.statusCode).to.equal(201);
  }).timeout(4000);

  it("should delete the FAQs created in the previous tests", async () => {
    const tempen = await chai.request
      .execute(app)
      .delete(`/del/${faqIDen}`)
      .send({});
    const temphi = await chai.request
      .execute(app)
      .delete(`/del/${faqIDhi}`)
      .send({});
    expect(tempen.statusCode).to.equal(200);
    expect(temphi.statusCode).to.equal(200);
  }).timeout(4000);
});
