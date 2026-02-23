import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeMediaIndonesia() {
    const url = 'https://mediaindonesia.com/';
    try {
        const { data: html } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });
        
        const $ = cheerio.load(html);

        const headlineArticles = $('.headline-grid .item').map((_, el) => {
            const element = $(el);
            const titleElement = element.find('h1 a, h2 a');
            
            return {
                title: titleElement.attr('title')?.trim() || '',
                link: titleElement.attr('href') || element.find('figure a').attr('href') || '',
                image: element.find('figure img').attr('data-src') || '',
                summary: element.find('p').text().trim(),
                timestamp: element.find('.date').text().trim() || '',
            };
        }).get();

        const newsticker = $('.newsticker-slider .item').map((_, el) => {
            const element = $(el);
            return {
                title: element.text().trim(),
                link: element.parent('a').attr('href') || '',
            };
        }).get();

        const premiumArticles = $('.premium-section .premium-news-item').map((_, el) => {
            const element = $(el);
            const linkElement = element.find('a.ratio');
            return {
                title: element.find('h3 a').text().trim(),
                link: element.find('h3 a').attr('href') || '',
                image: linkElement.find('img').attr('data-src') || '',
            };
        }).get();

        const latestNews = $('.list-3 > li').filter((_, el) => !$(el).hasClass('genie-ads') && $(el).find('h3 a').length > 0).map((_, el) => {
            const element = $(el);
            return {
                title: element.find('.text h3 a').attr('title')?.trim() || '',
                link: element.find('.text h3 a').attr('href') || '',
                image: element.find('.pic img').attr('data-src') || element.find('.pic img').attr('src') || '',
                summary: element.find('.text p').text().trim(),
                timestamp: element.find('.text span').first().text().trim(),
            };
        }).get();
        
        const editorialArticles = $('ul.list-1 li').map((_, el) => {
            const element = $(el);
            const linkElement = element.find('h3 a');
            return {
                title: linkElement.attr('title')?.trim() || '',
                link: linkElement.attr('href') || '',
                image: element.find('figure img').attr('data-src') || '',
                timestamp: element.find('.text span').text().trim(),
            };
        }).get();

        const latestVideos = $('section.video .card-3.video').map((_, el) => {
            const element = $(el);
            const linkElement = element.find('h3 a');
            return {
                title: linkElement.attr('title')?.trim() || '',
                link: linkElement.attr('href') || '',
                thumbnail: element.find('figure img').attr('data-src') || '',
                timestamp: element.find('.text span').text().trim()
            }
        }).get();
        
        return {
            sourceUrl: url,
            headline: headlineArticles,
            newsticker: newsticker,
            premium: premiumArticles,
            latestNews: latestNews,
            editorials: editorialArticles,
            videos: latestVideos,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeMediaIndonesia };