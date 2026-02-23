import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeRctiPlus() {
    const targetUrl = 'https://www.rctiplus.com/';
    try {
        const { data: html } = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            }
        });

        const $ = cheerio.load(html);

        const getMetaData = (name) => $(`meta[name="${name}"]`).attr('content') || null;
        const getOgData = (property) => $(`meta[property="og:${property}"]`).attr('content') || null;
        const getTwitterData = (name) => $(`meta[name="twitter:${name}"]`).attr('content') || null;

        const navigationScript = $('script').filter((_, el) => $(el).html().includes('var jsArray =')).html();
        let navigation = [];
        if (navigationScript) {
            try {
                const navRegex = /var jsArray = (\s*(\[.*?\]))\s*;/;
                const match = navigationScript.match(navRegex);
                if (match && match[1]) {
                    navigation = JSON.parse(match[1]).map(({ name, link }) => ({ name, link }));
                }
            } catch (e) {
                navigation = [];
            }
        }

        const searchRecommendations = $('.popular-search-item .history-search-text')
            .map((_, el) => $(el).text().trim())
            .get();

        const contentSections = $('.lineup-container .title h3')
            .map((_, el) => $(el).text().trim())
            .get();

        const footerSocials = $('.line-socmed a').map((_, el) => ({
            platform: $(el).find('img').attr('alt'),
            url: $(el).attr('href'),
        })).get();

        const footerMenu = $('.footer-menu ul li a').map((_, el) => ({
            text: $(el).text().trim(),
            url: new URL($(el).attr('href'), targetUrl).href,
        })).get();

        const appDownloads = $('#swiper-wrapper-footer a').map((_, el) => ({
            store: $(el).attr('id').replace('imgDownload', ''),
            url: $(el).attr('href'),
        })).get();

        return {
            pageTitle: $('title').text().trim(),
            meta: {
                description: getMetaData('description'),
                keywords: getMetaData('keywords'),
                og: {
                    title: getOgData('title'),
                    description: getOgData('description'),
                    image: getOgData('image'),
                    url: getOgData('url'),
                    siteName: getOgData('site_name'),
                },
                twitter: {
                    card: getTwitterData('card'),
                    title: getTwitterData('title'),
                    description: getTwitterData('description'),
                    image: getTwitterData('image'),
                },
            },
            navigation,
            searchRecommendations,
            contentSections,
            footer: {
                socialLinks: footerSocials,
                menu: footerMenu,
                appDownloads: appDownloads,
            },
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeRctiPlus };