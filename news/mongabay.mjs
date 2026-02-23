import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeMongabay() {
    try {
        const { data: html } = await axios.get('https://mongabay.co.id/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        
        const $ = cheerio.load(html);

        const mainHeadlineElement = $('.column--60.latest-featured > .article--container.full-width > a').first();
        const mainHeadline = {
            title: mainHeadlineElement.find('h1').text().trim(),
            link: mainHeadlineElement.attr('href') || '',
            image: mainHeadlineElement.find('img').attr('src') || '',
        };

        const latestNews = $('.latest-news .article--container').map((_, el) => {
            const element = $(el);
            const linkElement = element.find('a');
            return {
                title: linkElement.find('.title h3').text().trim(),
                link: linkElement.attr('href') || '',
                author: linkElement.find('.byline').text().trim(),
                date: linkElement.find('.date').text().trim(),
                category: linkElement.find('.featured-label').text().trim() || null,
                image: linkElement.find('.featured-image img').attr('src') || null,
            };
        }).get().filter(article => article.title);

        const secondaryFeatured = $('.column--60.latest-featured .grid--2 .article--container').map((_, el) => {
            const element = $(el);
            const linkElement = element.find('a');
            return {
                title: linkElement.find('.title h3').text().trim(),
                link: linkElement.attr('href') || '',
                author: linkElement.find('.byline').text().trim(),
                date: linkElement.find('.date').text().trim(),
                image: linkElement.find('.featured-image img').attr('src') || null,
            };
        }).get();
        
        const specialIssueSection = $('.section--highlight.slider');
        const specialIssue = {
            seriesTitle: specialIssueSection.find('h3').first().text().trim(),
            seriesDescription: specialIssueSection.find('#series--description-container .series--description p').text().trim(),
            seriesLink: specialIssueSection.find('#series--description-container .series--browse a').attr('href') || '',
            articles: specialIssueSection.find('.slider-series .article--slide').map((_, el) => {
                const element = $(el);
                const linkElement = element.find('a');
                return {
                    title: linkElement.find('h1').text().trim(),
                    link: linkElement.attr('href') || '',
                    author: linkElement.find('.byline').text().trim(),
                    date: linkElement.find('.date').text().trim(),
                    image: linkElement.find('img').attr('src') || '',
                };
            }).get(),
        };

        const moreSpecialIssues = $('.section--series-more .grid--3 .article--container').map((_, el) => {
            const element = $(el);
            const linkElement = element.find('a');
            return {
                title: linkElement.find('h3').text().trim(),
                link: linkElement.attr('href') || '',
                storyCount: linkElement.find('.meta .count').text().trim(),
                image: linkElement.find('img').attr('src') || '',
            };
        }).get();
        
        const featuredPodcastElement = $('.section--highlight:contains("Dengarkan Alam")');
        const featuredPodcast = {
            title: featuredPodcastElement.find('h3 a').text().trim(),
            link: featuredPodcastElement.find('h3 a').attr('href') || '',
            image: featuredPodcastElement.find('.featured-image img').attr('src') || '',
            author: featuredPodcastElement.find('.byline').text().trim(),
            date: featuredPodcastElement.find('.date').text().trim(),
        };

        const videosSection = $('.container:contains("Tonton video")');
        const mainVideoElement = videosSection.find('.article--container.full-width > a').first();
        const videos = {
            mainVideo: {
                title: mainVideoElement.find('h1').text().trim(),
                link: mainVideoElement.attr('href') || '',
                image: mainVideoElement.find('img').attr('src') || '',
            },
            otherVideos: videosSection.find('.grid--4 .article--container').map((_, el) => {
                const element = $(el);
                const linkElement = element.find('a');
                return {
                    title: linkElement.find('.title h3').text().trim(),
                    link: linkElement.attr('href') || '',
                    author: linkElement.find('.byline').text().trim(),
                    date: linkElement.find('.date').text().trim(),
                    image: linkElement.find('.featured-image img').attr('src') || '',
                };
            }).get(),
        };

        return {
            mainHeadline,
            latestNews,
            secondaryFeatured,
            specialIssue,
            moreSpecialIssues,
            featuredPodcast,
            videos
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeMongabay };