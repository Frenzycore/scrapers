import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeJusticeInfo() {
    const url = 'https://www.justiceinfo.net/';
    try {
        const { data: html } = await axios.get(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(html);

        const getArticleData = (element) => {
            const el = $(element);
            const titleElement = el.find('.articleLinkTitle');

            return {
                title: titleElement.text().trim() || null,
                link: titleElement.attr('href') || el.attr('href') || null,
                excerpt: el.find('.articleLinkExcerpt').text().trim() || null,
                author: el.find('.articleLinkAuthors').text().replace('Par ', '').trim() || null,
                image: el.find('.articleLinkImageContainer img').attr('data-src') || el.find('.articleLinkImageContainer img').attr('src') || null,
                tags: el.find('.postTags .postTagItem-link').map((i, tag) => $(tag).text().trim()).get()
            };
        };

        const featuredArticle = getArticleData($('.vc_col-sm-8 .articleLink--featured'));

        const topArticles = $('.vc_col-sm-4 .articleLink--default').map((i, el) => getArticleData(el)).get();

        const specialFocuses = $('.articleLink--inline').map((i, el) => {
            const element = $(el);
            return {
                title: element.find('.articleLinkTitle').text().trim(),
                subtitle: element.find('.articleLinkSubTitle').text().trim(),
                link: element.find('a').first().attr('href'),
                image: element.find('img').attr('data-src') || element.find('img').attr('src'),
            };
        }).get();

        const mainSpecialDossier = {
            title: $('.seriesOfArticles-title').first().text().trim(),
            link: $('.seriesOfArticles-title').first().attr('href'),
            tag: $('.seriesOfArticles-tag').first().text().trim(),
            publicationCount: $('.seriesOfArticles-publicationNumber').first().text().trim(),
            articles: $('.seriesOfArticles-item').map((i, el) => {
                const item = $(el);
                return {
                    title: item.find('.seriesOfArticles-itemTitle').text().trim(),
                    link: item.find('.seriesOfArticles-itemTitle').attr('href'),
                    excerpt: item.find('.seriesOfArticles-itemText').text().trim() || null,
                };
            }).get(),
        };

        const otherSpecialDossiers = $('.js-articleList-carousel .articleLink--condensed').map((i, el) => {
            const item = $(el);
            return {
                title: item.find('.articleLinkTitle').text().trim(),
                link: item.find('.articleLinkTitle').attr('href'),
                publicationCount: item.find('.articleLinkPublicationNumber').text().trim(),
                image: item.find('img').attr('data-src') || item.find('img').attr('src'),
            };
        }).get();

        const afpNewsFeed = $('.articleList--afp .articleLink--news').map((i, el) => {
            const item = $(el);
            return {
                date: item.find('.articleLinkDate').text().trim(),
                title: item.find('.articleLinkTitle').text().trim(),
                link: item.attr('href'),
            };
        }).get();

        return {
            pageTitle: $('title').text().trim(),
            featuredArticle,
            topArticles,
            specialFocuses,
            mainSpecialDossier,
            otherSpecialDossiers,
            afpNewsFeed
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeJusticeInfo };