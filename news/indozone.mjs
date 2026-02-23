import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeIndoZone() {
    const url = "https://indozone.co.id/";
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const extractBackgroundImageUrl = (element) => {
            const style = $(element).attr("style");
            const urlMatch = style ? style.match(/url\('?(.*?)'?\)/) : null;
            return urlMatch ? urlMatch[1] : null;
        };

        const breakingNews = $(".bs-latest-news-slider .swiper-slide a")
            .map((_, el) => ({
                title: $(el).find("span").text().trim(),
                link: $(el).attr("href"),
            }))
            .get();

        const mainFeatured = $(".homemain .swiper-slide")
            .map((_, el) => ({
                title: $(el).find("h4.title a").text().trim(),
                link: $(el).find("a.link-div").attr("href"),
                image: $(el).find("figure.bs-thumb-bg img").attr("src"),
                category: $(el).find(".bs-blog-category a").text().trim(),
            }))
            .get();

        const featuredMainStoryElement = $(
            "#featured_post_widget-1 .colinn .bs-blog-post.lg"
        );
        const featuredMainStory = {
            title: featuredMainStoryElement.find("h4.title a").text().trim(),
            link: featuredMainStoryElement.find("a.link-div").attr("href"),
            image: extractBackgroundImageUrl(featuredMainStoryElement),
            category: featuredMainStoryElement
                .find(".bs-blog-category a")
                .text()
                .trim(),
            author: featuredMainStoryElement.find(".bs-author a").text().trim(),
            date: featuredMainStoryElement
                .find(".bs-blog-date time")
                .text()
                .trim(),
        };

        const featuredSideStories = $(
            "#featured_post_widget-1 .colinn .small-post"
        )
            .map((_, el) => ({
                title: $(el).find("h5.title a").text().trim(),
                link: $(el).find("a.link-div").attr("href"),
                image: extractBackgroundImageUrl($(el).find(".img-small-post")),
                category: $(el).find(".bs-blog-category a").text().trim(),
                date: $(el).find(".bs-blog-date time").text().trim(),
            }))
            .get();

        const latestNews = $("#newsxo_latest_post-1 .bs-blog-post.list-blog")
            .map((_, el) => ({
                title: $(el).find("h4.entry-title a").text().trim(),
                link: $(el).find("a.link-div").attr("href"),
                image: extractBackgroundImageUrl(
                    $(el).find(".bs-blog-thumb .back-img")
                ),
                category: $(el)
                    .find("article .bs-blog-category a")
                    .first()
                    .text()
                    .trim(),
                summary: $(el).find("article p").text().trim(),
            }))
            .get();

        const trending = $("#popular_tab_widget-1 #tabbed-1-home .small-post")
            .map((_, el) => ({
                title: $(el).find("h5.title a").text().trim(),
                link: $(el).find("a.link-div").attr("href"),
                image: extractBackgroundImageUrl($(el).find(".img-small-post")),
                category: $(el).find(".bs-blog-category a").text().trim(),
                date: $(el).find(".bs-blog-date time").text().trim(),
            }))
            .get();

        const youMissed = $(".missed .missedslider .bs-blog-post.three")
            .map((_, el) => ({
                title: $(el).find("h4.title a").text().trim(),
                link: $(el).find("a.link-div").attr("href"),
                image: extractBackgroundImageUrl(
                    $(el).find("figure.bs-thumb-bg")
                ),
                category: $(el).find(".bs-blog-category a").text().trim(),
            }))
            .get();

        return {
            source: "IndoZone",
            breakingNews,
            mainFeatured,
            featuredPosts: {
                mainStory: featuredMainStory,
                sideStories: featuredSideStories,
            },
            latestNews,
            trending,
            youMissed,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeIndoZone };
