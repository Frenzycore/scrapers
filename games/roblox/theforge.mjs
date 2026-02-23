import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeTheForge() {
    const targetUrl = "https://robloxden.com/game-codes/the-forge";

    try {
        const { data: html } = await axios.get(targetUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const gameTitle = $("h1.jumbotron__header").text().trim();
        const gameDescription = $("p.jumbotron__subheader").text().trim();
        const lastChecked = $(".game-codes__lc-info")
            .text()
            .trim()
            .replace(/\s+/g, " ");
        const thumbnailUrl = $("img.jumbotron__image").attr("data-enlarged");

        const codeStatsText = $(".jumbotron__image-text")
            .map((i, el) => $(el).text().trim())
            .get();
        const codeStats = {
            active: parseInt(codeStatsText[0]?.match(/\d+/)?.[0] || "0", 10),
            expired: parseInt(codeStatsText[1]?.match(/\d+/)?.[0] || "0", 10),
        };

        const extractCodes = (selector) => {
            return $(selector)
                .map((i, el) => {
                    const row = $(el);
                    return {
                        code: row
                            .find("td:nth-child(1) .content-editable")
                            .text()
                            .trim(),
                        description: row.find("td:nth-child(2)").text().trim(),
                        status: row
                            .find("td:nth-child(3) .badge")
                            .text()
                            .trim(),
                        statusNote:
                            row
                                .find("td:nth-child(3) .badge")
                                .attr("data-tooltip")
                                ?.trim() || null,
                    };
                })
                .get();
        };

        const activeCodes = extractCodes(
            '#table-view tbody tr[data-expired="false"]',
        );
        const expiredCodes = extractCodes(
            '#table-view tbody tr[data-expired="true"]',
        );

        const howToRedeem = $("#help")
            .closest(".card")
            .find(".card__content")
            .text()
            .trim()
            .replace(/\n\s*\n/g, "\n");
        const aboutGame = $("#about")
            .closest(".card")
            .find(".card__content")
            .text()
            .trim();

        return {
            gameTitle,
            gameDescription,
            lastChecked,
            thumbnailUrl,
            codeStats,
            activeCodes,
            expiredCodes,
            howToRedeem,
            aboutGame,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeTheForge };

// This comes from: https://gist.github.com/Frenzycore/de25a36cdf59ec7cebcb49d8758816f0