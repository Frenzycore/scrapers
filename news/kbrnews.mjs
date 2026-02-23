import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeKbrId() {
    const baseUrl = "https://kbr.id";
    try {
        const { data: html } = await axios.get(baseUrl, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const latestArticlesSection = $(
            'section[aria-label="Artikel Terbaru"]'
        );
        const featuredArticleElement = latestArticlesSection
            .children("a.group")
            .first();

        const featuredArticle = {
            title: featuredArticleElement.find("div.font-bold").text().trim(),
            link: baseUrl + featuredArticleElement.attr("href"),
            image: featuredArticleElement.find("img").attr("src"),
            description: featuredArticleElement
                .find("p.text-muted")
                .text()
                .trim(),
        };

        const secondaryArticles = latestArticlesSection
            .find(".grid > div")
            .map((_, el) => {
                const articleLinkElement = $(el).find("a");
                const title =
                    articleLinkElement.find("div.font-bold").text().trim() ||
                    articleLinkElement
                        .find("div.text-sm.font-bold")
                        .text()
                        .trim();
                const image = articleLinkElement.find("img").attr("src");
                const link = articleLinkElement.attr("href");
                const description = articleLinkElement.find("p").text().trim();
                return {
                    title,
                    link: link ? baseUrl + link : null,
                    image,
                    description,
                };
            })
            .get();

        const podcastCarousel = $('div[data-slot="carousel-item"]')
            .map((_, el) => {
                const container = $(el).find(".flex.absolute");
                const titleElement = container.find("a.text-2xl");
                const showElement = container.find("a.text-xs");
                return {
                    title: titleElement.text().trim(),
                    link: baseUrl + titleElement.attr("href"),
                    showName: showElement.text().trim(),
                    showLink: baseUrl + showElement.attr("href"),
                    image: container.find("img").first().attr("src"),
                    description: container
                        .find(".text-sm.text-white.select-none")
                        .text()
                        .trim(),
                };
            })
            .get();

        const serials = $('section[aria-label="Serial"] .grid a')
            .map((_, el) => {
                return {
                    title: $(el).find("div.text-sm").text().trim(),
                    link: $(el).attr("href"),
                    image: $(el).find("img").attr("src"),
                };
            })
            .get();

        return {
            latestArticles: {
                featured: featuredArticle,
                secondary: secondaryArticles,
            },
            podcastCarousel,
            serials,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeKbrId };
