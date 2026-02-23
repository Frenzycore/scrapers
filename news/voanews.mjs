import axios from "axios";
import * as cheerio from "cheerio";

async function voaNews() {
    const baseUrl = "https://www.voanews.com";
    const targetUrl = "https://www.voanews.com/";

    try {
        const { data: html } = await axios.get(targetUrl, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const mainStoryContainer = $(".wg-area-2c .media-block--io").first();
        const mainStory = {
            title: mainStoryContainer
                .find("h4.media-block__title")
                .text()
                .trim(),
            link: new URL(mainStoryContainer.find("a").attr("href"), baseUrl)
                .href,
            imageUrl:
                mainStoryContainer.find("img").attr("data-src") ||
                mainStoryContainer.find("img").attr("src"),
        };

        const topStories = $(".wg-area-1c li.fui-bob-grid")
            .map((_, el) => {
                const element = $(el);
                const linkElement = element.find("a").first();
                const titleElement = element.find("h4.media-block__title");
                const imgElement = element.find("img");

                return {
                    title: titleElement.text().trim(),
                    link: new URL(linkElement.attr("href"), baseUrl).href,
                    imageUrl:
                        imgElement.attr("data-src") || imgElement.attr("src"),
                    category:
                        element.find("span.category").text().trim() || null,
                };
            })
            .get();

        const moreFromVoa = $('div[data-area-id="R5_1"] li.list-w-vert__item')
            .map((_, el) => {
                const element = $(el);
                const linkElement = element.find("a");

                return {
                    title: linkElement
                        .find("h4.media-block__title")
                        .text()
                        .trim(),
                    link: new URL(linkElement.attr("href"), baseUrl).href,
                    category:
                        element.find("span.category").text().trim() ||
                        "General",
                };
            })
            .get();

        const videos = $(".fredContent__slider-item")
            .map((_, el) => {
                const element = $(el);
                const linkElement = element.find("a").first();
                const imgElement = element.find("img");

                return {
                    title: element.find("h4.media-block__title").text().trim(),
                    link: new URL(linkElement.attr("href"), baseUrl).href,
                    thumbnailUrl:
                        imgElement.attr("data-src") || imgElement.attr("src"),
                };
            })
            .get();

        return {
            mainStory,
            topStories,
            moreFromVoa,
            videos,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { voaNews };
