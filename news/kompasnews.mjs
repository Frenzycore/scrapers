import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeKompas() {
    try {
        const { data: html } = await axios.get('https://www.kompas.com/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });
        
        const $ = cheerio.load(html);

        const mainHeadlineElement = $('.hlWrap-slider .hlItem a');
        const mainHeadline = {
            title: mainHeadlineElement.find('.hlTitle').text().trim(),
            link: mainHeadlineElement.attr('href'),
            image: mainHeadlineElement.find('.hlImg img').attr('src'),
            subtitle: mainHeadlineElement.find('.hlSubtitle').text().trim(),
        };

        const otherHeadlines = $('.hlWrap-grid .hlItem a').map((_, el) => {
            const element = $(el);
            return {
                title: element.find('.hlTitle').text().trim(),
                link: element.attr('href'),
                image: element.find('.hlImg img').attr('data-src') || element.find('.hlImg img').attr('src'),
                category: element.find('.hlChannel').text().trim() || null
            };
        }).get();

        const trendingTopics = $('.trendContent .trendItem a').map((_, el) => {
            const element = $(el);
            return {
                topic: element.text().trim(),
                link: element.attr('href')
            };
        }).get();

        const mostPopular = $('.mostWrap .mostItem a').map((_, el) => {
            const element = $(el);
            const title = element.find('.mostTitle').text().trim();
            if (!title || element.find('.icn-mostKGNow').length) return null;
            return {
                title: title,
                link: element.attr('href'),
                category: element.find('.mostChannel').text().trim(),
                rank: parseInt(element.find('.mostNumber').text().trim(), 10)
            };
        }).get().filter(Boolean);

        const spotlight = $('.spotlightWrap .spotlightItem a').map((_, el) => {
            const element = $(el);
            return {
                title: element.find('.spotlightTitle').text().trim(),
                link: element.attr('href'),
                image: element.find('.spotlightImg img').attr('data-src') || element.find('.spotlightImg img').attr('src'),
                category: element.find('.spotlightChannel').text().trim()
            };
        }).get();

        const latestNews = $('.aimlLatest .wSpec-item a').map((_, el) => {
            const element = $(el);
            const subtitleElement = element.find('.wSpec-subtitle');
            const category = subtitleElement.clone().children().remove().end().text().trim();
            const publishedTime = subtitleElement.find('span').text().trim();

            return {
                title: element.find('.wSpec-title').text().trim(),
                link: element.attr('href'),
                image: element.find('.wSpec-img img').attr('data-src') || element.find('.wSpec-img img').attr('src'),
                category: category,
                publishedTime: publishedTime
            };
        }).get();

        const mainVideoElement = $('.latest.kgnowGate .article__list--video');
        const mainVideo = {
            title: mainVideoElement.find('h3.article__title a').text().trim(),
            link: mainVideoElement.find('a.article__link').attr('href'),
            publishedTime: mainVideoElement.find('.article__date').text().trim(),
            iframeSrc: mainVideoElement.find('iframe').attr('src')
        };

        const videoCarousel = $('.videoKGSlider .videoKG-item a').map((_, el) => {
            const element = $(el);
            return {
                title: element.find('.videoKG-title').text().trim(),
                link: element.attr('href'),
                thumbnail: element.find('.videoKG-image img').attr('data-src') || element.find('.videoKG-image img').attr('src'),
                duration: element.find('.videoKG-duration').text().trim(),
                publishedTime: element.find('.videoKG-date').text().trim()
            };
        }).get();

        return {
            mainHeadline,
            otherHeadlines,
            trendingTopics,
            mostPopular,
            spotlight,
            latestNews,
            videos: {
                mainVideo,
                videoCarousel
            }
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeKompas };