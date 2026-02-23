import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeIdnTimes() {
    try {
        const { data: html } = await axios.get('https://www.idntimes.com/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });

        const $ = cheerio.load(html);

        const mainHeadlineElement = $('div[data-cy="main-headline"]');
        const mainHeadline = {
            title: mainHeadlineElement.find('h1[data-cy="main-headline-title"]').text().trim(),
            link: mainHeadlineElement.find('a').attr('href') || '',
            image: mainHeadlineElement.find('img').attr('src') || '',
            publishDate: mainHeadlineElement.find('span[data-cy="main-headline-pubdate"]').text().trim(),
            category: mainHeadlineElement.find('span[data-cy="main-headline-category"]').text().trim()
        };

        const secondaryHeadlines = $('div[data-cy="second-headline-carousel"] div[data-cy*="ds-card-article"]').map((_, el) => {
            const element = $(el);
            const linkElement = element.find('a').first();
            return {
                title: element.find('h2[data-cy="ds-card-article-title"]').text().trim(),
                link: linkElement.attr('href') || '',
                image: element.find('img').attr('src') || '',
                publishDate: element.find('span[data-cy="ds-card-article-pubdate"]').text().trim(),
                category: element.find('span[data-cy="ds-card-article-category"]').text().trim()
            };
        }).get().filter(article => article.title);

        const trendingArticles = $('div[data-cy="dynamic-section-list"]:has(h2:contains("Trending")) #dynamic-list-section > div.css-w7ypgj').map((_, el) => {
            const element = $(el);
            const linkElement = element.find('a').first();
            return {
                title: element.find('h3[data-cy="ds-card-article-title"]').text().trim(),
                link: linkElement.attr('href') || '',
                image: element.find('img').attr('src') || '',
                publishDate: element.find('span[data-cy="ds-card-article-pubdate"]').text().trim(),
                category: element.find('span[data-cy="ds-card-article-category"]').text().trim()
            };
        }).get();

        const trendingTopics = $('aside h2:contains("Trending Topics")').parent().next().find('div.css-19ictbt').map((_, el) => {
            const element = $(el);
            const linkElement = element.find('a');
            return {
                topic: linkElement.find('span[data-testid="title-article"]').text().trim(),
                link: linkElement.attr('href') || ''
            };
        }).get();

        return {
            mainHeadline,
            secondaryHeadlines,
            trendingArticles,
            trendingTopics
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeIdnTimes };