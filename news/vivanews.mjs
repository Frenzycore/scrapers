import axios from "axios";
import * as cheerio from "cheerio";

async function vivaNews() {
    try {
        const { data: html } = await axios.get("https://www.viva.co.id/", {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const headlineArticles = $(".headline .article-list-row")
            .map((_, el) => {
                const element = $(el);
                const title = element
                    .find(".article-list-title h2")
                    .text()
                    .trim();
                const link = element
                    .find("a.article-list-thumb-link")
                    .attr("href");
                const image = element
                    .find("img.lazyload")
                    .attr("data-original");
                const category = element
                    .find(".article-list-cate h3")
                    .text()
                    .trim();
                const time = element
                    .find(".article-list-date span")
                    .text()
                    .trim();
                return { title, link, image, category, time };
            })
            .get();

        const latestArticles = $("#load-content .article-list-row")
            .map((_, el) => {
                const element = $(el);
                const title = element
                    .find(".article-list-title h2")
                    .text()
                    .trim();
                const link = element
                    .find("a.article-list-thumb-link")
                    .attr("href");
                const image = element
                    .find("img.lazyload")
                    .attr("data-original");
                const category = element
                    .find(".article-list-cate h3")
                    .text()
                    .trim();
                const time = element
                    .find(".article-list-date span")
                    .text()
                    .trim();
                const description = element
                    .find(".article-list-desc")
                    .text()
                    .trim();
                return { title, link, image, category, time, description };
            })
            .get();

        const partnerArticles = $(
            'div.section-title:contains("Partner Network")'
        )
            .next(".article-list-container")
            .find(".article-list-row")
            .map((_, el) => {
                const element = $(el);
                const title = element
                    .find(".article-list-title h2")
                    .text()
                    .trim();
                const link = element
                    .find("a.article-list-thumb-link")
                    .attr("href");
                const image = element
                    .find("img.lazyload")
                    .attr("data-original");
                const network = element.find(".title-network h3").text().trim();
                const time = element
                    .find(".article-list-date span")
                    .text()
                    .trim();
                return { title, link, image, network, time };
            })
            .get();

        const trendingTopics = $(".side-trending a.side-trending-link")
            .map((_, el) => {
                const element = $(el);
                const topic = element.find(".stl-title").text().trim();
                const link = element.attr("href");
                return { topic, link };
            })
            .get();

        const popularSidebar = $(
            '.column-small .section-title:contains("Terpopuler")'
        )
            .next(".article-list-container")
            .find(".article-list-row")
            .map((_, el) => {
                const element = $(el);
                const title = element
                    .find(".article-list-title h2")
                    .text()
                    .trim();
                const link = element
                    .find("a.article-list-thumb-link")
                    .attr("href");
                const image = element
                    .find("img.lazyload")
                    .attr("data-original");
                const category = element
                    .find(".article-list-cate h3")
                    .text()
                    .trim();
                const date = element
                    .find(".article-list-date span")
                    .text()
                    .trim();
                return { title, link, image, category, date };
            })
            .get();

        return {
            headlineArticles,
            latestArticles,
            partnerArticles,
            trendingTopics,
            popularSidebar,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { vivaNews };
