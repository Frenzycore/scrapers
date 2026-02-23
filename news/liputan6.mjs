import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeLiputan6() {
    try {
        const { data: html } = await axios.get("https://www.liputan6.com/", {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const trendingTopics = $(".trending--list__item a")
            .map((_, el) => {
                return {
                    title: $(el).find(".trending__item__title").text().trim(),
                    link: $(el).attr("href"),
                };
            })
            .get();

        const headlineArticle = $(".headline__item--headline");
        const headline = {
            title: headlineArticle.find(".headline__item__title").text().trim(),
            link: headlineArticle.attr("href"),
            image: headlineArticle.find("img").attr("src"),
            publishedAt: headlineArticle.find("time").attr("datetime"),
        };

        const otherHeadlines = $(".headline--main__list__item")
            .map((_, el) => {
                const linkElement = $(el).find("a");
                return {
                    title: linkElement
                        .find(".headline__item__title")
                        .text()
                        .trim(),
                    link: linkElement.attr("href"),
                    publishedAt: linkElement.find("time").attr("datetime"),
                };
            })
            .get();

        const terpopuler = $(".headline--popular__list__item")
            .map((_, el) => {
                const linkElement = $(el).find("a");
                return {
                    title: linkElement
                        .find(".headline__item__title")
                        .text()
                        .trim(),
                    link: linkElement.attr("href"),
                    publishedAt: linkElement.find("time").attr("datetime"),
                };
            })
            .get();

        const beritaPilihan = $(".promotion .promotion-article--list__item")
            .map((_, el) => {
                const linkElement = $(el).find(
                    "a.promotion-article--list__title"
                );
                return {
                    title: linkElement.text().trim(),
                    link: linkElement.attr("href"),
                    image:
                        $(el).find("img").attr("data-original") ||
                        $(el).find("img").attr("src"),
                    category: $(el)
                        .find(".promotion-article--list__tag")
                        .text()
                        .trim(),
                    publishedAt: $(el).find("time.timeago").attr("datetime"),
                };
            })
            .get();

        const fotoPilihan = [];
        const mainPhoto = $(".featured-photo__left");
        fotoPilihan.push({
            title: mainPhoto.find(".featured-photo__caption").text().trim(),
            link: mainPhoto.attr("href"),
            image:
                mainPhoto.find("img").attr("data-original") ||
                mainPhoto.find("img").attr("src"),
            count: mainPhoto.find(".featured-photo__count span").text().trim(),
        });

        $(".featured-photo__right-item").each((_, el) => {
            fotoPilihan.push({
                title: $(el).find(".featured-photo__caption").text().trim(),
                link: $(el).attr("href"),
                image:
                    $(el).find("img").attr("data-original") ||
                    $(el).find("img").attr("src"),
                count: $(el).find(".featured-photo__count span").text().trim(),
            });
        });

        const channelHighlights = $(".channel-highlights__category")
            .map((_, el) => {
                const categoryName = $(el)
                    .find(".channel-highlights__category--title")
                    .text()
                    .trim();
                const articles = $(el)
                    .find(".channel-highlights__item")
                    .map((i, item) => {
                        const linkElement = $(item).find(
                            "a.channel-highlights__link"
                        ).length
                            ? $(item).find("a.channel-highlights__link")
                            : $(item).find("a");
                        return {
                            title: $(item)
                                .find(".channel-highlights__text a")
                                .text()
                                .trim(),
                            link: linkElement.attr("href"),
                            image:
                                $(item).find("img").attr("data-original") ||
                                $(item).find("img").attr("src") ||
                                null,
                            publishedAt: $(item)
                                .find("time.timeago")
                                .attr("datetime"),
                        };
                    })
                    .get()
                    .filter((article) => article.title);

                return {
                    category: categoryName,
                    articles: articles,
                };
            })
            .get();

        return {
            pageTitle: $("title").text().trim(),
            trendingTopics,
            mainHeadline: headline,
            otherHeadlines,
            terpopuler,
            beritaPilihan,
            fotoPilihan,
            channelHighlights,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeLiputan6 };
