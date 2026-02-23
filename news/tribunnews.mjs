import axios from "axios";
import * as cheerio from "cheerio";

async function tribunNews() {
    try {
        const { data: html } = await axios.get("https://www.tribunnews.com/", {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const mainHeadlineElement = $(".highlite .hl_contents").first();
        const mainHeadline = {
            title: mainHeadlineElement.find(".hltitle").text().trim(),
            link: mainHeadlineElement.find("a").attr("href"),
            topic: mainHeadlineElement.find(".hltopic").text().trim(),
            image: mainHeadlineElement.find(".hlimage img").attr("src"),
        };

        const secondaryHeadlines = $(".highlite .hl_contents")
            .slice(1, 5)
            .map((_, element) => {
                const el = $(element);
                return {
                    title: el.find(".hltitle").text().trim(),
                    link: el.find("a").attr("href"),
                    topic: el.find(".hltopic").text().trim(),
                    image: el.find(".hlimage img").attr("src"),
                };
            })
            .get();

        const latestNews = $("#latesthome > .listicle")
            .map((_, element) => {
                const el = $(element);
                if (el.find("h3 a").length === 0) return null;
                return {
                    title: el.find("h3 a").text().trim(),
                    link: el.find("h3 a").attr("href"),
                    topic: el.find(".fbo2.f14.red a").text().trim() || null,
                    category: el.find(".pt5.grey a.tsa-2").text().trim(),
                    timestamp: el.find("time.timeago").text().trim(),
                    image: el.find(".fr img").attr("src"),
                };
            })
            .get()
            .filter(Boolean);

        const popularNews = $(".populer .listicle")
            .map((_, element) => {
                const el = $(element);
                return {
                    title: el.find("h3 a").text().trim(),
                    link: el.find("h3 a").attr("href"),
                    timestamp: el.find("time.timeago").text().trim(),
                    image: el.find(".fr img").attr("src"),
                };
            })
            .get();

        const featuredTopics = [];
        const seenTopics = new Set();
        $('#topil > .w677.topil_item[id^="topik_"]').each((_, element) => {
            const el = $(element);
            const topicTitle = el.find(".topil_btitle a").text().trim();
            if (topicTitle && !seenTopics.has(topicTitle)) {
                seenTopics.add(topicTitle);
                const topicArticles = el
                    .find(".topil_list")
                    .map((_, articleEl) => {
                        const article = $(articleEl);
                        return {
                            title: article.find(".tc_title span").text().trim(),
                            link: article.find("a.fbo2").attr("href"),
                            image: article.find(".tc_img img").attr("src"),
                        };
                    })
                    .get();

                featuredTopics.push({
                    topic: topicTitle,
                    link: el.find(".topil_btitle a").attr("href"),
                    articles: topicArticles,
                });
            }
        });

        return {
            mainHeadline,
            secondaryHeadlines,
            featuredTopics,
            latestNews,
            popularNews,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { tribunNews };
