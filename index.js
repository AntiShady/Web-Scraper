import axios from "axios";
import * as cheerio from "cheerio";
import express, { response } from "express";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const app = express();
const PORT = process.env.PORT || 3000;

const url =
    "https://editorial.rottentomatoes.com/all-time-lists?wpv_view_count=1773-CATTR9a61a7f98d435e1c32de073e05574776&wpv_paged=";

const articles = [];

async function scrapeData(URL) {
    axios(URL)
        .then((response) => {
            const html = response.data;
            const $ = cheerio.load(html);

            const articleElements = $("a.unstyled.articleLink");

            for (let i = 0; i < articleElements.length; i++) {
                const element = articleElements[i];
                const $element = $(element);

                const articleData = {
                    link: $element.attr("href"),
                    image: $element.find("img").attr("src"),
                    title: $element.find("p.noSpacing.title").text().trim(),
                    publishDate: $element
                        .find("p.publication-date")
                        .text()
                        .trim(),
                };

                let found = false;
                for (let j = 0; j < articles.length; j++) {
                    if (articles[j].title === articleData.title) {
                        found = true;
                        break;
                    }
                }

                if (!found) articles.push(articleData);
            }

            // console.log(articles);
        })
        .catch((err) => {
            console.log("ERROR : ", err);
        });
}

// Getting all data from the 3 pages.
for (let i = 1; i <= 3; i++) {
    scrapeData(url + i);
}

app.get("/", (req, res) => {
    res.send("Hello, welcome to my web scraper...");
});
app.get("/data", (req, res) => {
    res.json(articles);
});

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});
