import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeDailyNewsIndonesia() {
    const targetUrl = 'https://dailynewsindonesia.com/';

    try {
        const { data: html } = await axios.get(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });

        const $ = cheerio.load(html);

        const extractArticleData = (selector, isHero = false) => {
            return $(selector).map((_, el) => {
                const element = $(el);
                const titleElement = element.find('.jeg_post_title a');
                
                let image;
                if (isHero) {
                    image = element.find('.thumbnail-container').attr('data-src');
                } else {
                    image = element.find('img').attr('data-src') || element.find('img').attr('src');
                }

                return {
                    title: titleElement.text().trim(),
                    link: titleElement.attr('href'),
                    image: image || null,
                    category: element.find('.jeg_post_category a').text().trim() || null,
                    date: element.find('.jeg_meta_date a').text().trim() || null,
                    excerpt: element.find('.jeg_post_excerpt p').text().trim() || null
                };
            }).get();
        };
        
        const heroArticles = extractArticleData('.jeg_heroblock_5 article.jeg_post', true);
        const dniNews = extractArticleData('.elementor-element-4760fb3 article.jeg_post');
        const latestNews = extractArticleData('.elementor-element-aab4cdc article.jeg_post');
        
        const popularNews = $('.elementor-element-2225057 article.jeg_post').map((_, el) => {
            const element = $(el);
            const titleElement = element.find('.jeg_post_title a');
            return {
                title: titleElement.text().trim(),
                link: titleElement.attr('href'),
            };
        }).get();

        return {
            heroArticles,
            dniNews,
            latestNews,
            popularNews,
        };
    } catch (error) {
        throw new Error(`Scraping failed for ${targetUrl}: ${error.message}`);
    }
}

export { scrapeDailyNewsIndonesia };