import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeKumparan() {
    const url = "https://kumparan.com/";
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const getFullUrl = (path) => new URL(path, url).href;

        const promotedLinks = $('a[data-qa-id="promoted-link"]')
            .map((_, el) => {
                const element = $(el);
                const title = element
                    .find('span[data-qa-id="label-promoted-link"]')
                    .text()
                    .trim();
                const link = getFullUrl(element.attr("href"));
                return { title, link };
            })
            .get();

        const trendingArticles = $(
            'div[data-qa-id="trending-section"] div[data-qa-id="news-card"]'
        )
            .map((_, el) => {
                const element = $(el);
                const title = element
                    .find('span[data-qa-id="title"]')
                    .text()
                    .trim();
                const author = element
                    .find('span[data-qa-id="author-name"]')
                    .text()
                    .trim();
                const imageUrl =
                    element.find('div[data-qa-id="image"] img').attr("src") ||
                    element
                        .find("div.Imageweb__ImageWrapper-sc-uudb7r-0")
                        .css("background-image");
                const linkElement = element.find("a").first();
                const link = linkElement.attr("href")
                    ? getFullUrl(linkElement.attr("href"))
                    : null;

                if (title.includes("Sedang memuat...")) {
                    return null;
                }

                return {
                    title,
                    author,
                    link,
                    imageUrl,
                };
            })
            .get()
            .filter(Boolean);

        return {
            source: "kumparan.com",
            pageTitle: $("title").text().trim(),
            metaDescription:
                $('meta[name="description"]').attr("content")?.trim() || "",
            promotedTopics: promotedLinks,
            trending: trendingArticles,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeKumparan };
