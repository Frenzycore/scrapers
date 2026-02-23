import axios from "axios";
import * as cheerio from "cheerio";

async function tirtoNews() {
    try {
        const { data: html } = await axios.get("https://tirto.id/", {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const extractArticleData = (el) => {
            const element = $(el);
            return {
                title: element
                    .find(".postcard-title a, .list-card-title a")
                    .text()
                    .trim()
                    .replace(/\s\s+/g, " "),
                link: element
                    .find(".postcard-title a, .list-card-title a")
                    .attr("href"),
                image: element.find(".thumbnail img").attr("src"),
                category: element
                    .find(".postcard-label, .list-card-label")
                    .text()
                    .trim(),
                timestamp: element
                    .find(".postcard-timestamp, .list-card-timestamp")
                    .text()
                    .trim(),
                excerpt:
                    element.find(".postcard-excerpt").text().trim() || null,
            };
        };

        const headlineElement = $(".page-hero .postcard-display");
        const headline = {
            title: headlineElement
                .find("h3.postcard-title a")
                .text()
                .trim()
                .replace(/\s\s+/g, " "),
            link: headlineElement.find("h3.postcard-title a").attr("href"),
            image: headlineElement.find(".thumbnail img").attr("src"),
            category: headlineElement.find(".postcard-label").text().trim(),
            timestamp: headlineElement
                .find(".postcard-timestamp")
                .text()
                .trim(),
            excerpt: headlineElement.find(".postcard-excerpt").text().trim(),
        };

        const topStories = $(".page-hero .gridscroll .postcard")
            .map((_, el) => extractArticleData(el))
            .get();

        const editorsChoice = $(".pilihan-editor .postcard")
            .map((_, el) => extractArticleData(el))
            .get();

        const flashNews = $('h2:contains("Flash News")')
            .closest(".section-header")
            .next(".section-body")
            .find(".list-card-small")
            .map((_, el) => {
                const article = extractArticleData(el);
                delete article.excerpt;
                return article;
            })
            .get();

        const popular = $('h2:contains("Populer")')
            .closest(".section-header")
            .next(".section-body")
            .find(".postcard-regular")
            .map((_, el) => {
                const article = extractArticleData(el);
                delete article.excerpt;
                return {
                    rank: parseInt(
                        $(el).find(".postcard-num").text().trim(),
                        10
                    ),
                    ...article,
                };
            })
            .get();

        const sections = [];
        $("section.page-section .section-header").each((_, header) => {
            const sectionTitle = $(header)
                .find("h2.section-title")
                .text()
                .trim();
            const excludedSections = ["Flash News", "Populer"];
            if (sectionTitle && !excludedSections.includes(sectionTitle)) {
                const articles = $(header)
                    .next(".section-body")
                    .find(".postcard")
                    .map((_, el) => extractArticleData(el))
                    .get();
                if (articles.length > 0) {
                    sections.push({
                        sectionTitle,
                        articles,
                    });
                }
            }
        });

        return {
            headline,
            topStories,
            editorsChoice,
            flashNews,
            popular,
            sections,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { tirtoNews };
