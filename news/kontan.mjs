import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeKontan() {
    const url = "https://www.kontan.co.id/";
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const headlines = $("#slide-headline > ul.slides > li")
            .map((_, el) => {
                const element = $(el);
                const linkElement = element.find("h1 a");
                return {
                    title: linkElement.text().trim(),
                    link: linkElement.attr("href"),
                    imageUrl: element.find("img.image-left").attr("src"),
                    summary: element
                        .find(".kanana-hl > .mar-t-20")
                        .text()
                        .trim(),
                };
            })
            .get();

        const latestNews = $("div.list-berita")
            .first()
            .find("ul > li")
            .map((_, el) => {
                const element = $(el);
                const linkElement = element.find("h1 a");
                return {
                    title: linkElement.text().trim(),
                    link: linkElement.attr("href"),
                    imageUrl: element.find(".pic img").attr("data-src"),
                    category: element
                        .find(".ket .linkto-orange a")
                        .text()
                        .trim(),
                    timestamp: element
                        .find(".ket .font-gray")
                        .text()
                        .trim()
                        .replace("|", "")
                        .trim(),
                };
            })
            .get();

        const marketIndicators = $(".indikator-slide ul li")
            .map((_, el) => {
                const element = $(el);
                const name = element.find("strong").text().trim();
                const values = element
                    .text()
                    .replace(name, "")
                    .trim()
                    .split(/\s+/);
                return {
                    name,
                    price: values[0] || null,
                    change: values[1] || null,
                    percentageChange: values.pop() || null,
                };
            })
            .get();

        const kontanTv = $(".group-tv .blok-tv")
            .map((_, el) => {
                const element = $(el);
                const linkElement = element.find("h1 a");
                return {
                    title: linkElement.text().trim(),
                    link: linkElement.attr("href"),
                    thumbnailUrl: element.find("img").attr("data-src"),
                };
            })
            .get();

        const businessInsight = $('div.head-sec:contains("BUSINESS INSIGHT")')
            .next(".kotak-780")
            .find(".kotak-fokus")
            .map((_, el) => {
                const element = $(el);
                const linkElement = element.find("h1 a");
                return {
                    title: linkElement.text().trim(),
                    link: linkElement.attr("href"),
                    imageUrl: element.find("img").attr("data-src"),
                };
            })
            .get();

        const mostPopular = $("#berita-terpopuler")
            .first()
            .find(".listi-terpopuler li")
            .map((_, el) => {
                const element = $(el);
                const linkElement = element.find("h1 a");
                return {
                    title: linkElement.text().trim(),
                    link: linkElement.attr("href"),
                };
            })
            .get();

        return {
            source: url,
            marketIndicators,
            headlines,
            latestNews,
            kontanTv,
            businessInsight,
            mostPopular,
        };
    } catch (error) {
        throw new Error(`Scraping failed for ${url}: ${error.message}`);
    }
}

export { scrapeKontan };
