import axios from "axios";
import * as cheerio from "cheerio";

async function voaIndonesiaNews() {
    const baseUrl = "https://www.voaindonesia.com";
    try {
        const { data: html } = await axios.get(baseUrl, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const featuredArticles = [];
        $("#wrowblock-16716_3 .media-block.media-block--io").each((i, el) => {
            const title = $(el).find("h4.media-block__title").text().trim();
            const relativeUrl = $(el).find("a").attr("href");
            const imageUrl = $(el).find("img").attr("data-src");

            if (title && relativeUrl) {
                featuredArticles.push({
                    title,
                    url: new URL(relativeUrl, baseUrl).href,
                    imageUrl: imageUrl || null,
                });
            }
        });

        const sections = [];
        $(".media-block-wrap").each((i, sectionEl) => {
            const category = $(sectionEl).find("h2.section-head").text().trim();

            if (!category || category === "Berita Terkini") {
                return;
            }

            const articles = $(sectionEl)
                .find(".media-block")
                .map((idx, articleEl) => {
                    const title = $(articleEl)
                        .find("h4.media-block__title")
                        .text()
                        .trim();
                    const relativeUrl = $(articleEl)
                        .find("a")
                        .first()
                        .attr("href");

                    if (!title || !relativeUrl) {
                        return null;
                    }

                    const imageUrl =
                        $(articleEl).find("img").attr("data-src") ||
                        $(articleEl).find("img").attr("src");

                    return {
                        title,
                        url: new URL(relativeUrl, baseUrl).href,
                        imageUrl: imageUrl || null,
                    };
                })
                .get()
                .filter(Boolean);

            const uniqueArticles = articles.filter(
                (article, index, self) =>
                    index === self.findIndex((a) => a.url === article.url)
            );

            if (uniqueArticles.length > 0) {
                sections.push({
                    category,
                    articles: uniqueArticles,
                });
            }
        });

        return {
            featuredArticles,
            sections,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { voaIndonesiaNews };
