import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeSindoNews() {
    try {
        const { data: html } = await axios.get("https://www.sindonews.com/", {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const mainHeadline = {
            title: $(".headline .center .title-headline h1").text().trim(),
            link:
                $(".headline .center .warp-headline > a").attr("href") || null,
            image:
                $(".headline .center .img-headline img").attr("data-src") ||
                null,
            category: $(".headline .center .sub-kanal").text().trim(),
        };

        const sideHeadlines = $(".headline .left .list-headline")
            .map((_, el) => ({
                title: $(el).find(".title-headline").text().trim(),
                link: $(el).find("a").first().attr("href") || null,
                image: $(el).find(".img-headline img").attr("data-src") || null,
                category: $(el).find(".sub-kanal a").text().trim(),
            }))
            .get();

        const latestNews = $(
            ".warp-list-article.list .list-article.latest-event"
        )
            .map((_, el) => ({
                title: $(el).find(".title-article").text().trim(),
                link: $(el).find(".title-article").attr("href") || null,
                image: $(el).find(".img-article img").attr("data-src") || null,
                category: $(el).find(".sub-kanal").text().trim(),
                publishedTime: $(el).find(".date-article").text().trim(),
            }))
            .get();

        const popularNews = $(".terpopuler .warp-list-terpopuler")
            .map((_, el) => ({
                rank: $(el).find(".no-terpopuler").text().trim(),
                title: $(el).find(".title-terpopuler h3 a").text().trim(),
                link: $(el).find(".title-terpopuler h3 a").attr("href") || null,
            }))
            .get();

        const sindoScope = $(".scope .scope-list")
            .map((_, el) => ({
                title:
                    $(el)
                        .find("img")
                        .attr("alt")
                        ?.replace(/\.\.\.$/, "")
                        .trim() || null,
                link: $(el).attr("href") || null,
                image: $(el).find("img").attr("src") || null,
            }))
            .get();

        const sindoNewsTV = $(".wrap-list-news-sindonews-tv .list-news")
            .map((_, el) => ({
                title: $(el).find(".title-list-news").text().trim(),
                link: $(el).find("a").attr("href") || null,
                image: $(el).find("img.lazyload").attr("data-src") || null,
            }))
            .get();

        const trendingTopics = $(".trending .warp-list-trending .tablinks")
            .map((_, el) => ({
                topic: $(el).text().trim(),
                link: $(el).attr("data-url") || null,
            }))
            .get();

        return {
            pageTitle: $("title").text().trim(),
            headline: {
                main: mainHeadline,
                side: sideHeadlines,
            },
            sindoScope,
            sindoNewsTV,
            trendingTopics,
            latestNews,
            popularNews,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeSindoNews };
