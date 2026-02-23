import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeRepublika() {
    const url = 'https://www.republika.co.id/';
    try {
        const { data: html } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });

        const $ = cheerio.load(html);

        const headlineNews = $('#headlineCarousel .carousel-item.item').map((_, el) => {
            const element = $(el);
            const linkElement = element.find('a');
            const title = linkElement.find('h2').text().trim();
            const link = linkElement.attr('href');
            const image = linkElement.find('.max-card__image img').attr('data-original');
            const category = linkElement.find('.date.date-item__headline label').text().trim();
            const fullDateText = linkElement.find('.date.date-item__headline').text().trim();
            const timestamp = fullDateText.replace(category, '').replace('-', '').trim();

            return { title, link, image, category, timestamp };
        }).get();

        const featuredArticles = $('#unggulanCarousel .is-grid').map((_, el) => {
            const element = $(el);
            const linkElement = element.find('a');
            const title = linkElement.find('.caption .title').text().trim();
            const link = linkElement.attr('href');
            const image = linkElement.find('.image img').attr('data-original');
            const category = linkElement.find('.date .kanal-info').text().trim();

            return { title, link, image, category };
        }).get();

        const latestNews = $('ul.wrap-latest > li.list-group-item.conten1').map((_, el) => {
            const element = $(el);
            const linkElement = element.find('a');
            const title = linkElement.find('h3 span').text().trim();
            const link = linkElement.attr('href');
            const image = linkElement.find('.image img').attr('data-original');
            const fullDateText = linkElement.find('.date').text().trim().replace(/\s\s+/g, ' ');
            const [category, timestamp] = fullDateText.split('-').map(s => s.trim());

            return { title, link, image, category, timestamp };
        }).get();

        const popularNews = $('.terpopuler table tr.list-terpopuler').map((_, el) => {
            const element = $(el);
            const rank = element.find('.number').text().trim();
            const linkElement = element.find('a');
            const title = linkElement.text().trim();
            const link = linkElement.attr('href');

            return { rank, title, link };
        }).get();
        
        const videos = $('.video-box .is-grid').map((_, el) => {
            const element = $(el);
            const linkElement = element.find('a');
            const title = linkElement.find('.caption .title').text().trim();
            const link = linkElement.attr('href');
            const image = linkElement.find('.image img').attr('src');
            const timestamp = linkElement.find('.date').text().trim();

            return { title, link, image, timestamp };
        }).get();

        return {
            source: url,
            headlineNews,
            featuredArticles,
            latestNews,
            popularNews,
            videos
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeRepublika };