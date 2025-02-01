const { FAQ } = require("../models");
const googleTranslate = require("google-translate-api-x");
const Redis = require("ioredis");
const cheerio = require("cheerio");

const langs = ["hi", "bn", "es"];

const redisClient = new Redis(process.env.REDIS_URL);

redisClient.hgetAsync = require("util").promisify(redisClient.hget);

async function translate(text, fr, t) {
  try {
    const cachedKey = `${fr}-${t}:${text}`;

    const cachedTranslation = await redisClient.hget("translations", cachedKey);
    if (cachedTranslation) {
      return cachedTranslation;
    }

    if (fr === t) return text;

    const translated = await googleTranslate(text, { from: fr, to: t });
    const translatedText = translated.text;

    await redisClient.hset("translations", cachedKey, translatedText);
    await redisClient.expire(`translations:${cachedKey}`, 3600); // 1-hour expiry

    return translatedText;
  } catch (e) {
    console.error("Error translating text:", e);
    return text;
  }
}

/**
 * This function processes HTML content while preserving tags during translation.
 */
async function translateHTMLContent(htmlContent, fromLang, toLang) {
  const $ = cheerio.load(htmlContent);

  // Function to translate nodes, including text inside tags
  async function translateNode(node) {
    // If it's a text node
    if (node.type === "text") {
      const originalText = node.data.trim();
      if (originalText) {
        const translatedText = await translate(originalText, fromLang, toLang);
        node.data = translatedText;
      }
    } else {
      const childPromises = [];
      $(node)
        .contents()
        .each(function () {
          childPromises.push(translateNode(this));
        });
      return Promise.all(childPromises);
    }
  }

  // Start processing from the body element
  await translateNode($("body")[0]);

  return $.html();
}

async function createFAQ(req, res) {
  try {
    const { question, answer } = req.body;
    const originalLang = req.params.lang || "en";

    const translatedQuestionNoHTML = await translate(
      question,
      originalLang,
      "en"
    );
    const translatedAnswerHTML = await translateHTMLContent(
      answer,
      originalLang,
      "en"
    );

    const newFAQ = await FAQ.create({
      question: translatedQuestionNoHTML,
      answer: translatedAnswerHTML,
      translations: {},
    });

    const translations = {};
    await Promise.all(
      langs.map(async (lang) => {
        if (lang === originalLang) {
          translations[lang] = {
            question: question,
            answer: answer,
          };
        } else {
          const tQuestionHTML = await translate(
            translatedQuestionNoHTML,
            "en",
            lang
          );
          const tAnswerHTML = await translateHTMLContent(
            translatedAnswerHTML,
            "en",
            lang
          );

          translations[lang] = {
            question: tQuestionHTML,
            answer: tAnswerHTML,
          };
        }
      })
    );

    await newFAQ.update({ translations });

    res.status(201).json({ success: true, content: newFAQ });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getFAQ(req, res) {
  try {
    const FAQs = await FAQ.findAll();
    res.status(200).json({ success: true, content: FAQs });
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function deleteFAQ(req, res) {
  try {
    const { id } = req.params;

    const faq = await FAQ.findByPk(id);

    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    await faq.destroy();

    res
      .status(200)
      .json({ success: true, message: "FAQ deleted successfully" });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { createFAQ, getFAQ, deleteFAQ };
