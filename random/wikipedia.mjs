import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeWikipediaRandom() {
    const url = "https://wikipedia.org/wiki/Special:Random";
    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            },
        });

        const html = response.data;
        const finalUrl = response.request.res.responseUrl;
        const $ = cheerio.load(html);

        const title = $("#firstHeading").text().trim();
        const shortDescription =
            $("div.shortdescription").text().trim() || null;

        const leadParagraphs = $(".mw-parser-output > p:not(.mw-empty-elt)")
            .map((i, el) => $(el).text().trim())
            .get()
            .slice(0, 2)
            .join("\n\n");

        const infoboxData = {};
        $("table.infobox tr").each((index, element) => {
            const key = $(element).find("th").text().trim();
            const value = $(element)
                .find("td")
                .text()
                .trim()
                .replace(/\s\s+/g, " ");
            if (key && value) {
                infoboxData[key] = value;
            }
        });

        const mainImageUrl = $("table.infobox")
            .find(".infobox-image img")
            .attr("src");
        const mainImage = mainImageUrl ? `https:${mainImageUrl}` : null;

        const tableOfContents = $("#toc ul li a .toctext")
            .map((i, el) => $(el).text().trim())
            .get();

        const categories = $("#catlinks ul li a")
            .map((i, el) => $(el).text().trim())
            .get();

        const externalLinks = [];
        $("#External_links")
            .parent()
            .nextAll("ul")
            .first()
            .find("li a.external")
            .each((i, el) => {
                externalLinks.push({
                    text: $(el).text().trim(),
                    url: $(el).attr("href"),
                });
            });

        const coordinatesText = $("#coordinates .geo-dec").text().trim();
        const coordinates =
            coordinatesText || $("#coordinates .geo-dms").text().trim() || null;

        return {
            title,
            url: finalUrl,
            shortDescription,
            leadParagraphs,
            mainImage,
            coordinates,
            infobox: Object.keys(infoboxData).length > 0 ? infoboxData : null,
            tableOfContents:
                tableOfContents.length > 0 ? tableOfContents : null,
            categories: categories.length > 0 ? categories : null,
            externalLinks: externalLinks.length > 0 ? externalLinks : null,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeWikipediaRandom };

// This comes from: https://gist.github.com/Frenzycore/6e4b2739868a9e2f47c222241e51a9df