import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeMetroTVNews() {
    const url = "https://www.metrotvnews.com/";
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const getMainHeadline = () => {
            const headlineElement = $(".big-news .news-item").first();
            return {
                title: headlineElement.find("h2 a").text().trim(),
                link: headlineElement.find("h2 a").attr("href"),
                imageUrl: headlineElement.find("img").attr("src"),
                category: headlineElement.find(".news-category").text().trim(),
            };
        };

        const getSecondaryHeadlines = () => {
            return $(".small-news .news-item")
                .map((_, el) => {
                    const element = $(el);
                    return {
                        title: element.find("h2 a").text().trim(),
                        link: element.find("h2 a").attr("href"),
                        imageUrl: element.find("img").attr("src"),
                        category: element.find(".news-category").text().trim(),
                    };
                })
                .get();
        };

        const getNewsFromJSONScript = (scriptId) => {
            try {
                const jsonData = JSON.parse($(`script#${scriptId}`).html());
                return jsonData.map((item) => ({
                    title: item.title,
                    link: item.link,
                    imageUrl: item.image,
                    category: item.kanal || null,
                    published: item.date_published,
                }));
            } catch (e) {
                return [];
            }
        };

        const getCarouselNews = (headerText) => {
            return $(`p.header-2:contains("${headerText}")`)
                .closest(".corporate")
                .find(".corporate-slideshow .item-2")
                .map((_, el) => {
                    const element = $(el);
                    return {
                        title: element.find("h2 a").text().trim(),
                        link: element.find("h2 a").attr("href"),
                        imageUrl: element.find("img").attr("src"),
                    };
                })
                .get();
        };

        return {
            mainHeadline: getMainHeadline(),
            secondaryHeadlines: getSecondaryHeadlines(),
            latestNews: getNewsFromJSONScript("dataLatest"),
            popularNews: getNewsFromJSONScript("dataPopular"),
            editorialPicks: getNewsFromJSONScript("dataEditorial"),
            corporateNews: getCarouselNews("CORPORATE NEWS"),
            localNews: getCarouselNews("LOCAL NEWS"),
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeMetroTVNews };
