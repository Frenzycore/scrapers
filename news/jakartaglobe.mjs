import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeJakartaGlobe() {
    try {
        const baseUrl = 'https://jakartaglobe.id';
        const { data: html } = await axios.get(baseUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });

        const $ = cheerio.load(html);

        const mainHeadlineElement = $('#headline > div').first();
        const mainHeadline = {
            title: mainHeadlineElement.find('h2').text().trim(),
            link: `${baseUrl}${mainHeadlineElement.find('a').attr('href')}`,
            image: mainHeadlineElement.find('img').attr('src'),
            description: mainHeadlineElement.find('p').text().trim() || null,
            category: mainHeadlineElement.find('.bg-white.text-theme').text().trim(),
        };

        const secondaryHeadlines = $('#headline > div').slice(1).map((_, el) => {
            const element = $(el);
            return {
                title: element.find('h2').text().trim(),
                link: `${baseUrl}${element.find('a').attr('href')}`,
                image: element.find('img').attr('src'),
                category: element.find('.bg-white.text-theme').text().trim(),
            };
        }).get();

        const latestNews = $('#latest-1 .position-relative.flex-grow-1').map((_, el) => {
            const element = $(el);
            return {
                title: element.find('h3').text().trim(),
                link: `${baseUrl}${element.find('a').attr('href')}`,
                image: element.find('img.lazy').attr('data-src'),
                category: element.find('span.text-theme').text().trim(),
                summary: element.find('p.text-muted').text().trim(),
            };
        }).get();

        const specialUpdates = $('#special-updates .col.px-2.position-relative').map((_, el) => {
            const element = $(el);
            return {
                title: element.find('h3').text().trim(),
                link: `${baseUrl}${element.find('a').attr('href')}`,
                image: element.find('img.lazy').attr('data-src'),
            };
        }).get();

        const moreNews = $('#latest-2 .position-relative.flex-grow-1, #latest-3 .position-relative.flex-grow-1').map((_, el) => {
            const element = $(el);
            return {
                title: element.find('h3').text().trim(),
                link: `${baseUrl}${element.find('a').attr('href')}`,
                image: element.find('img.lazy').attr('data-src'),
                category: element.find('span.text-theme').text().trim(),
                summary: element.find('p.text-muted').text().trim(),
            };
        }).get();

        const mostPopular = $('h4:contains("Most Popular")').parent().find('a').map((_, el) => {
            const element = $(el);
            return {
                rank: parseInt(element.find('.fs-2').text().trim(), 10),
                title: element.find('.font-pt-serif.fw-bold').text().trim(),
                link: `${baseUrl}${element.attr('href')}`,
                image: element.find('img.lazy').attr('data-src') || null,
            };
        }).get();

        const popularTags = $('h4:contains("Popular Tag")').next('div').find('a.badge').map((_, el) => {
            const element = $(el);
            return {
                name: element.text().trim(),
                link: `${baseUrl}${element.attr('href')}`,
            };
        }).get();

        return {
            headline: {
                main: mainHeadline,
                secondary: secondaryHeadlines,
            },
            latestNews,
            specialUpdates,
            moreNews,
            sidebar: {
                mostPopular,
                popularTags
            }
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeJakartaGlobe };