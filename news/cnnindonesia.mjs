import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeCnnIndonesia() {
    const url = 'https://www.cnnindonesia.com/';

    try {
        const { data: html } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(html);

        const headlineArticle = $('a[dtr-evt="headline"][dtr-sec="artikel hl"]').first();
        const headline = {
            title: headlineArticle.find('h1').text().trim(),
            link: headlineArticle.attr('href'),
            image: headlineArticle.find('img').attr('src'),
            category: headlineArticle.find('span.label').text().trim(),
            summary: headlineArticle.find('span.text-sm').text().trim(),
            relatedArticles: $('a[dtr-evt="headline"][dtr-sec="beritaterkaitHL"]').map((_, el) => ({
                title: $(el).find('h2').text().trim(),
                link: $(el).attr('href'),
                image: $(el).find('img').attr('src'),
            })).get()
        };

        const popularNews = $('div[class*="w-"] > div > div.overflow-y-auto > article').map((_, el) => ({
            rank: $(el).find('span.text-cnn_grey').text().trim(),
            title: $(el).find('h2').text().trim(),
            link: $(el).find('a').attr('href'),
            category: $(el).find('span.text-xs').text().trim()
        })).get();

        const mainNews = $('article[dtr-evt="box berita utama"]').map((_, el) => ({
            title: $(el).find('h2').text().trim(),
            link: $(el).find('a').attr('href'),
            category: $(el).find('span.text-xs').text().trim()
        })).get();

        const latestNews = $('div.nhl-list > article.flex-grow').has('a h2').map((_, el) => {
            const articleLink = $(el).find('a');
            return {
                title: articleLink.find('h2').text().trim(),
                link: articleLink.attr('href'),
                image: articleLink.find('img').first().attr('src'),
                category: articleLink.find('span.text-xs.text-cnn_red').text().trim()
            };
        }).get();

        return {
            headline,
            popularNews,
            mainNews,
            latestNews
        };

    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeCnnIndonesia };