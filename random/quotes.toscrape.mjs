import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeQuotesToScrape() {
    let currentUrl = "https://quotes.toscrape.com/";
    const allQuotes = [];
    let page = 1;

    try {
        while (currentUrl) {
            const { data: html } = await axios.get(currentUrl, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                },
            });

            const $ = cheerio.load(html);

            $(".quote").each((_, el) => {
                const element = $(el);

                const text = element.find("span.text").text().trim();
                const author = element.find("small.author").text().trim();
                const authorUrlPath = element.find("a").attr("href");
                const tags = element
                    .find(".tags a.tag")
                    .map((_, tagEl) => $(tagEl).text().trim())
                    .get();

                allQuotes.push({
                    text,
                    author,
                    authorUrl: authorUrlPath
                        ? new URL(authorUrlPath, currentUrl).href
                        : null,
                    tags,
                    page,
                });
            });

            const nextPagePath = $(".pager .next a").attr("href");
            currentUrl = nextPagePath
                ? new URL(nextPagePath, currentUrl).href
                : null;

            page++;
        }

        return {
            totalQuotes: allQuotes.length,
            quotes: allQuotes,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeQuotesToScrape };
// This comes from: https://gist.github.com/Frenzycore/5a6f12675760fe698876dc23204d4560