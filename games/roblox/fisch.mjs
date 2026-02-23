import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeFisch() {
    try {
        const { data: html } = await axios.get(
            "https://robloxden.com/game-codes/fisch",
            {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
                },
            },
        );
        const $ = cheerio.load(html);
        const getCodeData = (selector) => {
            return $(selector)
                .map((i, el) => {
                    const code = $(el)
                        .find("td:nth-of-type(1) .content-editable")
                        .text()
                        .trim();
                    const description = $(el)
                        .find("td:nth-of-type(2)")
                        .text()
                        .trim();
                    const status = $(el)
                        .find("td:nth-of-type(3) .badge")
                        .text()
                        .trim();
                    return { code, description, status };
                })
                .get();
        };

        const pageTitle = $("title").text().trim();
        const gameTitle = $("h1.jumbotron__header").text().trim();
        const lastChecked = $(".game-codes__lc-info")
            .text()
            .replace("Last checked for codes:", "")
            .replace(/\s+/g, " ")
            .trim();
        const activeCodeCountText = $(".jumbotron__image-text")
            .first()
            .text()
            .trim();
        const expiredCodeCountText = $(".jumbotron__image-text")
            .last()
            .text()
            .trim();

        const activeCodes = getCodeData(
            "#table-view tbody tr:not(.table__tr-faded)",
        );
        const expiredCodes = getCodeData(
            "#table-view tbody tr.table__tr-faded",
        );

        return {
            pageTitle,
            gameTitle,
            lastChecked,
            activeCodeCountText,
            expiredCodeCountText,
            activeCodes,
            expiredCodes,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeFisch };

// This comes from: https://gist.github.com/Frenzycore/cd2d7f195f68913b52e9c27fc3debe00