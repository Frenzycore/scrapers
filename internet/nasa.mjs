import axios from "axios";
import * as cheerio from "cheerio"

async function scrapeNasa() {
    try {
        const { data: html } = await axios.get('https://www.nasa.gov/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });

        const $ = cheerio.load(html);

        const mainStorySlider = $('.hds-nasa-mag-wrapper').first();
        const mainStory = {
            title: mainStorySlider.find('h2.display-72').text().trim() || null,
            description: mainStorySlider.find('p.maxw-tablet').text().trim() || null,
            link: mainStorySlider.find('a.usa-button--secondary').attr('href') || null,
            image: mainStorySlider.find('figure.hds-media-background img').attr('src') || null,
            relatedLinks: mainStorySlider.find('.hds-nasa-mag-col').map((_, el) => ({
                category: $(el).find('h3.label').text().trim(),
                title: $(el).find('a span').text().trim(),
                link: $(el).find('a').attr('href')
            })).get()
        };

        const featuredNews = $('.wp-block-nasa-blocks-news-manual .latest-news-items a[href]').map((_, el) => {
            const element = $(el);
            return {
                title: element.find('p.heading-22 span, p.heading-14').text().trim(),
                link: element.attr('href'),
                image: element.find('figure.hds-media-background img').attr('src') || element.find('figure.hds-media-background img').attr('data-src'),
                type: element.find('.label svg + span').text().trim(),
                readTime: element.find('.label').not(':has(svg)').text().trim()
            };
        }).get().filter(item => item.title);

        const videoSection = $('.wp-block-nasa-blocks-featured-video');
        const featuredVideo = {
            title: videoSection.find('h3.heading-36').text().trim(),
            description: videoSection.find('p.color-carbon-20').text().trim(),
            videoUrl: videoSection.find('iframe').attr('src'),
            learnMoreLink: videoSection.find('a.button-primary').attr('href')
        };

        const iotdSection = $('.wp-block-nasa-blocks-image-of-the-day');
        const onClickAttr = iotdSection.find('.hds-image-download-wrapper').attr('onClick') || '';
        const pageUrlMatch = onClickAttr.match(/'([^']+)'/);
        const imageOfTheDay = {
            title: iotdSection.find('p.heading-22').text().trim(),
            description: iotdSection.find('p.p-md').first().text().trim(),
            imageUrl: iotdSection.find('.hds-media-inner img').attr('src'),
            pageUrl: pageUrlMatch ? pageUrlMatch[1] : null,
            downloadUrl: iotdSection.find('a.hds-image-download-link').attr('href')
        };

        const imageGalleries = $('.card-carousel-slider .hds-card-gallery').map((_, el) => {
            const element = $(el);
            return {
                title: element.find('h3.heading-16').text().trim(),
                link: element.attr('href'),
                stats: element.find('.display-flex.label').text().trim().replace(/\s+/g, ' '),
                thumbnails: element.find('.hds-card-gallery-images img').map((_, img) => $(img).attr('src')).get()
            };
        }).get();

        const topics = $('a.hds-card-topic').map((_, el) => {
            const element = $(el);
            return {
                title: element.find('.hds-topic-card-heading span').text().trim(),
                link: element.attr('href'),
                image: element.find('.hds-media-background img').attr('src')
            };
        }).get();

        const artemisStorySection = $('.wp-block-nasa-blocks-story');
        const artemisStory = {
            subtitle: artemisStorySection.find('h3.subtitle-md').text().trim(),
            title: artemisStorySection.find('h2.display-48').text().trim(),
            description: artemisStorySection.find('p.p-md').text().trim(),
            link: artemisStorySection.find('a.button-primary').attr('href'),
            image: artemisStorySection.find('figure.hds-media-inner img').attr('src')
        }

        return {
            mainStory,
            featuredNews,
            featuredVideo,
            imageOfTheDay,
            imageGalleries,
            artemisStory,
            topics
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaPlus() {
    try {
        const { data: html } = await axios.get("https://plus.nasa.gov/", {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const heroBanners = $(".banner_carousel .splide__slide")
            .map((_, el) => {
                const element = $(el);
                const backgroundUrl = element.css("background-image") || "";
                return {
                    title:
                        element.find(".banner--logo img").attr("alt") ||
                        element.find("h1.banner-title").text().trim(),
                    description: element
                        .find(".banner--info-text p")
                        .text()
                        .trim(),
                    watchLink:
                        element
                            .find(".banner--info-actions a")
                            .first()
                            .attr("href") || null,
                    logoImage:
                        element.find(".banner--logo img").attr("src") || null,
                    backgroundImage: backgroundUrl.replace(
                        /url\(['"]?(.*?)['"]?\)/,
                        "$1"
                    ),
                };
            })
            .get();

        const playlists = $("div.playlists article.playlist")
            .map((_, el) => {
                const playlist = $(el);
                const title = playlist.find("h3.playlist--title").text().trim();
                const videos = playlist
                    .find("article.video-grid")
                    .map((_, vid) => {
                        const video = $(vid);
                        const thumbUrl =
                            video
                                .find("figure.video-grid--thumbnail")
                                .css("background-image") || "";
                        return {
                            title: video
                                .find("h4.video-grid--title")
                                .text()
                                .trim(),
                            link: video.find("a.video-grid--link").attr("href"),
                            thumbnail: thumbUrl.replace(
                                /url\(['"]?(.*?)['"]?\)/,
                                "$1"
                            ),
                            duration:
                                video
                                    .find("p.font-family-mono")
                                    .text()
                                    .trim() || null,
                            primaryTag:
                                video.find(".tag-icon-group a").text().trim() ||
                                null,
                        };
                    })
                    .get();

                return { title, videos };
            })
            .get();

        const exploreTopics = $(".topics-menu--single")
            .map((_, el) => {
                const topic = $(el);
                const topicUrl =
                    topic
                        .find("figure.topic--thumbnail")
                        .css("background-image") || "";
                return {
                    name: topic.find("h4").text().trim(),
                    link: topic.find("a").attr("href"),
                    image: topicUrl.replace(/url\(['"]?(.*?)['"]?\)/, "$1"),
                };
            })
            .get();

        const nasaSeries = $("section.series_carousel article.series-grid")
            .map((_, el) => {
                const series = $(el);
                const seriesUrl =
                    series
                        .find("figure.series-grid--thumbnail")
                        .css("background-image") || "";
                return {
                    title: series.find("h4.series-grid--title").text().trim(),
                    link: series.find("a.series-grid--link").attr("href"),
                    image: seriesUrl.replace(/url\(['"]?(.*?)['"]?\)/, "$1"),
                    episodeInfo: series
                        .find("p.font-family-mono")
                        .text()
                        .trim(),
                };
            })
            .get();

        return {
            heroBanners,
            playlists,
            exploreTopics,
            nasaSeries,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaNews() {
    const url = "https://www.nasa.gov/news/";
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const pageTitle = $("h1.display-72").text().trim();

        const articles = $(
            "div.wp-block-nasa-blocks-news-automated a.latest-news-item"
        )
            .map((_, el) => {
                const $article = $(el);
                const title = $article.find("p.heading-22 span").text().trim();
                const link = $article.attr("href");
                const category = $article
                    .find("div.label svg + span")
                    .text()
                    .trim();
                const readTime = $article
                    .find(".display-block .label")
                    .text()
                    .trim();
                const imageUrl = $article
                    .find("figure.hds-media-background img")
                    .attr("src");

                return {
                    title,
                    link: link ? new URL(link, url).href : null,
                    category: category || "General",
                    readTime,
                    imageUrl,
                };
            })
            .get();

        return {
            source: "NASA News",
            pageTitle,
            articles,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaEvents() {
    try {
        const { data: html } = await axios.get('https://www.nasa.gov/events/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });

        const $ = cheerio.load(html);

        const events = $('ul.hds-event-items li').map((_, el) => {
            const element = $(el);
            const title = element.find('h3.hds-event-title').text().trim();
            const url = element.find('a.hds-event-item').attr('href');
            const date = element.find('div.hds-event-date-time span.hds-event-date').text().trim();
            const eventType = element.find('span.hds-event-type').text().trim();
            const imageUrl = element.find('div.hds-event-thumbnail img').attr('src');

            return {
                title,
                url,
                date,
                eventType,
                imageUrl
            };
        }).get();

        return {
            pageTitle: $('h1.heading-41').text().trim(),
            events
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaLaunches() {
    try {
        const { data: html } = await axios.get('https://www.nasa.gov/event-type/launch-schedule/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        
        const $ = cheerio.load(html);

        const launchItems = $('ul.hds-event-items > li');

        const launches = launchItems.map((_, element) => {
            const item = $(element).find('a.hds-event-item');

            const title = item.find('h3.hds-event-title').text().trim();
            const date = item.find('div.hds-event-date-time span').text().trim();
            const detailsUrl = item.attr('href');
            const imageUrl = item.find('.hds-event-thumbnail img').attr('src');
            const eventType = item.find('.hds-event-type').text().trim();

            return {
                title,
                date,
                eventType,
                detailsUrl: detailsUrl || null,
                imageUrl: imageUrl || null,
            };
        }).get();

        return {
            source: 'NASA Launch Schedule',
            url: 'https://www.nasa.gov/event-type/launch-schedule/',
            launches,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaMultimedia() {
    const url = "https://www.nasa.gov/multimedia/";
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const pageTitle = $("h1.page-heading-lg").text().trim();

        const featuredSections = $(".hds-story")
            .map((_, el) => {
                const element = $(el);
                const subtitle = element.find(".subtitle-md").text().trim();
                const title = element.find(".display-48").text().trim();
                const description = element.find("p.p-md").text().trim();
                const linkElement = element.find("a.button-primary");
                const link = linkElement.attr("href") || "";
                const linkText = linkElement.find("span").text().trim();
                const imageUrl = element.find("figure img").attr("src") || "";

                return {
                    type: subtitle,
                    title,
                    description,
                    link: link.startsWith("/")
                        ? `https://www.nasa.gov${link}`
                        : link,
                    linkText,
                    imageUrl,
                };
            })
            .get();

        const moreOnlineFeatures = $(".hds-card-grid .hds-card-custom")
            .map((_, el) => {
                const element = $(el);
                const title = element.find("h3.heading-18").text().trim();
                const description = element.find("p").first().text().trim();
                const link =
                    element.find("a.button-primary").attr("href") || "";
                const imageUrl =
                    element.find(".hds-card-thumbnail img").attr("src") || "";

                return {
                    title,
                    description,
                    link: link.startsWith("/")
                        ? `https://www.nasa.gov${link}`
                        : link,
                    imageUrl,
                };
            })
            .get();

        const discoverMore = $(".hds-topic-cards a.topic-card")
            .map((_, el) => {
                const element = $(el);
                const title = element
                    .find(".hds-topic-card-heading span")
                    .text()
                    .trim();
                const link = element.attr("href") || "";
                const imageUrl = element.find("figure img").attr("src") || "";

                return {
                    title,
                    link: link.startsWith("/")
                        ? `https://www.nasa.gov${link}`
                        : link,
                    imageUrl,
                };
            })
            .get();

        return {
            pageTitle,
            featuredSections,
            moreOnlineFeatures,
            discoverMore,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaMissions() {
    try {
        const { data: html } = await axios.get(
            "https://www.nasa.gov/nasa-missions/",
            {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
                },
            }
        );

        const $ = cheerio.load(html);

        const missionCategories = $(".hds-tabbed-section-tab")
            .map((_, el) => {
                const element = $(el);
                return {
                    category: element.find("h2.heading-29").text().trim(),
                    description: element.find("p.p-md").text().trim(),
                    link: element.find("a.button-primary").attr("href") || null,
                    imageUrl:
                        element
                            .find(".hds-tabbed-section-image img")
                            .attr("src") || null,
                    imageCaption:
                        element.find(".hds-caption-text").text().trim() || null,
                };
            })
            .get();

        const artemisCallout = {
            title: $(".wp-block-nasa-blocks-callout h2.page-heading-md")
                .text()
                .trim(),
            description: $(".wp-block-nasa-blocks-callout p.p-lg")
                .text()
                .trim(),
            link:
                $(".wp-block-nasa-blocks-callout a.button-primary").attr(
                    "href"
                ) || null,
            imageUrl:
                $(
                    ".wp-block-nasa-blocks-callout figure.hds-media-background img"
                ).attr("src") || null,
        };

        const featuredMissions = $(".hds-card-grid .hds-card-custom")
            .map((_, el) => {
                const element = $(el);
                return {
                    title: element.find("h3.heading-18").text().trim(),
                    description: element.find("p.margin-top-0").text().trim(),
                    link: element.find("a.button-primary").attr("href") || null,
                    imageUrl:
                        element
                            .find("figure.hds-media-background img")
                            .attr("src") || null,
                };
            })
            .get();

        const moreResources = $(".hds-featured-link-list .grid-row.padding-y-2")
            .map((_, el) => {
                const element = $(el);
                return {
                    title: element.find("h2.heading-36").text().trim(),
                    link: element.find("a").attr("href") || null,
                    imageUrl:
                        element
                            .find("figure.hds-media-background img")
                            .attr("src") || null,
                };
            })
            .get();

        return {
            pageTitle: $("h1.page-heading-md").first().text().trim(),
            introduction: $("p.p-lg").first().text().trim(),
            missionCategories,
            artemisCallout,
            featuredMissions,
            moreResources,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaHumansInSpace() {
    const url = 'https://www.nasa.gov/humans-in-space/';
    try {
        const { data: html } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });

        const $ = cheerio.load(html);

        const introSection = $('.wp-block-nasa-blocks-page-intro');
        const pageTitle = introSection.find('h1.page-heading-md').text().trim();
        const pageDescription = introSection.find('p.p-lg').text().trim();
        const heroImage = introSection.find('figure.hds-media-background img').attr('src');

        const latestExpeditions = $('.hds-card-carousel .card-carousel-slider .hds-card').map((_, el) => {
            const linkElement = $(el).find('a.button-primary');
            return {
                title: linkElement.find('span').text().trim(),
                link: new URL(linkElement.attr('href'), url).href,
                image: $(el).find('figure.hds-media-background img').attr('src')
            };
        }).get();

        const callouts = $('.wp-block-nasa-blocks-callout').map((_, el) => {
            const linkElement = $(el).find('a.button-primary');
            return {
                title: $(el).find('h2.page-heading-md').text().trim(),
                description: $(el).find('p.p-lg').text().trim(),
                link: new URL(linkElement.attr('href'), url).href,
                backgroundImage: $(el).find('figure.hds-media-background img').attr('src')
            };
        }).get();

        const featuredVideos = $('.wp-block-nasa-blocks-featured-video').map((_, el) => ({
            title: $(el).find('h3.heading-36').text().trim(),
            description: $(el).find('p.color-carbon-20').text().trim(),
            videoUrl: $(el).find('iframe').attr('src'),
            moreInfoLink: new URL($(el).find('a.button-primary').attr('href'), url).href
        })).get();

        const newsItems = [];
        const processedLinks = new Set();
        $('.wp-block-nasa-blocks-news-automated .grid-row a').each((_, el) => {
            const link = $(el).attr('href');
            if (link && !processedLinks.has(link)) {
                processedLinks.add(link);
                newsItems.push({
                    title: $(el).find('p.heading-22, p.heading-14').text().trim(),
                    link: new URL(link, url).href,
                    image: $(el).find('img').attr('src'),
                    type: $(el).find('.label svg + span').text().trim(),
                    readTime: $(el).find('.label').contents().filter((_, node) => node.type === 'text').text().trim()
                });
            }
        });

        const discoverMoreTopics = $('.wp-block-nasa-blocks-topic-cards .topic-card').map((_, el) => ({
            title: $(el).find('p.hds-topic-card-heading span').text().trim(),
            link: new URL($(el).attr('href'), url).href,
            image: $(el).find('figure.hds-media-background img').attr('src')
        })).get();

        return {
            pageTitle,
            pageDescription,
            heroImage,
            latestExpeditions,
            callouts,
            featuredVideos,
            latestNews: newsItems,
            discoverMoreTopics
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaScience() {
    const url = 'https://science.nasa.gov/';
    try {
        const { data: html } = await axios.get(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
            }
        });

        const $ = cheerio.load(html);

        const heroSection = {
            title: $('h1.page-heading-md').text().trim(),
            description: $('div.hds-mission-header p.p-lg').text().trim(),
            backgroundImage: $('.hds-mission-header > figure.hds-media-background img').attr('src'),
            featuredLinks: $('.hds-mission-header .grid-col-12.desktop\\:grid-col-4').map((_, el) => ({
                category: $(el).find('p.label').text().trim(),
                title: $(el).find('a.button-primary span').text().trim(),
                link: $(el).find('a.button-primary').attr('href'),
            })).get()
        };

        const featuredMissions = $('.hds-card-grid-cards .hds-card-custom').map((_, el) => ({
            title: $(el).find('h3.heading-18').text().trim(),
            description: $(el).find('p.margin-top-0').text().trim(),
            link: $(el).find('a.button-primary').attr('href'),
            image: $(el).find('.hds-card-thumbnail img').attr('src'),
        })).get();

        const latestNews = $('.latest-news-items a.latest-news-item').map((_, el) => ({
            title: $(el).find('p[class*="heading-"]').text().trim(),
            link: $(el).attr('href'),
            image: $(el).find('figure img').attr('src'),
            readTime: $(el).find('.label').first().text().trim(),
            type: $(el).find('svg + span').text().trim() || 'Article'
        })).get();
        
        const featuredVideo = {
            title: $('.hds-featured-video h3.heading-36').text().trim().replace(/\s+/g, ' '),
            description: $('.hds-featured-video p.color-carbon-20').text().trim(),
            videoUrl: $('.hds-featured-video iframe').attr('src'),
            link: $('.hds-featured-video a.button-primary').attr('href')
        };

        const featuredStory = {
            title: $('.hds-featured-story h1.display-60').text().trim(),
            description: $('.hds-featured-story p.p-lg').text().trim(),
            link: $('.hds-featured-story a.button-primary').attr('href'),
            image: $('.hds-featured-story > figure.hds-media-background img').attr('src')
        };

        const diveDeeper = $('.card-carousel-slider .hds-card-custom').map((_, el) => ({
            title: $(el).find('h3.heading-18').text().trim(),
            description: $(el).find('p.margin-top-0').text().trim(),
            link: $(el).find('a.button-primary').attr('href'),
            image: $(el).find('.hds-card-thumbnail img').attr('src')
        })).get();

        return {
            heroSection,
            featuredMissions,
            latestNews,
            featuredVideo,
            featuredStory,
            diveDeeper
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaScienceEarth() {
    const url = "https://science.nasa.gov/earth/";
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const mainTitle = $("h1.page-heading-md").text().trim();
        const mainSubtitle = $("p.p-lg.color-carbon-30-important")
            .text()
            .trim();
        const mainImage = $(
            ".hds-page-intro-banner figure.hds-media-background img"
        ).attr("src");

        const recentNews = $(
            'div.hds-card-grid:has(h2:contains("Recent News and Articles")) a.hds-card-article'
        )
            .map((_, el) => {
                const element = $(el);
                const title = element.find("h3.heading-18").text().trim();
                const link = new URL(element.attr("href"), url).href;
                const image = element
                    .find("figure.hds-media-background img")
                    .attr("src");
                const readTime = element.find(".label").first().text().trim();
                const date = element
                    .find(".label.related-article-label")
                    .text()
                    .replace(/Article/g, "")
                    .trim();
                return { title, link, image, readTime, date };
            })
            .get();

        const earthObservatoryImages = $(
            "#post-list-container .hds-content-item"
        )
            .map((_, el) => {
                const element = $(el);
                const title = element
                    .find(".hds-a11y-heading-22")
                    .text()
                    .trim();
                const link = new URL(
                    element.find("a.hds-content-item-heading").attr("href"),
                    url
                ).href;
                const image = element
                    .find("figure.hds-media-background img")
                    .attr("src");
                const description = element.find("p").text().trim();
                const readTime = element
                    .find(".hds-content-item-readtime")
                    .text()
                    .trim();
                const date = element.find(".label.margin-y-1").text().trim();
                return { title, link, image, description, readTime, date };
            })
            .get();

        const featuredVideos = $(".hds-featured-video")
            .map((_, el) => {
                const element = $(el);
                const title = element.find("h3.heading-36").text().trim();
                const description = element.find("p.p-sm").text().trim();
                const watchLink = element.find("a.button-primary").attr("href");
                const embedUrl = element.find("iframe").attr("src");
                return { title, description, watchLink, embedUrl };
            })
            .get();

        const keepExploring = $(".hds-topic-cards-wrapper a.topic-card")
            .map((_, el) => {
                const element = $(el);
                const title = element
                    .find(".hds-topic-card-heading span")
                    .text()
                    .trim();
                const link = new URL(element.attr("href"), url).href;
                const image = element
                    .find("figure.hds-media-background img")
                    .attr("src");
                const description =
                    element.find("p.margin-bottom-0").text().trim() || null;
                return { title, link, image, description };
            })
            .get();

        return {
            pageTitle: mainTitle,
            pageSubtitle: mainSubtitle,
            heroImage: mainImage,
            recentNews,
            earthObservatoryImages,
            featuredVideos,
            keepExploring,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaScienceSolarSystem() {
    const url = 'https://science.nasa.gov/solar-system/';
    try {
        const { data: html } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36' }
        });

        const $ = cheerio.load(html);

        const heroSection = {
            title: $('.hds-topic-hero h1').text().trim(),
            subtitle: $('.hds-topic-hero p.p-lg').text().trim(),
            imageUrl: $('.hds-topic-hero figure img').attr('src') || null,
            stats: $('.hds-topic-hero-stats .grid-row .grid-col.grid-row').map((i, el) => ({
                value: $(el).find('.stat-number').text().trim(),
                label: $(el).find('.stat-value').text().trim()
            })).get()
        };

        const tenThings = $('.hds-meet-the-card').map((i, el) => ({
            title: $(el).find('h3.heading-18').text().trim(),
            description: $(el).find('p').text().trim(),
            link: $(el).find('a').attr('href') || null,
            imageUrl: $(el).find('figure img').attr('src') || null
        })).get();

        const mainTabs = $('.hds-tabbed-section-tab').map((i, el) => ({
            tabName: $(`#tab${i}-${$(el).attr('id').substring(6)}`).text().trim(),
            title: $(el).find('h2.heading-29').text().trim(),
            description: [$(el).find('p.heading-16').text().trim(), $(el).find('p.p-md').text().trim()].filter(Boolean).join(' '),
            link: $(el).find('a.button-primary').attr('href') || null,
            image: {
                url: $(el).find('figure img').attr('src') || null,
                caption: $(el).find('figcaption .hds-caption-text').text().trim(),
                credit: $(el).find('figcaption .hds-credits').text().trim()
            }
        })).get();

        const featuredVideo = {
            label: $('.hds-featured-video .label').text().trim(),
            title: $('.hds-featured-video h3').text().trim(),
            description: $('.hds-featured-video p').text().trim(),
            learnMoreLink: $('.hds-featured-video a.button-primary').attr('href') || null,
            videoUrl: $('.hds-featured-video iframe').attr('src') || null
        };
        
        const getCards = (headingText) => {
            return $(`h2.section-heading-sm:contains("${headingText}")`).closest('.hds-card-grid').find('.hds-card-custom').map((i, el) => ({
                title: $(el).find('h3.heading-18').text().trim(),
                description: $(el).find('p').text().trim() || null,
                link: $(el).find('a.button-primary').attr('href') || null,
                imageUrl: $(el).find('figure img').attr('src') || null
            })).get();
        };

        const newsItems = $('.latest-news-item a').map((i, el) => ({
            title: $(el).find('p.heading-22 span').text().trim(),
            link: $(el).attr('href'),
            type: $(el).find('.label span').text().trim(),
            readTime: $(el).find('.label').first().contents().filter((_, node) => node.type === 'text').text().trim(),
            imageUrl: $(el).find('figure img').attr('src')
        })).get();
        
        $('.hds-news-item-bubble').closest('a').each((i, el) => {
            const item = $(el);
            newsItems.push({
                title: item.find('p.heading-14').text().trim(),
                link: item.attr('href'),
                type: item.find('svg + span').text().trim(),
                readTime: item.find('.label').first().contents().filter((_, node) => node.type === 'text').text().trim(),
                imageUrl: item.find('figure img').attr('src')
            });
        });

        const discoverTopics = $('.hds-topic-cards-wrapper a.topic-card').map((i, el) => ({
            title: $(el).find('p.hds-topic-card-heading span').text().trim(),
            link: $(el).attr('href'),
            imageUrl: $(el).find('figure img').attr('src') || null
        })).get();

        return {
            pageTitle: $('title').text().trim(),
            hero: heroSection,
            tenThingsAboutSolarSystem: tenThings,
            mainContentTabs: mainTabs,
            featuredVideo,
            eyesOnSolarSystem: {
                title: $('h2:contains("Eyes on the Solar System")').text().trim(),
                iframeUrl: $('iframe[src*="eyes.nasa.gov"]').attr('src') || null,
                caption: $('iframe[src*="eyes.nasa.gov"]').closest('.SmdBlockIframeEmbedBlock').find('.hds-caption-text').text().trim(),
                credit: $('iframe[src*="eyes.nasa.gov"]').closest('.SmdBlockIframeEmbedBlock').find('.hds-credits').text().trim()
            },
            featuredMissions: getCards('Featured Missions'),
            featuredArticles: getCards('Featured Articles'),
            resources: getCards('Resources'),
            solarSystemNews: newsItems,
            discoverMoreTopics: discoverTopics
        };
    } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaScienceUniverse() {
    const url = 'https://science.nasa.gov/universe/';

    try {
        const { data: html } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(html);

        const heroSection = {
            title: $('.hds-page-intro h1.page-heading-md').text().trim(),
            description: $('.hds-page-intro p.p-lg').text().trim(),
            backgroundVideo: $('.hds-page-intro video source').attr('src') || ''
        };

        const exploreTopics = $('.hds-meet-the-card').map((i, el) => {
            const linkElement = $(el).find('a').first();
            return {
                title: $(el).find('h3.heading-18').text().trim(),
                url: linkElement.attr('href') || '',
                description: $(el).find('p.p-sm').text().trim(),
                imageUrl: $(el).find('img').attr('src') || ''
            };
        }).get();

        const featuredStory = {
            title: $('.wp-block-nasa-blocks-featured-link h2.page-heading-md').text().trim(),
            description: $('.wp-block-nasa-blocks-featured-link p.p-md').text().trim(),
            link: $('.wp-block-nasa-blocks-featured-link a.button-primary').attr('href') || '',
            imageUrl: $('.wp-block-nasa-blocks-featured-link figure img').attr('src') || '',
            imageAlt: $('.wp-block-nasa-blocks-featured-link figure img').attr('alt') || '',
            imageCaption: $('.wp-block-nasa-blocks-featured-link figcaption .hds-caption-text').text().trim()
        };

        const featuredVideo = {
            title: $('.hds-featured-video h3.heading-36').text().trim(),
            description: $('.hds-featured-video p.p-sm').text().trim(),
            videoUrl: $('.hds-featured-video iframe').attr('src') || '',
            learnMoreLink: $('.hds-featured-video a.button-primary').attr('href') || ''
        };

        const callouts = $('.wp-block-nasa-blocks-callout').map((i, el) => ({
            title: $(el).find('h2.page-heading-md').text().trim(),
            description: $(el).find('p.p-lg').text().trim(),
            link: $(el).find('a.button-primary').attr('href') || '',
            imageUrl: $(el).find('figure img').attr('src') || ''
        })).get();

        const newsArticles = $('.wp-block-nasa-blocks-news-automated .latest-news-item a').map((i, el) => ({
            title: $(el).find('p.heading-22 span').text().trim(),
            url: $(el).attr('href') || '',
            readTime: $(el).find('.label').first().text().trim().replace(/ Min Read/g, ' min read'),
            imageUrl: $(el).find('figure img').attr('src') || ''
        })).get();
        
        return {
            pageTitle: $('title').text().trim(),
            hero: heroSection,
            exploreTopics,
            featuredStory,
            featuredVideo,
            callouts,
            news: {
                sectionTitle: $('.wp-block-nasa-blocks-news-automated h2.section-heading-md').text().trim(),
                articles: newsArticles
            }
        };
    } catch (error) {
        throw new Error(`Scraping failed for ${url}: ${error.message}`);
    }
}

async function scrapeNasaAeronautics() {
    try {
        const { data: html } = await axios.get('https://www.nasa.gov/aeronautics/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });
        
        const $ = cheerio.load(html);

        const heroSection = $('.hds-topic-hero');
        const hero = {
            title: heroSection.find('h1').text().trim(),
            description: heroSection.find('p.p-lg').text().trim(),
            image: heroSection.find('figure img').attr('src'),
            imageAlt: heroSection.find('figure img').attr('alt'),
            caption: heroSection.find('h2.label').text().trim()
        };

        const featuredContent = $('.hds-meet-the').first().find('.hds-meet-the-card').map((_, el) => ({
            title: $(el).find('h3').text().trim(),
            description: $(el).find('p').text().trim(),
            link: $(el).find('a').first().attr('href'),
            image: $(el).find('img').attr('src'),
        })).get();

        const latestNews = $('.wp-block-nasa-blocks-news-automated .latest-news-item a').map((_, el) => ({
            title: $(el).find('p.heading-22 span').text().trim(),
            link: $(el).attr('href'),
            image: $(el).find('figure img').attr('src'),
            readTime: $(el).find('div.label').first().text().trim(),
            type: $(el).find('svg').next('span').text().trim()
        })).get();

        const secondaryNews = $('.wp-block-nasa-blocks-news-automated .hds-news-item-bubble').map((_, el) => ({
            title: $(el).find('p.heading-14').text().trim(),
            link: $(el).closest('a').attr('href'),
            image: $(el).find('figure img').attr('src'),
            readTime: $(el).find('div.label').first().text().trim(),
            type: $(el).find('svg').next('span').text().trim()
        })).get();

        const aviationVisionCards = $('.wp-block-nasa-blocks-card-grid .hds-card-custom').map((_, el) => ({
            title: $(el).find('h3.heading-18').text().trim(),
            description: $(el).find('p').text().trim(),
            link: $(el).find('a.button-primary').attr('href'),
            image: $(el).find('figure img').attr('src')
        })).get();

        const otherTopics = $('.hds-meet-the').last().find('.hds-meet-the-card').map((_, el) => ({
            title: $(el).find('h3').text().trim(),
            description: $(el).find('p').text().trim(),
            link: $(el).find('a').first().attr('href'),
            image: $(el).find('img').attr('src'),
        })).get();

        const discoverMoreTopics = $('.wp-block-nasa-blocks-topic-cards .topic-card').map((_, el) => ({
            title: $(el).find('.hds-topic-card-heading span').text().trim(),
            link: $(el).attr('href'),
            image: $(el).find('figure img').attr('src')
        })).get();

        return {
            pageTitle: $('title').text().trim(),
            hero,
            featuredContent,
            latestNews: [...latestNews, ...secondaryNews],
            featuredVideo: {
                title: $('h2.wp-block-heading:contains("New Video")').text().trim(),
                embedUrl: $('figure.wp-block-embed-youtube iframe').attr('src')
            },
            researchDirectorate: {
                title: $('.hds-ask-nasa').eq(0).find('h2.display-48').text().trim(),
                description: $('.hds-ask-nasa').eq(0).find('p.p-md').text().trim(),
                link: $('.hds-ask-nasa').eq(0).find('a.button-primary').attr('href'),
                image: $('.hds-ask-nasa').eq(0).find('figure img').attr('src'),
                imageCredit: $('.hds-ask-nasa').eq(0).find('.hds-credits').text().trim()
            },
            aviationVision: {
                title: $('.wp-block-nasa-blocks-card-grid h2.section-heading-sm').text().trim(),
                description: $('.wp-block-nasa-blocks-card-grid > .hds-card-grid-header p').text().trim(),
                cards: aviationVisionCards
            },
            quesstMission: {
                title: $('.wp-block-nasa-blocks-featured-link h2.page-heading-md').text().trim(),
                description: $('.wp-block-nasa-blocks-featured-link p.p-md').text().trim(),
                link: $('.wp-block-nasa-blocks-featured-link a.button-primary').attr('href'),
                image: $('.wp-block-nasa-blocks-featured-link figure img').attr('src'),
                imageCredit: $('.wp-block-nasa-blocks-featured-link .hds-credits').text().trim()
            },
            otherTopics,
            discoverMoreTopics
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaTechnology() {
    const url = 'https://www.nasa.gov/technology/';
    try {
        const { data: html } = await axios.get(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
            }
        });

        const $ = cheerio.load(html);

        const heroSection = {
            title: $('div.hds-topic-hero h1').text().trim(),
            description: $('div.hds-topic-hero p.p-lg').text().trim(),
            backgroundImage: $('div.hds-topic-hero figure img').attr('src') || ''
        };

        const featuredPodcast = {
            seriesTitle: $('div.hds-featured-podcasts h2.heading-41').text().trim(),
            seriesDescription: $('div.hds-featured-podcasts p.p-sm').first().text().trim(),
            seriesLink: new URL($('div.hds-featured-podcasts a.button-primary').attr('href'), url).href,
            latestEpisode: {
                title: $('div.hds-featured-podcasts h3.heading-18').text().trim(),
                date: $('div.hds-featured-podcasts .heading-12').text().trim(),
                audioUrl: $('div.hds-audio-player-wrap audio source').attr('src') || '',
                detailsLink: new URL($('div.hds-featured-podcasts a.hds-link').attr('href'), url).href
            }
        };

        const latestNews = $('.latest-news-items a.latest-news-item').map((_, el) => {
            const $el = $(el);
            const title = $el.find('p[class*="heading-"]').text().trim();
            const link = new URL($el.attr('href'), url).href;
            const image = $el.find('figure img').attr('src') || '';
            const readTime = $el.find('.label').not(':has(svg)').text().trim();
            return { title, link, image, readTime };
        }).get();

        const technologySubtopics = $('.wp-block-nasa-blocks-featured-link-list .featured-link-list-row').map((_, el) => {
            const $el = $(el);
            const title = $el.find('h2.heading-36').text().trim();
            const description = $el.find('p.p-md').text().trim();
            const link = new URL($el.find('a').attr('href'), url).href;
            const image = $el.find('figure img').attr('src') || '';
            return { title, description, link, image };
        }).get();

        const facesOfTechnology = $('.hds-meet-the-card').map((_, el) => {
            const $el = $(el);
            const name = $el.find('h3.heading-18').text().trim();
            const role = $el.find('p.p-sm').text().trim();
            const videoLink = $el.find('a').attr('href') || '';
            const image = $el.find('figure img').attr('src') || '';
            return { name, role, videoLink, image };
        }).get();

        return {
            pageTitle: $('title').text().trim(),
            heroSection,
            featuredPodcast,
            latestNews,
            technologySubtopics,
            facesOfTechnology
        };

    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaLearningResources() {
    const url = 'https://www.nasa.gov/learning-resources/';
    try {
        const { data: html } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });

        const $ = cheerio.load(html);

        const resolveUrl = (relativeUrl) => relativeUrl ? new URL(relativeUrl, url).href : null;

        const heroSection = {
            title: $('div.hds-topic-hero h1.display-72').text().trim(),
            description: $('div.hds-topic-hero p.p-lg').text().trim(),
            imageUrl: resolveUrl($('div.hds-topic-hero figure.hds-media-background img').attr('src')),
        };

        const findYourPlaceInSpace = $('div.hds-meet-the').first().find('.hds-meet-the-card').map((_, el) => ({
            title: $(el).find('h3.heading-18').text().trim(),
            link: resolveUrl($(el).find('a').first().attr('href')),
            imageUrl: resolveUrl($(el).find('a.hds-meet-the-image img').attr('src')),
            description: $(el).find('p.p-sm').text().trim(),
        })).get();

        const learningSections = $('.hds-tabbed-section-tab').map((_, el) => ({
            title: $(el).find('h2.heading-29').text().trim(),
            subtitle: $(el).find('p.heading-16').text().trim(),
            description: $(el).find('p.p-md').text().trim(),
            link: resolveUrl($(el).find('a.button-primary').attr('href')),
            imageUrl: resolveUrl($(el).find('.hds-tabbed-section-image img').attr('src')),
        })).get();

        const latestNews = $('div.wp-block-nasa-blocks-news-automated .latest-news-item a').map((_, el) => ({
            title: $(el).find('p.heading-22, p.heading-14').text().trim(),
            link: resolveUrl($(el).attr('href')),
            imageUrl: resolveUrl($(el).find('figure img').attr('src') || $(el).find('img').attr('src')),
            readTime: $(el).find('div.label').first().text().trim(),
        })).get();

        const diveIntoStem = $('div.wp-block-nasa-blocks-featured-link-list .featured-link-list-row').map((_, el) => ({
            title: $(el).find('h2.heading-36').text().trim(),
            description: $(el).find('p.p-md').text().trim(),
            link: resolveUrl($(el).find('a').last().attr('href')),
            imageUrl: resolveUrl($(el).find('figure.hds-media-background img').attr('src')),
        })).get();

        const socialLinks = $('div#social.hds-meet-the .hds-meet-the-card').map((_, el) => ({
            platform: $(el).find('h3.heading-18').text().trim(),
            link: resolveUrl($(el).find('a').first().attr('href')),
            imageUrl: resolveUrl($(el).find('a.hds-meet-the-image img').attr('src')),
        })).get();

        return {
            hero: heroSection,
            findYourPlaceInSpace,
            learningSections,
            latestNews,
            diveIntoStem,
            socialLinks,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaAbout() {
    try {
        const { data: html } = await axios.get('https://www.nasa.gov/about/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36' }
        });

        const $ = cheerio.load(html);

        const pageTitle = $('h1.page-heading-md').text().trim();
        const introDescription = $('div.hds-page-intro p.p-lg').text().trim();

        const mainSections = $('.hds-tabbed-section-tab').map((i, el) => {
            const element = $(el);
            const linkElement = element.find('a.button-primary');
            return {
                title: element.find('h2.heading-29').text().trim(),
                description: element.find('p.p-md').text().trim(),
                link: {
                    text: linkElement.text().trim().replace(/\s\s+/g, ' '),
                    url: linkElement.attr('href') || null
                },
                imageUrl: element.find('.hds-tabbed-section-image img').attr('src') || null,
                imageCaption: element.find('figcaption .hds-caption-text').text().trim() || null
            };
        }).get();

        const leadership = [];
        $('.hds-card-grid-header:contains("NASA Leadership")').closest('.hds-card-grid').find('.hds-card-custom').each((i, cardEl) => {
            const card = $(cardEl);
            leadership.push({
                nameAndTitle: card.find('h3.heading-18').text().trim(),
                description: card.find('p').text().trim(),
                imageUrl: card.find('.hds-card-thumbnail img').attr('src'),
                bioUrl: card.find('a.button-primary').attr('href')
            });
        });

        const careersCalloutElement = $('.wp-block-nasa-blocks-callout:contains("Careers at NASA")');
        const careersCallout = {
            title: careersCalloutElement.find('h2.page-heading-md').text().trim(),
            description: careersCalloutElement.find('p.p-lg').text().trim(),
            link: {
                text: careersCalloutElement.find('a.button-primary span').clone().children().remove().end().text().trim(),
                url: careersCalloutElement.find('a.button-primary').attr('href')
            },
            backgroundImageUrl: careersCalloutElement.find('figure.hds-media-background img').attr('src')
        };

        const footerMainLinks = $('.usa-footer__primary-section .desktop\:grid-col-6 .hds-footer-menu li a').map((i, el) => ({
            text: $(el).text().trim(),
            url: $(el).attr('href')
        })).get();

        const socialLinks = $('.hds-footer-socials a').map((i, el) => ({
            platform: $(el).attr('aria-label').split(' on ')[1].split(' (')[0],
            url: $(el).attr('href')
        })).get();

        const utilityLinks = $('.hds-footer-secondary li a').map((i, el) => ({
            text: $(el).text().trim(),
            url: $(el).attr('href')
        })).get();

        return {
            pageTitle,
            introDescription,
            mainSections,
            leadership,
            careersCallout,
            footer: {
                mainLinks: footerMainLinks,
                socialLinks,
                utilityLinks
            }
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaEspanol() {
    const url = 'https://www.nasa.gov/es/';
    try {
        const { data: html } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36' }
        });

        const $ = cheerio.load(html);

        const heroSection = {
            title: $('div.hds-page-intro-banner h1').text().trim(),
            description: $('div.hds-page-intro-banner p.p-lg').text().trim(),
            backgroundImage: $('div.hds-page-intro-banner figure.hds-media-background img').attr('src') || '',
        };

        const tabbedSections = $('.hds-tabbed-section-tab').map((i, el) => {
            const element = $(el);
            return {
                title: element.find('h2.heading-29').text().trim(),
                subtitle: element.find('p.heading-16').text().trim(),
                description: element.find('p.p-md').text().trim(),
                link: element.find('a.button-primary').attr('href') || '',
                image: element.find('.hds-tabbed-section-image img').attr('src') || ''
            };
        }).get();

        const featuredPodcast = {
            seriesTitle: $('.hds-featured-podcasts h2.heading-41').text().trim(),
            seriesDescription: $('.hds-featured-podcasts p.p-sm').first().text().trim(),
            seriesLink: $('.hds-featured-podcasts a.button-primary').attr('href') || '',
            latestEpisode: {
                title: $('.hds-featured-podcasts h3.heading-18').text().trim(),
                date: $('.hds-featured-podcasts .heading-12.text-uppercase').text().trim(),
                audioUrl: $('.hds-featured-podcasts audio source').attr('src') || '',
                detailsLink: $('.hds-featured-podcasts a.hds-link').attr('href') || ''
            }
        };

        const latestNews = $('.hds-content-lists-inner .hds-content-item').map((i, el) => {
            const element = $(el);
            return {
                title: element.find('.hds-a11y-heading-22').text().trim(),
                link: element.find('a.hds-content-item-heading').attr('href') || '',
                image: element.find('.hds-content-item-thumbnail img').attr('src') || '',
                excerpt: element.find('p').first().text().trim(),
                readTime: element.find('.hds-content-item-readtime').text().trim() || '',
                contentType: element.find('.label > span').text().trim() || 'Article'
            };
        }).get();

        const spaceToGroundVideo = {
            title: $('h2.wp-block-heading:contains("Espacio a Tierra")').text().trim(),
            embedUrl: $('figure.wp-block-embed-youtube iframe').attr('src') || '',
            caption: $('figure.wp-block-embed-youtube figcaption').text().trim()
        };

        const moreNasaPages = $('.hds-featured-link-list').first().find('.featured-link-list-row').map((i, el) => {
            const element = $(el);
            return {
                title: element.find('h2.heading-36').text().trim(),
                description: element.find('p.p-md').text().trim(),
                link: element.find('a').attr('href') || '',
                image: element.find('img').attr('src') || ''
            };
        }).get();
        
        const socialMedia = $('.hds-featured-link-list').last().find('.featured-link-list-row').map((i, el) => {
            const element = $(el);
            return {
                platform: element.find('h2.heading-36').text().trim(),
                handle: element.find('p.p-md').text().trim(),
                link: element.find('a').attr('href') || ''
            };
        }).get();

        const discoverMoreTopics = $('.hds-topic-cards a.topic-card').map((i, el) => {
          const element = $(el);
          return {
            title: element.find('.hds-topic-card-heading span').text().trim(),
            link: new URL(element.attr('href'), url).href,
            image: element.find('figure.hds-media-background img').attr('src') || ''
          };
        }).get();

        return {
            pageTitle: $('title').text().trim(),
            heroSection,
            tabbedSections,
            featuredPodcast,
            latestNews,
            spaceToGroundVideo,
            moreNasaPages,
            socialMedia,
            discoverMoreTopics
        };
    } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaSocialMedia() {
    try {
        const { data: html } = await axios.get('https://www.nasa.gov/social-media/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(html);
        const content = $('.entry-content');

        const parseSocialList = (ulElement) => {
            const accounts = [];
            ulElement.find('li').each((_, li) => {
                const link = $(li).find('a');
                const text = $(li).text();
                const platform = text.split(':')[0].trim();
                const url = link.attr('href');
                if (platform && url) {
                    accounts.push({ platform, url });
                }
            });
            return accounts;
        };

        const parseGroupedSection = (startSelector, endSelector, isAstronaut = false) => {
            const items = [];
            let currentItem = null;
            
            $(startSelector).nextUntil(endSelector).each((_, element) => {
                const el = $(element);
                if (el.is('p') && el.text().trim() !== '') {
                    if (currentItem && currentItem.accounts.length > 0) {
                        items.push(currentItem);
                    }
                    const name = isAstronaut ? el.find('a').text().trim() : el.text().trim();
                    if (name) {
                         currentItem = {
                            name: name,
                            accounts: []
                        };
                    }
                } else if (el.is('ul') && currentItem) {
                    currentItem.accounts = parseSocialList(el);
                }
            });

            if (currentItem && currentItem.accounts.length > 0) {
                items.push(currentItem);
            }
            return items.filter(item => item.accounts.length > 0);
        };

        const mainAccountsList = content.find('p:contains("These accounts offer the broadest")').first().next('ul');
        const mainAccounts = parseSocialList(mainAccountsList);

        const spanishAccountsList = content.find('p:contains("Cuentas oficiales de la NASA en español")').first().next('ul');
        const spanishAccounts = parseSocialList(spanishAccountsList);

        const centers = parseGroupedSection('#centers', '#directorates');
        const directorates = parseGroupedSection('#directorates', '#missions-topics');
        const missions = parseGroupedSection('#missions-topics', '#leadership');
        const leadership = parseGroupedSection('#leadership', '#astronauts');
        
        const astronautHeadingSelector = 'p:contains("NASA Astronaut Candidates")';
        const astronauts = parseGroupedSection('#astronauts', astronautHeadingSelector, true);
        const astronautCandidates = parseGroupedSection(astronautHeadingSelector, '.hds-topic-cards', true);

        return {
            pageTitle: $('title').text().trim(),
            hero: {
                title: $('.hds-topic-hero h1').text().trim(),
                description: $('.hds-topic-hero p').text().trim()
            },
            mainAccounts,
            spanishAccounts,
            centers,
            directorates,
            missions,
            leadership,
            astronauts,
            astronautCandidates,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaNewsletters() {
    const baseUrl = 'https://www.nasa.gov';
    const targetUrl = `${baseUrl}/nasa-newsletters/`;

    try {
        const { data: html } = await axios.get(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });
        
        const $ = cheerio.load(html);

        const categories = [];
        $('h3.wp-block-heading[id]').each((_, element) => {
            const categoryTitle = $(element).text().trim();
            const table = $(element).next('figure.wp-block-table').find('table');
            
            const newsletters = $(table).find('tbody tr').map((_, row) => {
                const cells = $(row).find('td');
                if (cells.length < 2) return null;

                const titleCell = $(cells[0]);
                const descriptionCell = $(cells[1]);

                const title = titleCell.contents().first().text().trim();
                const description = descriptionCell.text().trim();
                const linkElement = titleCell.find('a');
                let signupLink = linkElement.attr('href') || '';

                if (!title || !description) return null;

                if (signupLink && !signupLink.startsWith('http')) {
                    signupLink = new URL(signupLink, baseUrl).href;
                }

                return {
                    title,
                    signupLink,
                    description
                };
            }).get().filter(Boolean);

            if (newsletters.length > 0) {
                categories.push({
                    categoryTitle,
                    newsletters
                });
            }
        });
        
        return {
            pageTitle: $('title').text().trim(),
            pageHeadline: $('h1.heading-41').text().trim(),
            categories
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaGetInvolved() {
    const baseUrl = 'https://www.nasa.gov';
    const targetUrl = `${baseUrl}/get-involved/`;

    try {
        const { data: html } = await axios.get(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });

        const $ = cheerio.load(html);

        const getAbsoluteUrl = (path) => {
            if (!path || path.startsWith('http')) {
                return path;
            }
            return new URL(path, baseUrl).href;
        };

        const hero = {
            title: $('.hds-topic-hero h1').text().trim(),
            imageUrl: getAbsoluteUrl($('.hds-topic-hero img').attr('src')),
            intro: $('.hds-page-intro p.p-lg').text().trim()
        };

        const challenges = $('#NASA-Missions .hds-content-item').map((_, el) => ({
            title: $(el).find('.hds-a11y-heading-22').text().trim(),
            link: getAbsoluteUrl($(el).find('a').attr('href')),
            description: $(el).find('p').text().trim(),
            imageUrl: getAbsoluteUrl($(el).find('img').attr('src'))
        })).get();

        const researchTabs = $('#NASA-Research .hds-tabbed-section-tab').map((i, el) => {
            const tabButton = $(`#NASA-Research button#tab${i}-citizen-science, #NASA-Research button[aria-controls="panel${i}-volunteer-for-a-nasa-study"], #NASA-Research button[aria-controls*="panel${i}"]`).first();
            return {
                tabName: tabButton.text().trim(),
                title: $(el).find('h2.heading-29').text().trim(),
                description: $(el).find('p.p-md').text().trim(),
                link: getAbsoluteUrl($(el).find('a.button-primary').attr('href')),
                imageUrl: getAbsoluteUrl($(el).find('img').attr('src')),
            }
        }).get();

        const studentOpportunities = $('#Student2 .hds-card-custom').map((_, el) => ({
            title: $(el).find('h3.heading-18').text().trim(),
            description: $(el).find('p').text().trim(),
            link: getAbsoluteUrl($(el).find('a.button-primary').attr('href')),
            imageUrl: getAbsoluteUrl($(el).find('img').attr('src'))
        })).get();

        const virtualEvents = $('#Events .hds-tabbed-section-tab').map((i, el) => {
             const tabButton = $(`#Events button[aria-controls*="panel${i}"]`).first();
            return {
                tabName: tabButton.text().trim(),
                title: $(el).find('h2.heading-29').text().trim(),
                description: $(el).find('p.p-md').text().trim(),
                link: getAbsoluteUrl($(el).find('a.button-primary').attr('href')),
                imageUrl: getAbsoluteUrl($(el).find('img').attr('src')),
            }
        }).get();

        const stayConnected = $('#Stay-Connected .hds-meet-the-card').map((_, el) => ({
            title: $(el).find('h3').text().trim(),
            description: $(el).find('p').text().trim(),
            link: getAbsoluteUrl($(el).find('a').first().attr('href')),
            imageUrl: getAbsoluteUrl($(el).find('img').attr('src'))
        })).get();

        const discoverMore = $('.hds-topic-cards .topic-card').map((_, el) => ({
            title: $(el).find('.hds-topic-card-heading span').text().trim(),
            link: getAbsoluteUrl($(el).attr('href')),
            imageUrl: getAbsoluteUrl($(el).find('img').attr('src'))
        })).get();
        
        return {
            pageTitle: $('title').text().trim(),
            hero,
            sections: {
                challenges,
                research: researchTabs,
                studentOpportunities,
                virtualEvents,
                stayConnected,
                discoverMore
            }
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaSitemap() {
    const baseUrl = 'https://www.nasa.gov';
    const targetUrl = `${baseUrl}/sitemap/`;

    const resolveUrl = (path) => {
        if (path && path.startsWith('http')) {
            return path;
        }
        if (path && path.startsWith('/')) {
            return `${baseUrl}${path}`;
        }
        return path;
    };

    try {
        const { data: html } = await axios.get(targetUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
            }
        });
        
        const $ = cheerio.load(html);

        const sitemapSections = $('.hds-sitemap-term-menu-blocks-wrapper .hds-sitemap-term-menu').map((_, el) => {
            const categoryElement = $(el).find('.hds-sitemap-menu-top-link a');
            const category = categoryElement.text().trim();
            const categoryUrl = resolveUrl(categoryElement.attr('href'));

            const links = $(el).find('li:not(.hds-sitemap-menu-top-link) a').map((_, linkEl) => ({
                text: $(linkEl).text().trim(),
                url: resolveUrl($(linkEl).attr('href'))
            })).get();

            return { category, categoryUrl, links };
        }).get();

        const contentArchive = $('.hds-sitemap-yearly-menu-blocks-wrapper .hds-sitemap-yearly-menu .hds-sitemap-menu-link a').map((_, el) => ({
            year: $(el).text().trim(),
            url: resolveUrl($(el).attr('href'))
        })).get();

        return {
            pageTitle: $('h1.display-48').text().trim(),
            sitemapSections,
            contentArchive,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaMoreMissions() {
    try {
        const { data: html } = await axios.get('https://www.nasa.gov/missions/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36' }
        });
        
        const $ = cheerio.load(html);

        const missions = $('div.hds-search-result.mission-terms-result-container').map((_, element) => {
            const el = $(element);
            const titleElement = el.find('h4.mission-terms-result-title');

            const title = titleElement.text().trim();
            const link = titleElement.parent('a').attr('href');
            const imageUrl = el.find('.mission-terms-result-image img').attr('src');
            const description = el.find('.mission-terms-result-excerpt').text().trim();

            return {
                title,
                link,
                imageUrl,
                description
            };
        }).get();
        
        return {
            source: 'NASA Missions',
            pageTitle: $('title').text().trim(),
            missions
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaMediaContacts() {
    try {
        const { data: html } = await axios.get('https://www.nasa.gov/news/nasa-media-contacts/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });
        
        const $ = cheerio.load(html);

        const mainIntroText = $('.hds-page-intro p.p-lg').text();
        const phoneRegex = new RegExp(/\d{3}-\d{3}-\d{4}/);
        const mainPhoneNumber = mainIntroText.match(phoneRegex) ? mainIntroText.match(phoneRegex)[0] : null;

        const getContactsFromTable = (selector) => {
            return $(selector).next('figure.wp-block-table').find('tbody tr').map((_, row) => {
                const cells = $(row).find('td');
                const nameCell = cells.eq(0);
                const contactLink = nameCell.find('a');

                return {
                    name: contactLink.text().trim() || nameCell.text().trim(),
                    email: contactLink.attr('href') || null,
                    responsibility: cells.eq(1).text().trim(),
                    phone: cells.eq(2).text().trim() || null,
                };
            }).get();
        };

        const getLeadershipContacts = () => {
            const contacts = [];
            $('h1#interviews').nextUntil('h1', 'figure.wp-block-table').each((_, table) => {
                $(table).find('tbody tr').each((_, row) => {
                    const cells = $(row).find('td');
                    const nameCell = cells.eq(0);
                    const contactLink = nameCell.find('a');

                    contacts.push({
                        name: contactLink.text().trim(),
                        email: contactLink.attr('href') || null,
                        title: cells.eq(1).text().trim(),
                        phone: cells.eq(2).text().trim() || null,
                    });
                });
            });
            return contacts;
        };

        const getPhotographyContacts = () => {
             return $('h1#photos-and-video').next('figure.wp-block-table').find('tbody tr').map((_, row) => {
                const cells = $(row).find('td');
                return {
                    office: cells.eq(0).text().trim(),
                    phone: cells.eq(2).text().trim(),
                };
            }).get();
        };

        const getNonMediaInquiries = () => {
            return $('h1#non-media').next('figure.wp-block-table').find('tbody tr').map((_, row) => {
                const cells = $(row).find('td');
                const contactLink = cells.eq(0).find('a');
                return {
                    department: contactLink.text().trim(),
                    email: contactLink.attr('href') || null,
                    purpose: cells.eq(1).text().trim(),
                };
            }).get();
        }

        const getCenterNewsrooms = () => {
            return $('h1#center-newsrooms').next('figure.wp-block-table').find('tbody tr').map((_, row) => {
                const cells = $(row).find('td');
                return {
                    center: cells.eq(0).text().trim(),
                    phone: cells.eq(1).text().trim(),
                };
            }).get();
        };

        const getResources = () => {
            return $('#resources .featured-link-list-row').map((_, el) => ({
                title: $(el).find('h2.heading-36').text().trim(),
                link: $(el).find('.grid-col-2 a').attr('href')
            })).get();
        };

        return {
            pageTitle: $('h1.heading-41').text().trim(),
            mainContact: {
                email: $('.hds-page-intro p.p-lg a').attr('href'),
                phone: mainPhoneNumber,
            },
            mediaContacts: getContactsFromTable('h1#media-contacts'),
            leadershipRequests: getLeadershipContacts(),
            photography: getPhotographyContacts(),
            nonMediaInquiries: getNonMediaInquiries(),
            centerNewsrooms: getCenterNewsrooms(),
            resources: getResources(),
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaPrivacy() {
    try {
        const { data: html } = await axios.get('https://www.nasa.gov/nasa-web-privacy-policy-and-important-notices/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });
        
        const $ = cheerio.load(html);
        const contentArea = $('article.type-topic');

        const pageTitle = contentArea.find('h1.heading-41').text().trim();
        const introduction = contentArea.find('p.p-lg').first().text().trim();

        const tableOfContents = contentArea.find('.hds-page-intro a[href^="#"]').map((_, el) => ({
            text: $(el).find('span').text().trim(),
            anchor: $(el).attr('href'),
        })).get();

        const sections = [];
        contentArea.find('h1.wp-block-heading').each((_, heading) => {
            const $heading = $(heading);
            const title = $heading.text().trim();
            const anchor = $heading.attr('id') || '';
            
            const content = [];
            $heading.nextUntil('h1.wp-block-heading, .wp-block-spacer').each((_, el) => {
                const $el = $(el);
                if ($el.is('p')) {
                    const text = $el.text().trim();
                    if (text) content.push({ type: 'paragraph', text });
                } else if ($el.is('ul, ol')) {
                    const items = $el.find('li').map((_, li) => $(li).text().trim().replace(/\s+/g, ' ')).get();
                    if (items.length > 0) content.push({ type: 'list', items });
                }
            });
            
            if (title && content.length > 0) {
                sections.push({ title, anchor, content });
            }
        });
        
        const officials = [];
        const officialsHeader = contentArea.find('p:contains("NASA Officials for Privacy Related Matters")');
        officialsHeader.nextAll('p').each((_, p) => {
            const $p = $(p);
            const title = $p.find('strong').text().trim();
            const htmlContent = $p.html();
            const details = htmlContent.replace(/<strong>.*?<\/strong>/g, '').split('<br>').map(line => cheerio.load(line).text().trim()).filter(Boolean);

            if (title && details.length > 0) {
                 officials.push({ title, details });
            }
        });

        return {
            pageTitle,
            introduction,
            tableOfContents,
            sections,
            officials
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaFoia() {
    try {
        const { data: html } = await axios.get('https://www.nasa.gov/foia/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        
        const $ = cheerio.load(html);

        const pageTitle = $('h1.page-heading-md').text().trim();
        const introductoryText = $('.hds-page-intro p.p-lg').text().trim();
        const bannerImageUrl = $('.hds-page-intro-banner figure.hds-media-background img').attr('src') || null;

        const foiaOfficers = $('.hds-meet-the-card').map((i, el) => {
            const element = $(el);
            return {
                name: element.find('h3.heading-18').text().trim(),
                title: element.find('p.p-sm').text().trim(),
                profileUrl: element.find('a').first().attr('href') || null,
            };
        }).get();

        const tabTitles = $('ul.hds-tab-nav li button').map((i, el) => $(el).text().trim()).get();
        const informationalTabs = $('.hds-tabbed-section-tab').map((i, el) => {
            const element = $(el);
            return {
                tabTitle: tabTitles[i] || null,
                title: element.find('h2.heading-29').text().trim(),
                description: element.find('p.p-md').text().trim(),
                link: element.find('a.button-primary').attr('href') || null,
                imageUrl: element.find('figure.hds-media-inner img').attr('src') || null
            };
        }).get();

        const foiaResources = $('.hds-card-grid a.hds-card-topic').map((i, el) => {
            const element = $(el);
            return {
                title: element.find('h3.hds-topic-card-heading span').text().trim(),
                link: element.attr('href'),
                imageUrl: element.find('figure.hds-media-background img').attr('src') || null
            };
        }).get();

        const additionalInformation = $('.hds-featured-link-list .featured-link-list-row').map((i, el) => {
            const element = $(el);
            return {
                title: element.find('h2.heading-36').text().trim(),
                description: element.find('p.p-md').text().trim(),
                link: element.find('a').attr('href') || null,
                imageUrl: element.find('figure.hds-media-background img').attr('src') || null
            };
        }).get();
        
        const submitRequestSection = $('.wp-block-nasa-blocks-featured-link');
        const submitRequest = {
            title: submitRequestSection.find('h2.page-heading-md').text().trim(),
            description: submitRequestSection.find('p.p-md').text().trim(),
            link: submitRequestSection.find('a.button-primary').attr('href') || null
        };
        
        return {
            pageTitle,
            introductoryText,
            bannerImageUrl,
            foiaOfficers,
            informationalTabs,
            foiaResources,
            additionalInformation,
            submitRequest
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaNoFearAct() {
    const url = 'https://www.nasa.gov/no-fear-act/';
    try {
        const { data: html } = await axios.get(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(html);

        const mainContent = $('article.type-topic');

        const pageTitle = mainContent.find('h1.page-heading-md').text().trim();
        const description = mainContent.find('h3.wp-block-heading').first().next('p').text().trim();

        const quarterlyReports = mainContent.find('h1.wp-block-heading:contains("Quarter Reports") + ul li a').map((i, el) => ({
            title: $(el).text().trim(),
            url: $(el).attr('href')
        })).get();

        const annualReportBlock = mainContent.find('.hds-featured-link-list');
        const annualReport = {
            title: annualReportBlock.find('h2.heading-36').text().trim(),
            url: annualReportBlock.find('a').attr('href')
        };

        const referenceDocuments = mainContent.find('p:contains("Reference Documents:") + p a').map((i, el) => ({
            title: $(el).text().trim(),
            url: $(el).attr('href')
        })).get();

        const relatedTopics = $('div.hds-topic-cards a.topic-card').map((i, el) => ({
            title: $(el).find('p.hds-topic-card-heading span').text().trim(),
            url: $(el).attr('href')
        })).get();

        return {
            pageTitle,
            description,
            quarterlyReports,
            annualReport,
            referenceDocuments,
            relatedTopics
        };

    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaOig() {
    const url = 'http://oig.nasa.gov/';
    try {
        const { data: html } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36' }
        });

        const $ = cheerio.load(html);

        const heroSlides = $('.hds-slider .hds-nasa-mag-wrapper').map((_, el) => {
            const slide = $(el);
            return {
                title: slide.find('h2.display-72').text().trim(),
                description: slide.find('p.maxw-tablet').text().trim(),
                link: slide.find('a.usa-button--secondary').attr('href') || null,
                image: slide.find('figure.hds-media-background img').attr('src') || null
            };
        }).get();

        const latestNews = $('.latest-news-items a').map((_, el) => {
            const article = $(el);
            return {
                title: article.find('p.heading-14, p.heading-22').text().trim(),
                link: article.attr('href') || null,
                image: article.find('figure.hds-media-background img').attr('src') || null,
                readTime: article.find('.label').first().text().trim().replace(/\s+/g, ' ')
            };
        }).get();

        const multimedia = $('.hds-content-lists .hds-content-item').map((_, el) => {
            const item = $(el);
            return {
                title: item.find('.hds-a11y-heading-22').text().trim(),
                link: item.find('a.hds-content-item-heading').attr('href') || item.find('a').first().attr('href') || null,
                thumbnail: item.find('figure.hds-media-background img').attr('src') || null
            };
        }).get();

        const topicCards = $('.hds-topic-cards-wrapper a.topic-card').map((_, el) => {
            const card = $(el);
            return {
                title: card.find('p.hds-topic-card-heading span').text().trim(),
                link: card.attr('href') || null,
                image: card.find('figure.hds-media-background img').attr('src') || null
            };
        }).get();

        const callouts = $('.wp-block-nasa-blocks-callout').map((_, el) => {
          const callout = $(el);
          return {
            title: callout.find('h2.page-heading-md').text().trim(),
            description: callout.find('p.p-lg').text().trim(),
            link: callout.find('a.button-primary').attr('href') || null,
            backgroundMedia: callout.find('video source').attr('src') || callout.find('figure img').attr('src') || null
          };
        }).get();

        return {
            sourceUrl: url,
            heroSlides,
            latestNews,
            multimedia,
            callouts,
            topicCards
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaBudgets() {
    try {
        const { data: html } = await axios.get('https://www.nasa.gov/budgets-plans-and-reports/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });
        
        const $ = cheerio.load(html);

        const pageTitle = $('h1.page-heading-md').text().trim();
        const bannerImage = $('.hds-page-intro-banner figure.hds-media-background img').attr('src');

        const featuredLinks = $('.hds-featured-link-list .featured-link-list-row').map((i, el) => {
            const title = $(el).find('h2.heading-36').text().trim();
            const link = $(el).find('a').attr('href');
            return { title, link };
        }).get();

        const latestNews = $('.latest-news-items .latest-news-item a').map((i, el) => {
            const title = $(el).find('p.heading-22 span').text().trim();
            const link = $(el).attr('href');
            const image = $(el).find('figure.hds-media-background img').attr('src');
            const category = $(el).find('div > div:first-child > svg + span').text().trim();
            const readTime = $(el).find('.display-block .label').text().trim();
            return { title, link, image, category, readTime };
        }).get();

        const economicBenefitsCallout = {
            title: $('.wp-block-nasa-blocks-callout h2').text().trim(),
            description: $('.wp-block-nasa-blocks-callout p').text().trim(),
            link: $('.wp-block-nasa-blocks-callout a').attr('href'),
            backgroundImage: $('.wp-block-nasa-blocks-callout figure img').attr('src')
        };

        const discoverMoreTopics = $('.hds-topic-cards a.topic-card').map((i, el) => {
            const title = $(el).find('p.hds-topic-card-heading span').text().trim();
            const link = $(el).attr('href');
            const image = $(el).find('figure.hds-media-background img').attr('src');
            return { title, link, image };
        }).get();

        return {
            pageTitle,
            bannerImage,
            featuredLinks,
            latestNews,
            economicBenefitsCallout,
            discoverMoreTopics
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaFinancialReports() {
    const url = 'https://www.nasa.gov/organizations/budget-annual-reports/agency-financial-reports/';

    try {
        const { data: html } = await axios.get(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(html);

        const pageTitle = $('.hds-featured-file-list .heading-22').text().trim();

        const reports = $('.hds-featured-file-list .hds-file-list-row').map((i, element) => {
            const item = $(element);
            const title = item.find('.hds-list-name h2').text().trim();
            const publishedDate = item.find('.hds-list-date p').text().trim();
            const fileInfo = item.find('.hds-file-list-filetype p').text().trim();
            const downloadUrl = item.find('.hds-file-list-download a').attr('href');

            return {
                title,
                publishedDate,
                fileInfo,
                downloadUrl: downloadUrl || null
            };
        }).get();

        return {
            sourceUrl: url,
            pageTitle,
            reports
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaContact() {
    try {
        const { data: html } = await axios.get('https://www.nasa.gov/contact-nasa/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36' }
        });

        const $ = cheerio.load(html);

        const pageTitle = $('div.hds-page-intro h1').text().trim();
        const pageDescription = $('div.hds-page-intro p.p-lg').text().trim();

        const addressParagraph = $('h3:contains("you may write to us at:")').next('p');
        const contactAddress = addressParagraph.html()
            .split('<br>')
            .map(line => line.trim())
            .filter(line => line);

        const linkSections = $('div.hds-featured-link-list').map((_, section) => {
            const sectionTitle = $(section).find('h2.heading-22').text().trim();
            const links = $(section).find('.featured-link-list-row').map((_, link) => ({
                title: $(link).find('h2.heading-36').text().trim(),
                description: $(link).find('p.p-md').text().trim() || null,
                url: $(link).find('a').attr('href') || null,
                imageUrl: $(link).find('img').attr('src') || null,
            })).get();
            
            if (links.length > 0) {
                return {
                    sectionTitle,
                    links
                };
            }
            return null;
        }).get().filter(Boolean);

        return {
            pageTitle,
            pageDescription,
            contactAddress,
            linkSections
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaAccessibility() {
    try {
        const { data: html } = await axios.get('https://www.nasa.gov/accessibility/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        
        const $ = cheerio.load(html);

        const pageTitle = $('h1.display-48').text().trim();
        const author = $('.article-meta-item h3.hds-meta-heading').text().trim();
        
        const metaDescription = $('meta[name="description"]').attr('content') || null;
        const ogImage = $('meta[property="og:image"]').attr('content') || null;

        const footerInfo = {};
        $('footer .hds-footer-meta').each((_, el) => {
            const labelText = $(el).find('.hds-footer-meta-label').text().trim().toLowerCase();
            const value = $(el).find('.hds-footer-meta-value').text().trim();
            if (labelText.includes('page last updated')) {
                footerInfo.lastUpdated = value;
            } else if (labelText.includes('page editor')) {
                footerInfo.pageEditor = value;
            } else if (labelText.includes('responsible nasa official')) {
                footerInfo.responsibleOfficial = value;
            }
        });

        const tableOfContents = $('ul.usa-list__article-content li a').map((_, el) => ({
            text: $(el).text().trim().replace(/\s+/g, ' '),
            anchor: $(el).attr('href') || null,
        })).get();

        const content = [];
        $('.entry-content h2').each((_, h2) => {
            const headingElement = $(h2);
            const section = {
                heading: headingElement.text().trim(),
                id: headingElement.attr('id') || null,
                paragraphs: [],
                links: [],
                listItems: []
            };
            
            const contentElements = headingElement.nextUntil('h2');
            
            contentElements.each((_, el) => {
                const element = $(el);
                if (element.is('p')) {
                    section.paragraphs.push(element.text().trim());
                    element.find('a').each((_, a) => {
                        section.links.push({
                            text: $(a).text().trim(),
                            url: $(a).attr('href') ? new URL($(a).attr('href'), 'https://www.nasa.gov').href : null
                        });
                    });
                } else if (element.is('ul')) {
                    element.find('li').each((_, li) => {
                        section.listItems.push($(li).text().trim());
                    });
                }
            });

            content.push(section);
        });

        return {
            pageTitle,
            author,
            metadata: {
                description: metaDescription,
                ogImage: ogImage
            },
            footerInfo,
            tableOfContents,
            content
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaBlogs() {
    try {
        const { data: html } = await axios.get('https://www.nasa.gov/nasa-blogs/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        
        const $ = cheerio.load(html);

        const blogs = $('.hds-featured-link-list .featured-link-list-row').map((_, el) => {
            const element = $(el);
            const title = element.find('h2.heading-36').text().trim();
            const link = element.find('div.grid-col-2 a').attr('href');
            const imageUrl = element.find('img').attr('src');
            
            return {
                title: title || null,
                link: link || null,
                imageUrl: imageUrl || null,
            };
        }).get();

        return {
            pageTitle: $('h1.display-72').text().trim(),
            blogs
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaVirtualGuest() {
    const url = 'https://www.nasa.gov/nasa-virtual-guest-program/';
    try {
        const { data: html } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });

        const $ = cheerio.load(html);

        const heroSection = $('.hds-topic-hero');
        const stats = heroSection.find('.hds-topic-hero-stats .grid-row .grid-col.grid-row').map((i, el) => ({
            value: $(el).find('.stat-number').text().trim(),
            label: $(el).find('.stat-value').text().trim(),
        })).get();

        const joinUsEvents = $('.hds-card-grid-cards .hds-card-custom').map((i, el) => ({
            title: $(el).find('h3.heading-18').text().trim(),
            description: $(el).find('p').text().trim(),
            image: $(el).find('img').attr('src'),
            registrationLink: $(el).find('a.button-primary').attr('href'),
        })).get();

        const faqs = [];
        $('h1:contains("FAQs:")').nextAll('h3.wp-block-heading').each((i, el) => {
            const question = $(el).text().trim();
            const answer = $(el).next('p').text().trim();
            if (question && answer) {
                faqs.push({ question, answer });
            }
        });
        
        const latestNewsRaw = $('.wp-block-nasa-blocks-news-automated a').map((i, el) => {
            const article = $(el);
            const title = article.find('p[class*="heading"]').text().trim();
            return title ? {
                title,
                link: new URL(article.attr('href'), url).href,
                image: article.find('img').attr('src'),
                readTime: article.find('.label').first().text().trim(),
            } : null;
        }).get();
        const latestNews = [...new Map(latestNewsRaw.map(item => [item.title, item])).values()];

        return {
            pageTitle: $('title').text().trim(),
            hero: {
                title: heroSection.find('h1').text().trim(),
                backgroundImage: heroSection.find('figure img').attr('src'),
                stats: stats
            },
            promoVideoUrl: $('figure.wp-block-embed-youtube iframe').attr('src'),
            joinUsSection: {
                title: $('.hds-card-grid-header h2').text().trim(),
                description: $('.hds-card-grid-header p').text().trim(),
                events: joinUsEvents,
            },
            faqs: faqs,
            passport: {
                title: $('.hds-featured-link-list h2.heading-36').text().trim(),
                description: $('.hds-featured-link-list p.p-md').text().trim(),
                link: $('.hds-featured-link-list a').attr('href'),
                icon: $('.hds-featured-link-list img').attr('src'),
            },
            latestNews
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaPodcasts() {
    const baseUrl = 'https://www.nasa.gov';
    const targetUrl = `${baseUrl}/podcasts-and-audio/`;

    try {
        const { data: html } = await axios.get(targetUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(html);

        const featuredPodcastContainer = $('.hds-featured-podcasts');
        const latestEpisodeContainer = featuredPodcastContainer.find('.grid-col-12.desktop\:grid-col-6').last();

        const featuredPodcast = {
            seriesTitle: featuredPodcastContainer.find('h2.heading-41').text().trim(),
            seriesDescription: featuredPodcastContainer.find('p.p-sm').text().trim(),
            seriesLink: new URL(featuredPodcastContainer.find('a.button-primary').attr('href'), baseUrl).href,
            latestEpisode: {
                title: latestEpisodeContainer.find('h3.heading-18').text().trim(),
                date: latestEpisodeContainer.find('.heading-12.text-uppercase').text().trim(),
                link: new URL(latestEpisodeContainer.find('a.hds-link').attr('href'), baseUrl).href,
                audioUrl: latestEpisodeContainer.find('audio > source').attr('src') || null,
                imageUrl: latestEpisodeContainer.find('div.hds-audio-image img').attr('src') || null
            }
        };

        const podcastCategories = $('.hds-featured-link-list .featured-link-list-row').map((_, el) => {
            const element = $(el);
            return {
                title: element.find('h2.heading-36').text().trim(),
                description: element.find('p.p-md').text().trim(),
                link: new URL(element.find('a').last().attr('href'), baseUrl).href,
                imageUrl: element.find('img').attr('src') || null
            };
        }).get();

        return {
            pageTitle: $('head title').text().trim(),
            pageDescription: $('head meta[name="description"]').attr('content').trim(),
            featuredPodcast,
            podcastCategories
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaPlusSeries() {
    try {
        const { data: html } = await axios.get('https://plus.nasa.gov/series/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });

        const $ = cheerio.load(html);

        const seriesList = $('article.series-grid').map((i, element) => {
            const seriesCard = $(element);
            const linkElement = seriesCard.find('a.series-grid--link');

            const title = linkElement.find('h4.series-grid--title').text().trim();
            const url = linkElement.attr('href') || null;
            
            const episodeInfo = linkElement.find('p.font-family-mono').text().trim();
            const episodeCount = parseInt(episodeInfo.split(' ')[0], 10) || 0;

            const figure = linkElement.find('figure.series-grid--thumbnail');
            const styleAttr = figure.attr('style') || '';
            const imageUrlMatch = styleAttr.match(/url\(\s*([^)]+?)\s*\)/);
            const imageUrl = imageUrlMatch ? imageUrlMatch[1].trim() : null;

            return {
                title,
                url,
                imageUrl,
                episodeCount,
            };
        }).get();

        return {
            source: 'NASA+ Series',
            pageUrl: 'https://plus.nasa.gov/series/',
            series: seriesList,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaRecentlyPublished() {
    const url = 'https://www.nasa.gov/news/recently-published/';
    try {
        const { data: html } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });

        const $ = cheerio.load(html);

        const articles = $('.hds-content-item').map((index, element) => {
            const el = $(element);
            
            const title = el.find('.hds-content-item-heading').text().trim();
            const link = el.find('.hds-content-item-heading').attr('href');
            const imageUrl = el.find('.hds-content-item-thumbnail img').attr('src');
            const readTime = el.find('.hds-content-item-readtime').text().trim() || null;
            const excerpt = el.find('.hds-content-item-inner > p').text().trim();
            const contentType = el.find('.hds-content-item-inner > div.label span').text().trim();

            return {
                title,
                link,
                imageUrl,
                readTime,
                excerpt,
                contentType
            };
        }).get();

        return {
            source: 'NASA Recently Published',
            url,
            totalArticles: articles.length,
            articles
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaNewsReleases(year = new Date().getFullYear()) {
    try {
        if (typeof year !== 'number') {
            const parsedYear = parseInt(year);
            if (isNaN(parsedYear)) {
                throw new Error('Year must be a valid number');
            }
            year = parsedYear;
        }

        const currentYear = new Date().getFullYear();
        if (year < 1990 || year > currentYear) {
            throw new Error(`Year must be between 1990 and ${currentYear}`);
        }

        const axiosInstance = axios.create({
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const url = `https://www.nasa.gov/${year}-news-releases/`;
        
        let response;
        try {
            response = await axiosInstance.get(url);
        } catch (axiosError) {
            if (axiosError.response) {
                if (axiosError.response.status === 404) {
                    throw new Error(`NASA page not found for year ${year}`);
                }
                throw new Error(`HTTP Error ${axiosError.response.status}`);
            } else if (axiosError.code === 'ECONNREFUSED') {
                throw new Error('Connection refused to NASA website');
            } else if (axiosError.code === 'ETIMEDOUT') {
                throw new Error('Request timeout to NASA website');
            } else if (axiosError.code === 'ENOTFOUND') {
                throw new Error('NASA website domain not found');
            } else {
                throw new Error(`Network error: ${axiosError.message}`);
            }
        }

        if (!response.data || typeof response.data !== 'string') {
            throw new Error('Invalid response from NASA website');
        }

        if (response.status !== 200) {
            throw new Error(`HTTP Error ${response.status}`);
        }

        let $;
        try {
            $ = cheerio.load(response.data);
        } catch (cheerioError) {
            throw new Error('Failed to parse HTML content');
        }

        if ($('body').length === 0) {
            throw new Error('Invalid HTML structure');
        }

        const pageTitle = $('h2.section-heading-sm').text().trim() || `NASA ${year} News Releases`;

        const newsItems = [];
        $('.hds-content-item').each((index, element) => {
            try {
                const el = $(element);
                const titleElement = el.find('a.hds-content-item-heading');
                const title = titleElement.text().trim();
                
                if (!title) return;
                
                let itemUrl = titleElement.attr('href');
                const excerpt = el.find('div.hds-content-item-inner p').text().trim();
                const imageUrl = el.find('a.hds-content-item-thumbnail img').attr('src');
                const readTime = el.find('.hds-content-item-readtime').text().trim().replace(/\s\s+/g, ' ');
                const type = el.find('div.display-flex.flex-align-center.label span').text().trim();
                
                if (itemUrl && !itemUrl.startsWith('http')) {
                    itemUrl = `https://www.nasa.gov${itemUrl}`;
                }

                newsItems.push({
                    title,
                    url: itemUrl || null,
                    excerpt: excerpt || 'No excerpt available',
                    imageUrl: imageUrl || null,
                    readTime: readTime || 'Unknown',
                    type: type || 'General'
                });
            } catch (itemError) {
                console.warn(`Warning: Failed to parse news item ${index}`);
            }
        });

        if (newsItems.length === 0) {
            console.warn(`Warning: No news items found for ${year}`);
        }

        return {
            success: true,
            source: url,
            pageTitle,
            newsReleases: newsItems,
            year,
            scrapedAt: new Date().toISOString(),
            totalItems: newsItems.length
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message,
            year: year,
            timestamp: new Date().toISOString(),
            newsReleases: []
        };
    }
}

async function scrapeNasaImages() {
    try {
        const { data: html } = await axios.get('https://www.nasa.gov/images/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        
        const $ = cheerio.load(html);

        const imageOfTheDaySection = $('.hds-image-of-the-day');
        const imageOfTheDay = {
            title: imageOfTheDaySection.find('p.heading-22').text().trim(),
            description: imageOfTheDaySection.find('p.p-md').text().trim(),
            imageUrl: imageOfTheDaySection.find('figure img').attr('src'),
            pageUrl: imageOfTheDaySection.find('.under-image-button a').attr('href')
        };

        const historySection = $('.wp-block-nasa-blocks-callout');
        const nasaHistory = {
            title: historySection.find('h2.page-heading-md').text().trim(),
            description: historySection.find('p.p-lg').text().trim(),
            link: historySection.find('a.button-primary').attr('href'),
            backgroundImage: historySection.find('figure img').attr('src')
        };

        const imageResources = $('.hds-featured-link-list .featured-link-list-row').map((_, el) => {
            const element = $(el);
            return {
                title: element.find('h2.heading-36').text().trim(),
                link: element.find('a').attr('href')
            };
        }).get();

        const gallerySection = $('.hds-gallery-preview');
        const featuredGallery = {
            title: gallerySection.find('h2.heading-22').text().trim(),
            metadata: gallerySection.find('.hds-gallery-preview-label').text().trim().replace(/\s\s+/g, ' '),
            galleryLink: gallerySection.find('.desktop\:grid-col-4 a.button-primary').attr('href'),
            images: gallerySection.find('.hds-gallery-preview-item img').map((_, img) => $(img).attr('src')).get()
        };

        const discoverMore = $('.hds-topic-cards a.topic-card').map((_, el) => {
            const element = $(el);
            return {
                title: element.find('.hds-topic-card-heading span').text().trim(),
                link: element.attr('href'),
                image: element.find('figure img').attr('src')
            };
        }).get();

        return {
            pageTitle: $('.hds-topic-hero h1').text().trim(),
            pageDescription: $('.hds-topic-hero .p-lg').text().trim(),
            heroImage: $('.hds-topic-hero figure img').attr('src'),
            imageOfTheDay,
            nasaHistory,
            imageResources,
            featuredGallery,
            discoverMore
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaLive() {
    const url = 'https://www.nasa.gov/live';

    try {
        const { data: html } = await axios.get(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(html);

        const featuredVideoContainer = $('.hds-featured-video');
        const featuredVideo = {
            title: featuredVideoContainer.find('h3.heading-36').text().trim(),
            description: featuredVideoContainer.find('p.color-carbon-20').text().trim(),
            link: featuredVideoContainer.find('a.button-primary').attr('href') || '',
            embedUrl: featuredVideoContainer.find('.hds-embed-container iframe').attr('src') || ''
        };

        const upcomingEventsStatus = $('h1.wp-block-heading:contains("Upcoming Events")').nextAll('p').first().text().trim();

        const watchOptions = $('.hds-featured-link-list .featured-link-list-row').map((_, el) => {
            const element = $(el);
            return {
                title: element.find('h2.heading-36').text().trim(),
                description: element.find('p.p-md').text().trim(),
                link: element.find('a').attr('href') || '',
                iconUrl: element.find('img').attr('src') || ''
            };
        }).get();

        return {
            pageTitle: $('title').text().trim(),
            featuredVideo,
            upcomingEventsStatus,
            watchOptions
        };

    } catch (error) {
        throw new Error(`Scraping failed for ${url}: ${error.message}`);
    }
}

async function scrapeNasaApps() {
    const url = 'https://www.nasa.gov/apps/';
    try {
        const { data: html } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });
        
        const $ = cheerio.load(html);

        const featuredApps = [];
        const mainFeaturedAppContainer = $('.wp-block-nasa-blocks-featured-link');
        if (mainFeaturedAppContainer.length) {
            featuredApps.push({
                title: mainFeaturedAppContainer.find('h2.page-heading-md').text().trim(),
                description: mainFeaturedAppContainer.find('p.p-md').text().trim(),
                link: mainFeaturedAppContainer.find('a.button-primary').attr('href') || null,
                imageUrl: mainFeaturedAppContainer.find('figure img').attr('src') || null,
            });
        }

        const spotTheStationContainer = $('.wp-block-nasa-blocks-story');
        if (spotTheStationContainer.length) {
            featuredApps.push({
                title: spotTheStationContainer.find('h2.display-48').text().trim(),
                category: spotTheStationContainer.find('h3.subtitle-md').text().trim(),
                description: spotTheStationContainer.find('p.p-md').first().text().trim(),
                link: spotTheStationContainer.find('a.button-primary').attr('href') || null,
                imageUrl: spotTheStationContainer.find('figure img').attr('src') || null,
            });
        }

        const otherApps = [];
        $('div.entry-content h3.wp-block-heading').each((_, element) => {
            const title = $(element).text().trim();
            const linksParagraph = $(element).next('p');

            if (linksParagraph.length) {
                const storeLinks = linksParagraph.find('a').map((_, linkEl) => ({
                    storeName: $(linkEl).text().trim(),
                    url: $(linkEl).attr('href') || null
                })).get();

                if (storeLinks.length > 0) {
                    otherApps.push({
                        title,
                        storeLinks
                    });
                }
            }
        });

        return {
            pageTitle: $('h1.page-heading-md').text().trim(),
            featuredApps,
            otherApps,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaPodcasts() {
    try {
        const { data: html } = await axios.get('https://www.nasa.gov/podcasts/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        
        const $ = cheerio.load(html);

        const pageTitle = $('h1.display-100').text().trim();
        const pageDescription = $('div.grid-container-widescreen > p.p-lg').text().trim();

        const podcasts = $('div.hds-content-item').map((_, element) => {
            const card = $(element);
            const title = card.find('h3.heading-22').text().trim();
            const link = card.find('a.hds-content-item-heading').attr('href');
            const imageUrl = card.find('a.hds-content-item-thumbnail img').attr('src');
            const description = card.find('div.hds-content-item-inner p').text().trim();

            return {
                title,
                link,
                imageUrl,
                description,
            };
        }).get();

        return {
            source: 'NASA Podcasts',
            pageTitle,
            pageDescription,
            podcasts,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaImageOfTheDay() {
    try {
        const { data: html } = await axios.get('https://www.nasa.gov/image-of-the-day/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        
        const $ = cheerio.load(html);
        
        const pageTitle = $('h1.heading-22').text().trim();

        const images = $('.hds-gallery-item-single.hds-gallery-image').map((_, el) => {
            const element = $(el);
            const linkElement = element.find('a.hds-gallery-item-link');
            const imgElement = linkElement.find('img');

            const articleUrl = linkElement.attr('href') || '';
            const imageUrl = imgElement.attr('src') || '';
            const altText = imgElement.attr('alt') || '';
            const caption = element.find('.hds-gallery-item-caption').text().trim();

            return {
                articleUrl,
                imageUrl,
                altText,
                caption
            };
        }).get();

        return {
            pageTitle,
            totalImages: images.length,
            images,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaEbooks() {
    const targetUrl = 'https://www.nasa.gov/ebooks/';

    try {
        const { data: html } = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
            }
        });

        const $ = cheerio.load(html);

        const extractBooksFromSection = (sectionSelector) => {
            return $(sectionSelector).find('.hds-card-custom').map((_, el) => {
                const title = $(el).find('h3.heading-18').text().trim();
                const imageUrl = $(el).find('.hds-card-thumbnail img').attr('src');
                const overviewUrl = $(el).find('a.button-primary').attr('href');

                return {
                    title,
                    imageUrl: imageUrl || null,
                    overviewUrl: overviewUrl || null,
                };
            }).get();
        };

        const aeronautics = extractBooksFromSection('#aeronautics');
        const history = extractBooksFromSection('#history');
        const hubble = extractBooksFromSection('#hubble');

        return {
            aeronautics,
            history,
            hubble,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaInteractives() {
    const targetUrl = 'https://www.nasa.gov/interactives/';

    try {
        const { data: html } = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
            }
        });

        const $ = cheerio.load(html);

        const sections = [];

        $('div.hds-card-grid').each((i, sectionElem) => {
            const sectionTitle = $(sectionElem).find('h2.section-heading-sm').text().trim();
            const sectionDescription = $(sectionElem).find('.hds-card-grid-header > p').text().trim();

            const items = $(sectionElem).find('.hds-card-custom').map((_, cardElem) => {
                const card = $(cardElem);
                const title = card.find('h3.heading-18').text().trim();
                const description = card.find('p.line-height-lg').text().trim();
                const link = card.find('a.button-primary').attr('href') || null;
                const imageUrl = card.find('.hds-card-thumbnail img').attr('src') || null;

                return {
                    title,
                    description,
                    link: link ? (link.startsWith('http') ? link : new URL(link, targetUrl).href) : null,
                    imageUrl,
                };
            }).get();

            sections.push({
                section: sectionTitle || 'Games and Interactives',
                description: sectionDescription || null,
                items
            });
        });

        return {
            pageTitle: $('h1.page-heading-md').text().trim(),
            sections
        };

    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeNasaStemMultimedia() {
    const targetUrl = 'https://www.nasa.gov/learning-resources/search/?terms=8058%2C8059%2C8061%2C8062%2C8068';
    try {
        const { data: html } = await axios.get(targetUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
            }
        });

        const $ = cheerio.load(html);

        const scriptContent = $('#nasa-hds-faceted-filter-js-extra').html();
        const jsonString = scriptContent.substring(scriptContent.indexOf('{'), scriptContent.lastIndexOf('}') + 1);
        const pageData = JSON.parse(jsonString);

        const resources = pageData.results.posts.map(post => {
            const $image = cheerio.load(post.image);
            const imageUrl = $image('img').attr('src') || '';
            
            return {
                title: post.title || null,
                link: post.link || null,
                description: post.desc || null,
                imageUrl: imageUrl,
            };
        });

        return {
            totalResults: pageData.results.results,
            totalPages: pageData.results.pages,
            resources: resources,
        };
    } catch (error) {
        throw new Error(`Scraping failed for ${targetUrl}: ${error.message}`);
    }
}

async function scrapeNasaBrandCenter() {
    const url = 'https://www.nasa.gov/nasa-brand-center/';
    try {
        const { data: html } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        
        const $ = cheerio.load(html);
        
        const pageIntro = $('.wp-block-nasa-blocks-page-intro').first();
        const pageTitle = pageIntro.find('h1.page-heading-md').text().trim();
        const pageDescription = pageIntro.find('p.p-lg').text().trim();
        const bannerImage = pageIntro.find('.hds-media-background img').attr('src');

        const guidelineCards = $('.hds-card-grid .hds-card-custom').map((_, el) => {
            const element = $(el);
            return {
                title: element.find('h3.heading-18').text().trim(),
                description: element.find('p.line-height-lg').text().trim(),
                link: element.find('a.button-primary').attr('href'),
                image: element.find('.hds-card-thumbnail img').attr('src')
            };
        }).get();

        const graphicStandardsSection = $('.wp-block-nasa-blocks-story');
        const graphicStandards = {
            subtitle: graphicStandardsSection.find('h3.subtitle-md').text().trim(),
            title: graphicStandardsSection.find('h2.display-48').text().trim(),
            summary: graphicStandardsSection.find('p.heading-18').text().trim(),
            description: graphicStandardsSection.find('p.p-md').text().trim(),
            image: {
                src: graphicStandardsSection.find('img').attr('src'),
                alt: graphicStandardsSection.find('img').attr('alt'),
                caption: graphicStandardsSection.find('.hds-caption-text').text().trim(),
                credits: graphicStandardsSection.find('.hds-credits').text().trim()
            }
        };

        const additionalGuidelines = $('h2.wp-block-heading[id]').map((_, el) => {
            const headingElement = $(el);
            const title = headingElement.text().trim();
            const content = headingElement.nextUntil('h2.wp-block-heading, .wp-block-spacer + h2.wp-block-heading')
                .filter('p')
                .map((_, p) => $(p).text().trim().replace(/\n/g, ' '))
                .get()
                .filter(text => text.length > 0 && text !== 'NOTE:');

            return { title, content };
        }).get();

        return {
            pageTitle,
            pageDescription,
            bannerImage,
            guidelineCards,
            graphicStandards,
            additionalGuidelines
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export {
    scrapeNasa,
    scrapeNasaPlus,
    scrapeNasaNews,
    scrapeNasaEvents,
    scrapeNasaLaunches,
    scrapeNasaMultimedia,
    scrapeNasaMissions,
    scrapeNasaMoreMissions,
    scrapeNasaHumansInSpace,
    scrapeNasaScience,
    scrapeNasaScienceEarth,
    scrapeNasaScienceSolarSystem,
    scrapeNasaScienceUniverse,
    scrapeNasaAeronautics,
    scrapeNasaTechnology,
    scrapeNasaLearningResources,
    scrapeNasaAbout,
    scrapeNasaEspanol,
    scrapeNasaSocialMedia,
    scrapeNasaNewsletters,
    scrapeNasaGetInvolved,
    scrapeNasaSitemap,
    scrapeNasaMediaContacts,
    scrapeNasaPrivacy,
    scrapeNasaFoia,
    scrapeNasaNoFearAct,
    scrapeNasaOig,
    scrapeNasaBudgets,
    scrapeNasaFinancialReports,
    scrapeNasaContact,
    scrapeNasaAccessibility,
    scrapeNasaBlogs,
    scrapeNasaVirtualGuest,
    scrapeNasaPodcasts,
    scrapeNasaPlusSeries,
    scrapeNasaRecentlyPublished,
    scrapeNasaNewsReleases,
    scrapeNasaImages,
    scrapeNasaLive,
    scrapeNasaApps,
    scrapeNasaPodcasts,
    scrapeNasaImageOfTheDay,
    scrapeNasaEbooks,
    scrapeNasaInteractives,
    scrapeNasaStemMultimedia,
    scrapeNasaBrandCenter
};
// This comes from: https://gist.github.com/Frenzycore/f8b45d4648367e297cfdc95b34e700bc