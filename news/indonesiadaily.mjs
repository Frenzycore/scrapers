import axios from "axios";
import * as cheerio from "cheerio";

async function IndonesiaDaily() {
    const url = "https://indonesiadaily.net/";
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const headlineArticle = {
            title: $(".gmr-big-headline .gmr-rp-biglink a").text().trim(),
            link: $(".gmr-big-headline .gmr-rp-biglink a").attr("href") || null,
            image:
                $(".gmr-big-headline .other-content-thumbnail img").attr(
                    "src"
                ) || null,
            date:
                $(".gmr-big-headline .gmr-metacontent time.entry-date").attr(
                    "datetime"
                ) || null,
            snippet:
                $(".gmr-big-headline .gmr-bigheadline-content p")
                    .text()
                    .trim() || null,
        };

        const relatedArticles = $(
            ".gmr-owl-carousel-bigheadline .gmr-slider-content"
        )
            .map((i, el) => {
                const element = $(el);
                return {
                    title: element.find(".gmr-rp-link a").attr("title"),
                    link: element.find(".gmr-rp-link a").attr("href"),
                    image: element
                        .find(".other-content-thumbnail img")
                        .attr("src"),
                    date: element
                        .find(".gmr-metacontent time")
                        .attr("datetime"),
                };
            })
            .get();

        const latestArticles = $("main#main article.item-content")
            .map((i, el) => {
                const element = $(el);
                return {
                    title: element.find("h2.entry-title a").attr("title"),
                    link: element.find("h2.entry-title a").attr("href"),
                    image: element.find(".content-thumbnail img").attr("src"),
                    category: element
                        .find(".cat-links-content a")
                        .text()
                        .trim(),
                    date: element.find("time.entry-date").attr("datetime"),
                    snippet: element
                        .find(".entry-content-archive p")
                        .text()
                        .trim(),
                };
            })
            .get();

        const popularArticles = $("#bloggingpro-mostview-2 li")
            .map((i, el) => {
                const element = $(el);
                return {
                    title: element.find(".gmr-rp-link a").attr("title"),
                    link: element.find(".gmr-rp-link a").attr("href"),
                    image: element.find("img").attr("src"),
                    category: element
                        .find(".cat-links-content a")
                        .text()
                        .trim(),
                    views: element.find(".meta-view").text().trim(),
                };
            })
            .get();

        const breakingNews = $(".gmr-topnotification .marquee a")
            .map((i, el) => {
                const element = $(el);
                return {
                    title: element.text().trim(),
                    link: element.attr("href"),
                };
            })
            .get();

        return {
            source: url,
            headlineArticle,
            relatedArticles,
            breakingNews,
            latestArticles,
            popularArticles,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { IndonesiaDaily };
