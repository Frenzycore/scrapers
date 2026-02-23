import axios from "axios";
import * as cheerio from "cheerio";

async function bbcIndonesia() {
    const url = 'https://www.bbc.com/indonesia';

    try {
        const { data: html } = await axios.get(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
            }
        });

        const $ = cheerio.load(html);

        const getArticlesFromSection = (sectionTitle) => {
            const sectionHeader = $(`h2:contains("${sectionTitle}")`);
            const articleList = sectionHeader.next('div').find('ul > li');

            return articleList.map((i, el) => {
                const element = $(el);
                const titleElement = element.find('h3 a');
                
                const title = titleElement.text().trim();
                const link = titleElement.attr('href');
                const summary = element.find('p').text().trim();
                const timestamp = element.find('time').text().trim();
                const imageSrcset = element.find('source[type="image/webp"]').attr('srcSet') || '';
                const image = imageSrcset.split(',')[0].trim().split(' ')[0] || element.find('img').attr('src');

                return { title, link, summary, timestamp, image };
            }).get();
        };

        const mainNews = getArticlesFromSection('Berita utama');
        const selectedNews = getArticlesFromSection('Berita pilihan');
        const otherNews = getArticlesFromSection('Berita lain');

        const shortVideos = $('ul.bbc-a5enah li').map((i, el) => {
            const element = $(el);
            const image = element.find('img').attr('src');
            const fullTitle = element.find('span.bbc-12e5l8w').text();
            const titleParts = fullTitle.split(',').map(part => part.trim());

            const title = titleParts.length > 2 ? titleParts[1] : titleParts[0];
            const duration = titleParts.length > 2 ? titleParts[2] : '';

            return { title, image, duration };
        }).get();

        const mostPopular = $('section[aria-labelledby="Most-Read"] ol > li').map((i, el) => {
            const element = $(el);
            const rank = parseInt(element.find('span.bbc-1f5se8y').text().trim(), 10);
            const title = element.find('a').text().trim();
            const link = element.find('a').attr('href');

            return { rank, title, link };
        }).get();

        return {
            mainNews,
            selectedNews,
            otherNews,
            shortVideos,
            mostPopular
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { bbcIndonesia };