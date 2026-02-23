import axios from "axios";
import * as cheerio from "cheerio";

async function tempoNews() {
    const baseUrl = "https://www.tempo.co";
    try {
        const { data: html } = await axios.get(baseUrl, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
        });

        const $ = cheerio.load(html);

        const getFullUrl = (path) => {
            if (!path) return null;
            if (path.startsWith("http")) return path;
            if (path.startsWith("/")) return `${baseUrl}${path}`;
            return `${baseUrl}/${path}`;
        };

        const mainContent = $("div.w-full.lg:w-[736px]");

        const heroArticleElement = mainContent
            .find("section#hero article")
            .first();
        const hero = {
            mainArticle: {
                title: heroArticleElement.find("p > a").text().trim(),
                url: getFullUrl(heroArticleElement.find("p > a").attr("href")),
                isTempoPlus:
                    heroArticleElement.find("p > a > span svg").length > 0,
            },
            subArticles: mainContent
                .find("section#hero .lg:divide-x article")
                .map((_, el) => {
                    const link = $(el).find("a");
                    return {
                        title: link.text().trim(),
                        url: getFullUrl(link.attr("href")),
                        isTempoPlus: link.find("span svg").length > 0,
                    };
                })
                .get(),
        };

        const latestArticlesSidebar = $(
            "aside.lg:w-[308px] aside.border-b article"
        )
            .map((_, el) => {
                const link = $(el).find("figcaption a");
                return {
                    title: link.text().trim(),
                    url: getFullUrl(link.attr("href")),
                    isTempoPlus: link.find("span svg").length > 0,
                };
            })
            .get();

        const trendingSection = $(
            'span.font-bold:contains("ARTIKEL TRENDING")'
        ).closest(".flex-col");
        const trendingArticles = [];
        trendingSection.find(".lg:flex-row-reverse article").each((i, el) => {
            const link = $(el).find("a");
            const title = $(el).find("figcaption p a").text().trim();
            const isTempoPlus = $(el).find("span svg").length > 0;
            trendingArticles.push({
                title,
                url: getFullUrl(link.attr("href")),
                isTempoPlus,
            });
        });

        const tempoPlusSection = $("section.bg-black article.card--landscape")
            .map((_, el) => ({
                title: $(el).find("p.card__title a").text().trim(),
                url: getFullUrl($(el).find("a").attr("href")),
                description:
                    $(el)
                        .attr("description")
                        ?.replace(/<[^>]*>/g, "")
                        .trim() || null,
            }))
            .get();

        const columnists = [];
        $('span.text-lg.font-bold:contains("KOLOM")')
            .closest(".py-6")
            .find("article")
            .each((_, el) => {
                columnists.push({
                    author: $(el)
                        .find("span.text-base.font-bold")
                        .text()
                        .trim(),
                    title: $(el).find("span.card__title").text().trim(),
                    url: getFullUrl($(el).find("a").attr("href")),
                });
            });

        const photoSection = $('div.flex-row:contains("FOTO")')
            .parent()
            .find("article")
            .map((_, el) => ({
                title: $(el).find("div.card__title a span").text().trim(),
                url: getFullUrl($(el).find("a").attr("href")),
            }))
            .get();

        const videoSection = $('div.flex-row:contains("VIDEO")')
            .parent()
            .find("article")
            .map((_, el) => ({
                title: $(el).find("div.card__title a span").text().trim(),
                url: getFullUrl($(el).find("a").attr("href")),
            }))
            .get();

        const jaringanTempoMedia = [];
        $('span:contains("JARINGAN TEMPO MEDIA")')
            .next("div")
            .find("article")
            .each((_, el) => {
                jaringanTempoMedia.push({
                    title: $(el).find("span").text().trim(),
                    url: $(el).find("a").attr("href"),
                    image: $(el).find('img[alt="Content Image"]').attr("src"),
                    sourceLogo: $(el)
                        .find('img[alt="Source Logo"]')
                        .attr("src"),
                });
            });

        const categorySections = [];
        mainContent.find("> div.flex-col.mt-6").each((_, sectionEl) => {
            const categoryTitle = $(sectionEl)
                .find("> div:first-child span.font-bold")
                .text()
                .trim();
            if (categoryTitle) {
                const mainArticleEl = $(sectionEl).find("article").first();
                const mainArticle = {
                    title: mainArticleEl.find("figcaption p a").text().trim(),
                    url: getFullUrl(mainArticleEl.find("a").attr("href")),
                    summary:
                        mainArticleEl
                            .find("div.font-roboserif")
                            .text()
                            .trim() || null,
                    image: mainArticleEl.find("img").attr("src"),
                    isTempoPlus: mainArticleEl.find("span svg").length > 0,
                };

                const otherArticles = mainArticleEl
                    .next("div")
                    .find("article")
                    .map((_, el) => ({
                        title: $(el).find("p a").text().trim(),
                        url: getFullUrl($(el).find("a").attr("href")),
                        isTempoPlus: $(el).find("span svg").length > 0,
                    }))
                    .get();

                categorySections.push({
                    category: categoryTitle,
                    mainArticle,
                    otherArticles,
                });
            }
        });

        return {
            hero,
            latestArticlesSidebar,
            trendingArticles,
            tempoPlusSection,
            columnists,
            photoSection,
            videoSection,
            categorySections,
            jaringanTempoMedia,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { tempoNews };
