import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeInewsId() {
    try {
        const { data: html } = await axios.get("https://www.inews.id/", {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const headlineNews = $("section.widgetNewsHeadline article.cardArticle")
            .map((_, el) => ({
                title: $(el).find("h2.cardTitle").text().trim(),
                link: $(el).find("a").attr("href"),
                image: $(el).find("img.thumbCard").attr("src"),
                category: $(el).find(".kanal").text().trim(),
            }))
            .get();

        const popularNews = $("section.widgetPopular article.cardPopular")
            .map((_, el) => ({
                title: $(el).find("h4.cardTitle").text().trim(),
                link: $(el).find("a").attr("href"),
                image: $(el).find("img.thumbCard").attr("src"),
                category: $(el).find(".kanal").text().trim(),
            }))
            .get();

        const latestNews = $(".widgetListArticle.row article.cardArticle")
            .map((_, el) => ({
                title: $(el).find("h4.cardTitle").text().trim(),
                link: $(el).find("a").attr("href"),
                image: $(el).find("img.thumbCard").attr("src"),
                category: $(el).find(".kanal").text().trim(),
                postTime: $(el).find(".postTime").text().trim() || null,
            }))
            .get();

        const editorsChoice = $(
            'section.widgetListArticle.col:has(h3:contains("Editor Choice")) article.cardArticle'
        )
            .map((_, el) => ({
                title: $(el).find("h4.cardTitle").text().trim(),
                link: $(el).find("a").attr("href"),
                image: $(el).find("img.thumbCard").attr("src"),
                category: $(el).find(".kanal").text().trim(),
            }))
            .get();

        const videoHighlights = $(
            "section.widgetVideoHighlight .playList .listPlayer"
        )
            .map((_, el) => ({
                title:
                    $(el).data("title") ||
                    $(el).find("h2.cardTitle").text().trim(),
                videoLink: $(el).data("link"),
                thumbnail: $(el).find("img.thumbCard").attr("src"),
            }))
            .get();

        return {
            pageTitle: $("title").first().text().trim(),
            headlineNews,
            popularNews,
            latestNews,
            editorsChoice,
            videoHighlights,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeInewsId };
