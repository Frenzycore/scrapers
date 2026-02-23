import axios from "axios";
import * as cheerio from "cheerio";

async function suaraNews() {
    try {
        const { data: html } = await axios.get("https://www.suara.com/", {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const headlineArticle = {
            title: $(".headline .headline-content h2 a").text().trim(),
            link: $(".headline .headline-content h2 a").attr("href"),
            image: $(".headline .headline-content img").attr("src"),
            category: $(".headline .headline-content .kanal span")
                .first()
                .text()
                .trim(),
            timestamp: $(".headline .headline-content .headline-date")
                .text()
                .trim(),
        };

        const trendingTopics = $(".trending-list ul li a")
            .map((_, el) => ({
                topic: $(el).text().trim(),
                link: "https://www.suara.com" + $(el).attr("href"),
            }))
            .get();

        const subHeadlines = $(".list-item-x .item")
            .map((_, el) => {
                const titleElement = $(el).find("h2 a");
                return {
                    title: titleElement.text().trim(),
                    link: titleElement.attr("href"),
                    image: $(el).find("img").attr("src"),
                    category: $(el).find(".description span").text().trim(),
                };
            })
            .get();

        const latestNews = $(".list-item-y-img-retangle .item")
            .map((_, el) => {
                const linkElement = $(el).find(".text-list-item-y a");
                return {
                    title: linkElement.text().trim(),
                    link: linkElement.attr("href"),
                    image: $(el).find("img").attr("src"),
                    metadata: $(el)
                        .find(".date-list-item-y")
                        .text()
                        .trim()
                        .replace(/\s\s+/g, " "),
                };
            })
            .get();

        const hotTopicsSidebar = $(".sidebar .side-list-item-y-square")
            .first()
            .find(".item")
            .map((_, el) => {
                const linkElement = $(el).find("h2 a");
                return {
                    title: linkElement.text().trim(),
                    link: linkElement.attr("href"),
                    image: $(el).find("img").attr("src"),
                    category: $(el).find("span a.c-default").text().trim(),
                    timestamp: $(el).find("span .date").text().trim(),
                };
            })
            .get();

        return {
            headline: headlineArticle,
            trending: trendingTopics,
            subHeadlines: subHeadlines,
            latestNews: latestNews,
            sidebarHotTopics: hotTopicsSidebar,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { suaraNews };
