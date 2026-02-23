import axios from "axios";
import * as cheerio from "cheerio";

async function antaraNews() {
    try {
        const { data: html } = await axios.get("https://www.antaranews.com/", {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const topStories = $("#top-slider .item")
            .map((_, el) => {
                const element = $(el);
                const titleElement = element.find(".card__post__title h2 a");
                const imageElement = element.find("picture img");

                return {
                    title:
                        titleElement.attr("title") ||
                        titleElement.text().trim(),
                    link: titleElement.attr("href"),
                    image:
                        imageElement.attr("data-src") ||
                        imageElement.attr("src"),
                    category: element
                        .find(".card__post__category")
                        .text()
                        .trim(),
                };
            })
            .get();

        const editorsPicks = $("#editor_picks .item .article__entry")
            .map((_, el) => {
                const element = $(el);
                const titleElement = element.find("h3.post_title_medium a");
                const imageElement = element.find(".article__image img");

                return {
                    title:
                        titleElement.attr("title") ||
                        titleElement.text().trim(),
                    link: titleElement.attr("href"),
                    image:
                        imageElement.attr("data-src") ||
                        imageElement.attr("src"),
                    category: element
                        .find("ul.list-inline .text-primary")
                        .text()
                        .trim(),
                    type: element.find("h4.slug a").text().trim() || null,
                };
            })
            .get();

        const latestNews = $(
            ".popular__section-news .col-md-8 .card__post-list"
        )
            .map((_, el) => {
                const element = $(el);
                const titleElement = element.find(".card__post__title a");
                const imageElement = element.find(".image-sm img");

                return {
                    title:
                        titleElement.attr("title") ||
                        titleElement.text().trim(),
                    link: titleElement.attr("href"),
                    image:
                        imageElement.attr("data-src") ||
                        imageElement.attr("src"),
                    time: element
                        .find(".card__post__author-info span")
                        .text()
                        .trim(),
                };
            })
            .get();

        const mostPopular = $('aside h4:contains("Terpopuler")')
            .next(".wrapper__list-number")
            .find(".card__post-list")
            .map((_, el) => {
                const element = $(el);
                const titleElement = element.find(".card__post__title a");
                const imageElement = element.find(".image-sm img");

                return {
                    title:
                        titleElement.attr("title") ||
                        titleElement.text().trim(),
                    link: titleElement.attr("href"),
                    image:
                        imageElement.attr("data-src") ||
                        imageElement.attr("src"),
                    time: element
                        .find(".card__post__author-info span")
                        .text()
                        .trim(),
                    category: element.find("h4.slug a").text().trim() || null,
                };
            })
            .get();

        const politicsSection = $('h4.border_section:contains("Politik")')
            .parent()
            .find(".article__entry")
            .map((_, el) => {
                const element = $(el);
                const titleElement = element.find("h3 a");
                const imageElement = element.find("img");
                return {
                    title:
                        titleElement.attr("title") ||
                        titleElement.text().trim(),
                    link: titleElement.attr("href"),
                    image:
                        imageElement.attr("data-src") ||
                        imageElement.attr("src"),
                    time: element.find(".list-inline-item span").text().trim(),
                };
            })
            .get();

        const economySection = $('h4.border_section:contains("Ekonomi")')
            .parent()
            .find(".article__entry")
            .map((_, el) => {
                const element = $(el);
                const titleElement = element.find("h3 a");
                const imageElement = element.find("img");
                return {
                    title:
                        titleElement.attr("title") ||
                        titleElement.text().trim(),
                    link: titleElement.attr("href"),
                    image:
                        imageElement.attr("data-src") ||
                        imageElement.attr("src"),
                    time: element.find(".list-inline-item span").text().trim(),
                };
            })
            .get();

        return {
            topStories,
            editorsPicks,
            latestNews,
            mostPopular,
            politics: politicsSection,
            economy: economySection,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { antaraNews };
