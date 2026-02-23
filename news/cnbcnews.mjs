import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeCNBC() {
    const url = "https://www.cnbc.com/";
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const featuredNews = {
            mainArticle: {
                title: $(
                    "div.FeaturedCard-container h2.FeaturedCard-packagedCardTitle a"
                )
                    .text()
                    .trim(),
                link:
                    $(
                        "div.FeaturedCard-container h2.FeaturedCard-packagedCardTitle a"
                    ).attr("href") || "",
                image:
                    $("div.FeaturedCard-imageContainer picture img").attr(
                        "src"
                    ) || "",
            },
            relatedArticles: $("ul.PackageItems-container li")
                .map((_, el) => ({
                    title: $(el).find("a").text().trim(),
                    link: $(el).find("a").attr("href") || "",
                }))
                .get(),
        };

        const latestNews = $("ul.LatestNews-list li.LatestNews-item")
            .map((_, el) => ({
                title: $(el).find("a.LatestNews-headline").text().trim(),
                link: $(el).find("a.LatestNews-headline").attr("href") || "",
                timestamp: $(el)
                    .find("time.LatestNews-timestamp")
                    .text()
                    .trim(),
            }))
            .get();

        const trendingNow = $(
            "ul.TrendingNow-storyContainer li.TrendingNowItem-storyItem"
        )
            .map((_, el) => ({
                rank: $(el).find(".TrendingNowItem-number").text().trim(),
                title: $(el).find(".TrendingNowItem-title").text().trim(),
                link:
                    $(el)
                        .find(".TrendingNowItem-title")
                        .parent()
                        .attr("href") || "",
            }))
            .get();

        const marketMovers = [];
        $("section.MarketMovers-container .MarketTop-topTable").each(
            (index, table) => {
                const type = $(table).prev(".MarketTop-title").text().trim();
                const movers = $(table)
                    .find("tr")
                    .map((_, row) => ({
                        symbol: $(row)
                            .find(".MarketTop-symbol a")
                            .text()
                            .trim(),
                        name: $(row).find(".MarketTop-name div").text().trim(),
                        value: $(row).find(".MarketTop-value").text().trim(),
                        change: $(row)
                            .find(".MarketTop-quoteChange")
                            .text()
                            .trim(),
                    }))
                    .get();
                marketMovers.push({ type, movers });
            }
        );

        return {
            featuredNews,
            latestNews,
            trendingNow,
            marketMovers,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeCNBC };
