import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeGrowaGardenRedeemCodes() {
    try {
        const { data: html } = await axios.get('https://robloxden.com/game-codes/grow-a-garden', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });
        
        const $ = cheerio.load(html);

        const pageTitle = $('h1.jumbotron__header').text().trim();
        const lastChecked = $('.game-codes__lc-date').text().trim();

        const codes = [];
        $('#table-view tbody tr').each((i, el) => {
            const code = $(el).find('td:nth-child(1) span.content-editable').text().trim();
            const description = $(el).find('td:nth-child(2)').text().trim().replace(/^This code credits your account with\s+/, '');
            const status = $(el).find('td:nth-child(3) .badge').text().trim();

            if (code) {
                codes.push({
                    code,
                    description,
                    status
                });
            }
        });

        const activeCodes = codes.filter(c => c.status.toLowerCase() !== 'expired');
        const expiredCodes = codes.filter(c => c.status.toLowerCase() === 'expired');

        return {
            pageTitle,
            lastChecked,
            activeCodeCount: activeCodes.length,
            expiredCodeCount: expiredCodes.length,
            activeCodes,
            expiredCodes
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeGrowAGardenStockNow() {
    const baseUrl = 'https://www.growagardenstocknow.com';
    try {
        const { data: html } = await axios.get(`${baseUrl}/`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36' }
        });

        const $ = cheerio.load(html);

        const extractItems = (el, selector) => {
            return $(el).find(selector).map((_, item) => {
                const name = $(item).find('span.text-\[15px\]').text().trim();
                const quantityText = $(item).find('span.text-\[13px\]').text().trim();
                const imageUrl = $(item).find('img').attr('src');

                return {
                    name: name || $(item).find('span').first().text().trim(),
                    quantity: quantityText.replace('Qty: ', '').trim() || null,
                    image: imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`,
                };
            }).get();
        };

        const stockSections = $('section[aria-label="Stock Sections"] > article').map((_, el) => {
            const title = $(el).find('header h2').text().trim();
            const status = $(el).find('header > div').text().trim();

            if (title.includes('Seeds Stock')) {
                const categories = [];
                $(el).find('h3').each((i, h3) => {
                    const categoryTitle = $(h3).find('span').eq(1).text().trim();
                    const items = extractItems($(h3).next('ul'), 'li');
                    categories.push({ category: categoryTitle, items });
                });
                return { title, status, categories };
            } else {
                 const items = extractItems(el, 'ul li');
                 return { title, status, items };
            }
        }).get();

        const latestBlogPosts = $('section:has(h2:contains("Latest Blog Posts")) > ul > li').map((_, el) => ({
            title: $(el).find('a').text().trim(),
            link: new URL($(el).find('a').attr('href'), baseUrl).href,
            description: $(el).find('p').text().trim(),
        })).get();

        return {
            pageTitle: $('header h1').text().trim(),
            pageSubtitle: $('header p.text-sm').text().trim().replace(/\s+/g, ' '),
            currentWeather: {
                status: $('section[aria-label="Weather Info"] #weather_1 > span:nth-of-type(2)').text().trim(),
                countdown: $('section[aria-label="Weather Info"] #weather_1 > span:nth-of-type(3)').text().trim(),
            },
            stockSections,
            latestBlogPosts
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeGrowaGardenRedeemCodes, scrapeGrowAGardenStockNow };

// This comes from: https://gist.github.com/Frenzycore/8ddcaddfddb43952963bf2182d127878