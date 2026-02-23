import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeOkezone() {
    const url = "https://www.okezone.com/";
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const mainHeadline = {
            title: $(".main-headline-left .headline-title").text().trim(),
            link: $(".main-headline-left .headline-title").attr("href"),
            image: $(".main-headline-left .mh-img img").attr("src"),
            category: $(".main-headline-left .headline-kanal").text().trim(),
            timestamp:
                $(".main-headline-left .mh-clock").attr("title") ||
                $(".main-headline-left .mh-clock").text().trim(),
            description: $(".main-headline-left .desk-headline a")
                .text()
                .trim(),
        };

        const otherHeadlines = $(".main-headline-right .headline-right-news")
            .map((_, el) => ({
                title: $(el).find(".jdl-right-headline").text().trim(),
                link: $(el).find(".jdl-right-headline").attr("href"),
                image: $(el).find(".img-headline-right img").attr("src"),
                category: $(el).find(".knl-right-headline a").text().trim(),
            }))
            .get();

        const popularNews = $("#terpopuler-new .grup-terp")
            .map((_, el) => ({
                rank: parseInt($(el).find(".no").text().trim(), 10),
                title: $(el).find(".desc-terp a").last().text().trim(),
                link: $(el).find(".img-terp").attr("href"),
                image: $(el).find(".img-terp img").attr("src"),
                category: $(el).find(".desc-terp a").first().text().trim(),
            }))
            .get();

        const liveStream = {
            title: $("#live-stream-new .title-video").text().trim(),
            videoUrl: $("#live-stream-new .box-video iframe").attr("src"),
        };

        return {
            pageTitle: $("title").text().trim(),
            liveStream,
            mainHeadline,
            otherHeadlines,
            popularNews,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeOkezone };
