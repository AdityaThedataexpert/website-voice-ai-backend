const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 🔹 Website Scraper Function
async function scrapeWebsite(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
      },
      timeout: 15000
    });

    const html = response.data;
    const $ = cheerio.load(html);

    let text = "";

    $("h1, h2, h3, p, li").each((i, el) => {
      const content = $(el).text().trim();
      if (content) text += content + "\n";
    });

    if (!text) {
      throw new Error("No readable content found");
    }

    return text.substring(0, 12000);
  } catch (error) {
    console.error("SCRAPER ERROR:", error.message);
    throw error;
  }
}

// 🔹 Scrape API
app.post("/scrape", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        status: "error",
        message: "URL missing"
      });
    }

    console.log("Scraping:", url);
    const content = await scrapeWebsite(url);

    res.json({
      status: "success",
      content
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

// 🔹 Health Check
app.get("/", (req, res) => {
  res.send("Website Voice AI Backend is running 🚀");
});

// 🔹 IMPORTANT: Render PORT binding
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
