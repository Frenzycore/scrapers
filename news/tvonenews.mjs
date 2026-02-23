import axios from "axios";
import * as cheerio from "cheerio";

async function tvoneNews() {
    const url = "https://www.tvonenews.com/";

    try {
        const { data: html } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const mainHeadlines = $(
            "section.main-headline > span > .article-list-row"
        )
            .map((_, el) => {
                const element = $(el);
                return {
                    title: element.find(".ali-title h3").text().trim(),
                    link: element.find("a.alt-link").attr("href"),
                    image: element.find("img").attr("data-original"),
                    category: element.find(".ali-cate a").text().trim(),
                    publishedTime: element.find(".ali-date span").text().trim(),
                };
            })
            .get();

        const footballSchedule = $(
            "div#jadwal-container .card-jadwal-content-item"
        )
            .map((_, el) => {
                const element = $(el);
                const teams = element
                    .find(".daftar-tim-list")
                    .map((_, teamEl) => ({
                        name: $(teamEl).find(".club-name").text().trim(),
                        logo: $(teamEl).find("img").attr("src"),
                    }))
                    .get();
                const scores = element
                    .find(".skor div")
                    .map((_, scoreEl) => $(scoreEl).text().trim())
                    .get();

                return {
                    link: element
                        .find("a.card-jadwal-content-link")
                        .attr("href"),
                    league: element
                        .find(".card-jadwal-content-title")
                        .first()
                        .text()
                        .trim(),
                    status: element
                        .find(
                            ".jadwal-content-right .card-jadwal-content-title.right-title"
                        )
                        .text()
                        .trim(),
                    teams: teams,
                    score:
                        scores.length === 2
                            ? `${scores[0]} - ${scores[1]}`
                            : null,
                };
            })
            .get();

        const latestNews = $(
            'section.article-list:has(h2:contains("Terbaru")) .article-list-row'
        )
            .map((_, el) => {
                const element = $(el);
                return {
                    title: element.find(".ali-title h3").text().trim(),
                    link: element.find("a.alt-link").attr("href"),
                    image: element.find("img").attr("data-original"),
                    category: element.find(".ali-cate a h3").text().trim(),
                    publishedTime: element.find(".ali-date span").text().trim(),
                    description: element.find(".ali-desc").text().trim(),
                };
            })
            .get();

        const latestVideos = $("section.video-list .article-list-row")
            .map((_, el) => {
                const element = $(el);
                return {
                    title: element.find(".ali-title h3").text().trim(),
                    link: element.find("a.alt-link").attr("href"),
                    thumbnail: element.find("img").attr("data-original"),
                    category: element.find(".ali-cate a div").text().trim(),
                    publishedDate: element.find(".ali-date span").text().trim(),
                    duration: element.find(".vlt-duration").text().trim(),
                };
            })
            .get();

        const trendingNews = $(
            '.site-container-small section.article-list:has(h2:contains("Trending")) .article-list-row'
        )
            .map((_, el) => {
                const element = $(el);
                return {
                    title: element.find(".ali-title h3").text().trim(),
                    link: element.find("a.alt-link").attr("href"),
                    image: element.find("img").attr("data-original"),
                    category: element.find(".ali-cate a h3").text().trim(),
                    publishedTime: element.find(".ali-date span").text().trim(),
                    description: element.find(".ali-desc").text().trim(),
                };
            })
            .get();

        const viralTags = $("section.viral-list .viral-link")
            .map((_, el) => {
                const element = $(el);
                return {
                    rank: parseInt(
                        element
                            .find(".viral-number-circle span")
                            .text()
                            .replace("#", ""),
                        10
                    ),
                    tagName: element.find(".viral-title").text().trim(),
                    link: element.attr("href"),
                    articleCount: element.find(".viral-data").text().trim(),
                };
            })
            .get();

        return {
            source: url,
            mainHeadlines,
            footballSchedule,
            latestNews,
            latestVideos,
            trendingNews,
            viralTags,
        };
    } catch (error) {
        throw new Error(`Scraping failed for ${url}: ${error.message}`);
    }
}

export { tvoneNews };
