import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeBingSearch(q) {
    let query = q || "Hello, World!";
    const url = 'https://www.bing.com/search?q=' + encodeURIComponent(query);
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            }
        });

        const $ = cheerio.load(html);

        const searchResults = $('#b_results .b_algo').map((_, element) => {
            const el = $(element);
            const title = el.find('h2 a').text().trim();
            const link = el.find('h2 a').attr('href');
            const snippet = el.find('.b_caption p').text().trim();
            const displayUrl = el.find('.b_attribution cite').text().trim();

            return {
                title,
                link,
                snippet,
                displayUrl
            };
        }).get();

        const totalResultsText = $('.sb_count').text().trim();

        return {
            searchQuery: $('#sb_form_q').val(),
            totalResults: totalResultsText,
            results: searchResults
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeBingCopilotSearch(q) {
    try {
        let query = q || "Hello, World!";
        const targetUrl = 'https://www.bing.com/copilotsearch?q=' + encodeURIComponent(query);
        const { data: html } = await axios.get(targetUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            }
        });
        
        const $ = cheerio.load(html);

        const getFullUrl = (path) => {
            if (!path) return null;
            return path.startsWith('http') ? path : `https://www.bing.com${path}`;
        }

        const mainNavLinks = $('.b_scopebar .b_scopeList > li').map((_, el) => {
            const linkElement = $(el).find('a');
            const textContent = linkElement.length ? linkElement.text().trim() : $(el).text().trim();
            const cleanText = textContent.replace(/Search$/, '').trim();

            return {
                text: cleanText,
                link: linkElement.length ? getFullUrl(linkElement.attr('href')) : null,
                isActive: $(el).hasClass('b_active')
            };
        }).get();

        const moreNavLinks = $('.b_scopebar #b-scopeListItem-menu .b_sp_over_menu li a').map((_, el) => ({
            text: $(el).text().trim(),
            link: getFullUrl($(el).attr('href')),
            isActive: false
        })).get();
        
        const disclaimer = $('.b_cs_disclaimer span:first-child').text().trim();
        const searchQuery = new URL(targetUrl).searchParams.get('q');
        const composerPlaceholder = $('textarea#b_copilot_composer_2').attr('placeholder') || '';

        return {
            searchQuery,
            disclaimer,
            composerPlaceholder,
            navigation: {
                main: mainNavLinks,
                more: moreNavLinks
            }
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeBingSearchImages(q) {
    let query = q || "Hello, World!";
    const targetUrl = 'https://www.bing.com/images/search?q=' + encodeURIComponent(query);
    try {
        const { data: html } = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            }
        });

        const $ = cheerio.load(html);

        const searchQuery = $('input#sb_form_q').val() || null;

        const images = $('div.dg_b .iusc').map((_, el) => {
            const linkElement = $(el);
            const metadataJson = linkElement.attr('m');
            if (!metadataJson) return null;

            const metadata = JSON.parse(metadataJson);
            const container = linkElement.closest('.iuscp');

            return {
                title: metadata.t || null,
                mediaUrl: metadata.murl || null,
                pageUrl: metadata.purl || null,
                thumbnailUrl: linkElement.find('img.mimg').attr('src') || null,
                dimensions: container.find('.img_info .nowrap').text().trim() || null,
                sourceDomain: container.find('.img_info .lnkw a').text().trim() || null,
            };
        }).get().filter(Boolean);

        const relatedSearches = $('#rfCarousel .suggestion-item').map((_, el) => {
            const item = $(el);
            return {
                query: item.attr('title').replace('Search for: ', '').trim() || null,
                link: 'https://www.bing.com' + (item.attr('href') || ''),
                thumbnail: item.find('img').attr('src') || null,
            };
        }).get();

        return {
            searchQuery,
            images,
            relatedSearches
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeBingSearchVideos(q) {
    let query = q || "Hello, World!";
    const baseUrl = 'https://www.bing.com';
    const targetUrl = `${baseUrl}/videos/search?q=${encodeURIComponent(query)}`;

    try {
        const { data: html } = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(html);

        const videos = $('.mc_vtvc.isv').map((_, el) => {
            const element = $(el);
            const title = element.find('.mc_vtvc_title').text().trim();
            const link = element.find('a.mc_vtvc_link').attr('href');
            const thumbnailElement = element.find('.cico img');
            const thumbnailUrl = thumbnailElement.attr('data-src-hq') || thumbnailElement.attr('src');
            const duration = element.find('.mc_bc_rc.items').text().trim();
            const views = element.find('.meta_vc_content').text().trim();
            const uploadDate = element.find('.meta_pd_content').text().trim();
            const source = element.find('.mc_vtvc_meta_row span').first().text().trim();
            const channel = element.find('.mc_vtvc_meta_row_channel').text().trim();

            return {
                title,
                link: link ? `${baseUrl}${link}` : null,
                thumbnailUrl,
                duration,
                views,
                uploadDate,
                source,
                channel,
            };
        }).get();

        const relatedSearches = $('#rfCarousel .suggestion-item').map((_, el) => {
            const element = $(el);
            const query = element.attr('title').replace('Search for:', '').trim();
            const link = element.attr('href');

            return {
                query,
                link: link ? `${baseUrl}${link}` : null,
            };
        }).get();
        
        const searchQuery = $('#sb_form_q').val();

        return {
            searchQuery,
            videoCount: videos.length,
            relatedSearches,
            videos,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeBingShortVideos(q) {
    try {
        let query = q || "Hello, World!"
        const { data: html } = await axios.get('https://www.bing.com/videos/search?view=shortvideo&qft=+filterui:filterhint-shortvideo&q=' + encodeURIComponent(query), {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });

        const $ = cheerio.load(html);

        const videos = $('.mc_vtvc').map((_, el) => {
            const videoElement = $(el);
            const metadataJson = JSON.parse(videoElement.attr('mmeta') || '{}');

            const title = videoElement.find('.mc_vtvc_title').text().trim();
            const bingLink = 'https://www.bing.com' + videoElement.find('.mc_vtvc_link').attr('href');
            const duration = videoElement.find('.mc_bc_rc.items').text().trim();

            const metadataContainer = videoElement.find('.mc_vtvc_meta_block');
            const viewCount = metadataContainer.find('.meta_vc_content').text().trim();
            const uploadDate = metadataContainer.find('.meta_pd_content').text().trim();
            const source = metadataContainer.find('.mc_vtvc_meta_row').last().find('span').first().text().trim();
            const channel = metadataContainer.find('.mc_vtvc_meta_row_channel').text().trim();

            return {
                title,
                bingLink,
                sourceUrl: metadataJson.murl || null,
                thumbnailUrl: videoElement.find('.mc_vtvc_th img').attr('data-src-hq') || metadataJson.turl,
                duration,
                viewCount,
                uploadDate,
                source,
                channel
            };
        }).get();

        return {
            searchQuery: $('#sb_form_q').val(),
            videoCount: videos.length,
            videos: videos
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeBingSearchMaps(q) {
    try {
        let query = q || "Hello, World!"
        const { data: html } = await axios.get('https://www.bing.com/maps/search?q=' + encodeURIComponent(query), {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36' }
        });
        
        const $ = cheerio.load(html);

        let serverData = null;
        let v10ControlConfig = null;

        $('script').each((_, element) => {
            const scriptContent = $(element).html();
            if (scriptContent && scriptContent.includes('window.serverData =')) {
                try {
                    const jsonString = scriptContent.match(/window\.serverData\s*=\s*({.*});/s)[1];
                    serverData = JSON.parse(jsonString);
                } catch (e) {
                    // JSON parsing might fail, ignore if it does
                }
            }
            if (scriptContent && scriptContent.includes("window['v10ControlConfig'] =")) {
                try {
                    const jsonString = scriptContent.match(/window\['v10ControlConfig'\]\s*=\s*({.*});/s)[1];
                    v10ControlConfig = JSON.parse(jsonString);
                } catch (e) {
                    // JSON parsing might fail, ignore if it does
                }
            }
        });
        
        return {
            pageTitle: $('title').text().trim(),
            metaDescription: $('meta[name="description"]').attr('content') || null,
            ogTitle: $('meta[property="og:title"]').attr('content') || null,
            ogDescription: $('meta[property="og:description"]').attr('content') || null,
            ogImage: $('meta[property="og:image"]').attr('content') || null,
            serverData: serverData,
            v10ControlConfig: v10ControlConfig
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeBingSearchNews(q) {
    let query = q || "Hello, World!";
    const url = 'https://www.bing.com/news/search?q=' + encodeURIComponent(query);
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Connection': 'keep-alive'
            }
        });

        const $ = cheerio.load(html);

        const articles = $('div.news-card').map((_, element) => {
            const card = $(element);
            const title = card.find('a.title h2').text().trim();
            const link = card.find('a.title').attr('href');
            const snippet = card.find('div.snippet').text().trim();
            const sourceElement = card.find('div.source');
            const time = sourceElement.find('span > div.ns_sc_tm').text().trim();

            let sourceName = '';
            if (sourceElement.find('a').length > 0) {
                sourceName = sourceElement.find('a').first().text().trim();
            } else {
                const sourceText = sourceElement.text().trim();
                sourceName = sourceText.substring(0, sourceText.indexOf(time)).trim();
            }

            const imageUrlData = card.find('div.image img').attr('data-src-hq') || card.find('div.image img').attr('data-src');
            const imageUrl = imageUrlData ? `https:${imageUrlData}` : null;

            return {
                title,
                link,
                snippet,
                source: sourceName,
                published: time,
                thumbnail: imageUrl
            };
        }).get();

        return {
            searchQuery: $('#sb_form_q').val(),
            articles: articles.filter(article => article.title && article.link)
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export {
    scrapeBingSearch,
    scrapeBingCopilotSearch,
    scrapeBingSearchImages,
    scrapeBingSearchVideos,
    scrapeBingShortVideos,
    scrapeBingSearchMaps,
    scrapeBingSearchNews
};
// This comes from: https://gist.github.com/Frenzycore/55f59d87587c6903977c569a03fe459a