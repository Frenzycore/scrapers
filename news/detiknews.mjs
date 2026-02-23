import axios from "axios";
import * as cheerio from "cheerio";

async function detikNews() {
    try {
        const { data: html } = await axios.get("https://www.detik.com/", {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const headlineContainer = $(".headline article.media");
        const headline = {
            title: headlineContainer.find(".media__title a").text().trim(),
            link: headlineContainer.find("a.media__link").attr("href"),
            image: headlineContainer.find("img").attr("src"),
            timestamp:
                headlineContainer.find(".media__date span").attr("title") ||
                headlineContainer.find(".media__date").text().trim(),
            related: $(".headline-terkait .list-content__item")
                .map((_, el) => ({
                    title: $(el).find("h3 a").text().trim(),
                    link: $(el).find("h3 a").attr("href"),
                }))
                .get(),
        };

        const newsFeed = $(".section.nhl .list-content .list-content__item")
            .map((_, el) => {
                const articleLink = $(el).find("a.media__link");
                const title = $(el).find("h3.media__title a").text().trim();
                if (!title) return null;

                return {
                    title: title,
                    link: articleLink.attr("href"),
                    image: $(el).find("img").attr("src"),
                    category: $(el).find(".media__subtitle").text().trim(),
                    timestamp:
                        $(el).find(".media__date span").attr("title") ||
                        $(el).find(".media__date").text().trim(),
                };
            })
            .get()
            .filter(Boolean);

        const flashVideos = $(
            ".box.berita-utama .slider-snap__item:not(.slider-snap__item--index)"
        )
            .map((_, el) => ({
                title: $(el).find("img").attr("title"),
                link: $(el).find("a").attr("href"),
                image: $(el).find("img").attr("src"),
            }))
            .get();

        const editorsPicks = $(".cb-pilihan-redaksi .list-content__item")
            .map((_, el) => ({
                title: $(el).find(".media__title a").text().trim(),
                link: $(el).find("a.media__link").attr("href"),
                image: $(el).find("img").attr("src"),
            }))
            .get();

        const mostPopular = $(".box.cb-mostpop .list-content__item")
            .map((_, el) => ({
                rank: $(el).find(".text-list__data").text().trim(),
                title: $(el).find(".media__title a").text().trim(),
                link: $(el).find("a.media__link").attr("href"),
                timestamp:
                    $(el).find(".media__date span").attr("title") ||
                    $(el).find(".media__date").text().trim(),
            }))
            .get();

        return {
            headline,
            flashVideos,
            editorsPicks,
            mostPopular,
            newsFeed,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { detikNews };
