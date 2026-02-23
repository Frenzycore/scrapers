import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeRobloxPromoCodes() {
    const targetUrl = "https://robloxden.com/promo-codes";

    try {
        const { data: html } = await axios.get(targetUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const promoItems = $(".promo-codes__container .image-card")
            .map((_, element) => {
                const card = $(element);

                const title = card.find(".image-card__title").text().trim();
                const description = card
                    .find(".image-card__description")
                    .text()
                    .trim();
                const imageUrl =
                    card.find(".image-card__image").attr("data-src") || null;
                const assetId = card.data("asset-id")?.toString() || null;
                const tags = JSON.parse(card.attr("data-tags") || "[]");
                const itemType = tags[0] || "unknown";

                const promoCode =
                    card
                        .find(".codes-list__copy-container .content-editable")
                        .text()
                        .trim() || null;
                const claimInstructions =
                    card
                        .find(".image-card__claim-text")
                        .text()
                        .trim()
                        .replace(/\s+/g, " ") || null;

                const eventTitle =
                    card.find(".image-card__event-title").text().trim() || null;
                const eventRequirement =
                    card.find(".image-card__event-reward").text().trim() ||
                    null;
                const gameLink =
                    card
                        .find(
                            'a.image-card__event-button[href*="roblox.com/games"]',
                        )
                        .attr("href") || null;

                const claimDetails = {
                    instructions: claimInstructions,
                    eventName: eventTitle,
                    requirement: eventRequirement,
                    gameLink: gameLink,
                };
                return {
                    title,
                    description,
                    imageUrl,
                    assetId,
                    itemType,
                    promoCode,
                    claimDetails,
                };
            })
            .get();

        const pageTitle = $("h1.jumbotron__header").text().trim();
        const pageSubtitle = $(".jumbotron__subheader").text().trim();
        const totalCodesText = $(".card__content p strong").text().trim();
        return {
            source: targetUrl,
            pageTitle,
            pageSubtitle,
            totalActiveCodes: parseInt(totalCodesText, 10) || null,
            promoItems,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeRobloxPromoCodes };

// This comes from: https://gist.github.com/Frenzycore/9cc9be8b1b2463698c5ff5228ec501bb