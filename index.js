const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 🔹 Website Scraper Function (UPDATED)
async function nodescrapeWebsite(url) {
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
      if (content) {
        text += content + "\n";
      }
    });

    if (!text) {
      throw new Error("No readable content found on website");
    }

    return text.substring(0, 12000); // limit for LLM
  } catch (error) {
    console.error("SCRAPER ERROR:", error.message);
    throw error;
  }
}

// 🔹 API Endpoint
app.post("/scrape", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        status: "error",
        message: "URL missing"
      });
    }

    console.log("Scraping URL:", url);

    const content = await scrapeWebsite(url);

    res.json({
      status: "success",
      content
    });

  } catch (error) {
    console.error("API ERROR:", error.message);

    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

// 🔹 Health Check (Optional but useful)
app.get("/", (req, res) => {
  res.send("Website Voice AI Backend is running 🚀");
});

// 🔹 Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
