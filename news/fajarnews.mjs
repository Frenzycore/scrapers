import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeFajar() {
    try {
        const { data: html } = await axios.get("https://fajar.co.id/", {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const headlineNews = $("div.csslider > ul > li")
            .map((_, el) => {
                const element = $(el);
                const titleElement = element.find(
                    "h3.gmr-rp-biglink a.gmr-slide-titlelink"
                );
                const metaElement = element.find("div.meta-content");

                return {
                    title:
                        titleElement.attr("title") ||
                        titleElement.text().trim(),
                    link: titleElement.attr("href"),
                    image: element.find("a.post-thumbnail img").attr("src"),
                    category: metaElement
                        .find("span.cat-links-content a")
                        .text()
                        .trim(),
                    publishedAt: metaElement
                        .find("span.posted-on time.entry-date")
                        .attr("datetime"),
                };
            })
            .get();

        const viralNews = $("div#moduleslide div.gmr-slider-content")
            .map((_, el) => {
                const element = $(el);
                const titleElement = element.find("a.recent-title");

                return {
                    title: titleElement.attr("title"),
                    link: titleElement.attr("href"),
                    image: element.find("a.post-thumbnail img").attr("src"),
                };
            })
            .get();

        const latestNews = $("main#primary article.post")
            .map((_, el) => {
                const element = $(el);
                const titleElement = element.find("h2.entry-title a");
                const footerElement = element.find(
                    "footer.entry-footer-archive"
                );

                return {
                    title: titleElement.attr("title"),
                    link: titleElement.attr("href"),
                    image: element.find("a.post-thumbnail img").attr("src"),
                    author:
                        footerElement
                            .find(".posted-by .author a")
                            .text()
                            .trim() || null,
                    category: footerElement
                        .find(".cat-links-content a")
                        .text()
                        .trim(),
                    publishedAt: footerElement
                        .find(".posted-on time.entry-date")
                        .attr("datetime"),
                };
            })
            .get();

        const popularNews = $("aside#secondary section#wpberita-popular-3 li")
            .map((_, el) => {
                const element = $(el);
                const titleElement = element.find("a.recent-title");

                return {
                    rank: parseInt(
                        element.find(".rp-number").text().trim(),
                        10
                    ),
                    title: titleElement.attr("title"),
                    link: titleElement.attr("href"),
                };
            })
            .get();

        return {
            headlineNews,
            viralNews,
            latestNews,
            popularNews,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeFajar };
