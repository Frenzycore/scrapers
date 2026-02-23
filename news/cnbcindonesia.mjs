import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeCnbcIndonesia() {
    try {
        const { data: html } = await axios.get(
            "https://www.cnbcindonesia.com/",
            {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                },
            }
        );

        const $ = cheerio.load(html);

        const headlineArticleElement = $("article.relative a.block.group");
        const headlineArticle = {
            title: headlineArticleElement.find("h2").text().trim() || null,
            link: headlineArticleElement.attr("href") || null,
            image: headlineArticleElement.find("img").attr("src") || null,
            category:
                headlineArticleElement.find("span.uppercase").text().trim() ||
                null,
            timestamp:
                headlineArticleElement.find("span.text-xs").text().trim() ||
                null,
        };

        const latestNews = $("div.nhl-list > article")
            .map((_, element) => {
                const articleLink = $(element).find("a.group");
                const title = articleLink.find("h2").text().trim();
                const link = articleLink.attr("href");
                const image = articleLink.find("img").attr("src");
                const category = articleLink
                    .find("span.text-cnbc-primary-blue")
                    .text()
                    .trim();
                const timestamp = articleLink
                    .find("span.text-xs.text-gray")
                    .text()
                    .trim();
                const specialTag =
                    articleLink
                        .find("span.text-cnbc-support-orange")
                        .text()
                        .trim() || null;

                return { title, link, image, category, timestamp, specialTag };
            })
            .get();

        return {
            headlineArticle,
            latestNews,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeCnbcIndonesia };
