import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeModyolo() {
    try {
        const { data: html } = await axios.get("https://modyolo.com/", {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const scrapeAppSection = (sectionTitle) => {
            const sectionHeader = $(`h2.h5 a:contains("${sectionTitle}")`);
            const sectionElement = sectionHeader.closest("section");

            return sectionElement
                .find("a.archive-post")
                .map((_, el) => {
                    const item = $(el);
                    const metadataDivs = item.find(
                        "div.small.text-truncate.text-muted"
                    );
                    const versionDownloadsInfo = metadataDivs
                        .first()
                        .find("span.align-middle");

                    return {
                        title: item.find("h3.h6").text().trim(),
                        link: item.attr("href"),
                        iconUrl: item.find("img.wp-post-image").attr("src"),
                        version:
                            versionDownloadsInfo.first().text().trim() || null,
                        downloads:
                            versionDownloadsInfo.length > 1
                                ? versionDownloadsInfo.last().text().trim()
                                : null,
                        modFeatures:
                            metadataDivs
                                .eq(1)
                                .find("span.align-middle")
                                .text()
                                .trim() || null,
                    };
                })
                .get();
        };

        const newsSection = $('h2 a[href="https://modyolo.com/news"]').closest(
            "section"
        );
        const news = newsSection
            .find('.row > div[class*="col-"]')
            .map((_, el) => {
                const item = $(el).find("a");
                const style = item.attr("style") || "";
                const imageUrlMatch = style.match(/url\((.*?)\)/);
                return {
                    title: item.find("h3").text().trim(),
                    link: item.attr("href"),
                    imageUrl: imageUrlMatch ? imageUrlMatch[1] : null,
                };
            })
            .get();

        const scrapeSidebarCategories = (headerIndex) => {
            const section = $(`aside#secondary section:eq(${headerIndex})`);
            return section
                .find(".row a")
                .map((_, el) => ({
                    name: $(el).text().trim(),
                    link: $(el).attr("href"),
                }))
                .get();
        };

        return {
            news,
            essentialApps: scrapeAppSection("Essential Apps"),
            editorsChoice: scrapeAppSection("Editor's Choice"),
            latestGames: scrapeAppSection("Games Mod - Latest"),
            latestPremiumApps: scrapeAppSection("Premium Apps - Latest"),
            gameCategories: scrapeSidebarCategories(0),
            appCategories: scrapeSidebarCategories(1),
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeModyoloApps() {
    const targetUrl = 'https://modyolo.com/apps';

    try {
        const { data: html } = await axios.get(targetUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
            }
        });
        
        const $ = cheerio.load(html);

        const pageTitle = $('h1.h5').text().trim();

        const apps = $('div.col-12.col-md-6.col-xl-4.mb-3').map((_, el) => {
            const appCard = $(el).find('a.archive-post');

            const title = appCard.find('h3').text().trim();
            const link = appCard.attr('href') || null;
            const imageUrl = appCard.find('img.wp-post-image').attr('src') || null;

            const metadataContainer = appCard.find('.small.text-truncate.text-muted').eq(0);
            const metadataText = metadataContainer.text().trim().replace(/\s\s+/g, ' ');
            const [version, size] = metadataText.split(' + ').map(s => s.trim());

            const modFeaturesContainer = appCard.find('.small.text-truncate.text-muted').eq(1);
            const modFeatures = modFeaturesContainer.text().trim();

            return {
                title,
                link,
                imageUrl,
                version: version || null,
                size: size || null,
                modFeatures
            };
        }).get();

        return {
            source: targetUrl,
            pageTitle,
            apps
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeModyoloGames() {
    const url = 'https://modyolo.com/games';
    try {
        const { data: html } = await axios.get(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
            }
        });
        
        const $ = cheerio.load(html);
        
        const games = $('.archive-post').map((index, element) => {
            const card = $(element);
            
            const title = card.find('h3.h6').text().trim();
            const gameUrl = card.attr('href');
            const imageUrl = card.find('img.wp-post-image').attr('src');
            
            const metaDivs = card.find('div.small.text-truncate.text-muted');
            const versionAndSizeText = metaDivs.eq(0).text().trim().replace(/\s\s+/g, ' ');
            const [version, size] = versionAndSizeText.split(' + ').map(s => s.trim());

            const modFeatures = metaDivs.eq(1).find('span.align-middle').text().trim() || null;
            
            return {
                title,
                url: gameUrl,
                imageUrl,
                version: version || null,
                size: size || null,
                modFeatures
            };
        }).get();

        return {
            source: url,
            games
        };
    } catch (error) {
        throw new Error(`Scraping failed for ${url}: ${error.message}`);
    }
}

async function scrapeModyoloNews() {
    const url = 'https://modyolo.com/news';
    try {
        const { data: html } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });
        
        const $ = cheerio.load(html);

        const pageTitle = $('head > title').text().trim();

        const articles = $('main .row .col-12.col-sm-6.col-lg-4').map((_, element) => {
            const articleElement = $(element);
            const linkElement = articleElement.find('a.embed-responsive');

            const title = linkElement.find('h3').text().trim();
            const articleUrl = linkElement.attr('href');
            const styleAttribute = linkElement.attr('style') || '';
            const imageUrlMatch = styleAttribute.match(/url\((.*?)\)/);
            const imageUrl = imageUrlMatch ? imageUrlMatch[1] : null;

            return {
                title,
                url: articleUrl,
                imageUrl,
            };
        }).get();

        return {
            source: url,
            pageTitle,
            articles,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeModyoloEssentialApps() {
    try {
        const { data: html } = await axios.get('https://modyolo.com/type/essential-apps', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        
        const $ = cheerio.load(html);
        
        const essentialApps = $('a.archive-post').map((_, element) => {
            const el = $(element);
            const title = el.find('h3.h6').text().trim();
            const link = el.attr('href');
            const imageUrl = el.find('img.wp-post-image').attr('src');

            const metadataDivs = el.find('div.small.text-truncate.text-muted');
            const versionInfoDiv = metadataDivs.eq(0);
            const modInfoDiv = metadataDivs.eq(1);

            const versionSpans = versionInfoDiv.find('span.align-middle');
            const version = versionSpans.eq(0).text().trim() || null;
            const downloads = versionSpans.eq(2).text().trim() || null;

            const modInfo = modInfoDiv.find('span.align-middle').text().trim() || null;

            return {
                title,
                link,
                imageUrl,
                version,
                downloads,
                modInfo
            };
        }).get();

        return {
            pageTitle: $('h1.h5').text().trim(),
            apps: essentialApps
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeModyoloEditorChoice() {
    try {
        const { data: html } = await axios.get(
            "https://modyolo.com/type/editors-choice",
            {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
                },
            }
        );

        const $ = cheerio.load(html);

        const pageTitle = $("h1.h5").text().trim();

        const editorsChoiceApps = $("a.archive-post")
            .map((i, el) => {
                const item = $(el);
                const title = item.attr("title").trim();
                const link = item.attr("href");
                const imageUrl = item.find("img.wp-post-image").attr("src");

                const infoDivs = item.find(".small.text-truncate.text-muted");
                const versionInfo = $(infoDivs[0])
                    .text()
                    .trim()
                    .replace(/\s\s+/g, " ")
                    .split(" + ");
                const modFeatures = $(infoDivs[1])
                    .text()
                    .trim()
                    .replace(/\s\s+/g, " ");

                return {
                    title,
                    link,
                    imageUrl,
                    version: versionInfo[0] || null,
                    downloads: versionInfo[1] || null,
                    modFeatures,
                };
            })
            .get();

        return {
            source: "Modyolo - Editor's Choice",
            pageTitle,
            editorsChoiceApps,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeModyoloGameGenres(type) {
    if (!type) return "Available genres: action, arcade, card, casual, music, puzzle, role-playing, sports, triva, adventure, board, casino, educational, nsfw, racing, simulation, strategy, word"
    const url = 'https://modyolo.com/games/' + encodeURIComponent(type);
    try {
        const { data: html } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });

        const $ = cheerio.load(html);

        const pageTitle = $('h1.h5').text().trim();

        const games = $('.archive-post').map((_, element) => {
            const el = $(element);
            const title = el.find('h3.h6').text().trim();
            const link = el.attr('href');
            const thumbnail = el.find('img.wp-post-image').attr('src');

            const metadataDivs = el.find('div.small.text-truncate.text-muted');
            
            const versionAndSizeText = metadataDivs.eq(0).text().trim().replace(/\s+/g, ' ');
            const [version, size] = versionAndSizeText.split(' + ').map(s => s.trim());

            const modFeatures = metadataDivs.eq(1).find('span.align-middle').text().trim() || null;

            return {
                title,
                link,
                thumbnail,
                version: version || null,
                size: size || null,
                modFeatures
            };
        }).get();

        return {
            source: url,
            pageTitle,
            games
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeModyoloAppGenres(type) {
    try {
        if (!type) return "available type: art-design, books-reference, comics, education, entertainment, health-fitness, maps-navigation, music, news-magazines, personalization, productivity, social, tools, video-players-editors, auto-vehicles, business, communication, emulator, finance, lifestyle, medical, music-audio, parenting, phoography, shopping, sport, travel-local, wheater"
        const { data: html } = await axios.get('https://modyolo.com/apps/' + encodeURIComponent(type), {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        
        const $ = cheerio.load(html);
        
        const pageTitle = $('h1.h5').text().trim();

        const apps = $('.archive-post').map((_, element) => {
            const card = $(element);
            
            const title = card.find('h3').text().trim();
            const url = card.attr('href');
            const iconUrl = card.find('img.wp-post-image').attr('src');
            
            const metadataElements = card.find('.small.text-truncate.text-muted');
            
            const infoText = $(metadataElements[0]).text().replace(/\s\s+/g, ' ').trim();
            const [version, size] = infoText.split(' + ').map(s => s.trim());
            
            const modFeatures = $(metadataElements[1]).find('span.align-middle').text().trim();
            
            return {
                title,
                url,
                iconUrl,
                version: version || null,
                size: size || null,
                modFeatures
            };
        }).get();
        
        return {
            source: 'Modyolo',
            pageTitle,
            apps
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeModyoloInfo(url) {
    try {
        if (!url) return "where is the url?? e.g. https://modyolo.com/roblox-2.html"
        const { data: html } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        
        const $ = cheerio.load(html);
        const mainArticle = $('article');

        const title = mainArticle.find('h1.lead.font-weight-semibold').text().trim();
        const iconUrl = mainArticle.find('div.d-flex img.rounded-lg').attr('src');
        const coverImageUrl = mainArticle.find('img.rounded-lg.d-block.mx-auto').attr('src');
        const lastUpdated = mainArticle.find('time.text-muted em').text().trim();
        const shortDescription = mainArticle.find('div.entry-content > p:first-child em').text().trim();

        const details = {};
        mainArticle.find('table.table-striped tr').each((_, element) => {
            const key = $(element).find('th').text().trim();
            const value = $(element).find('td').text().trim();
            if (key && value) {
                details[key.replace(/\s+/g, '_').toLowerCase()] = value;
            }
        });

        const downloadLink = mainArticle.find('a.btn.btn-primary.btn-block[href*="/download/"]').first().attr('href');
        const ratingValueText = mainArticle.find('.rating + span').text().trim();
        const ratingMatch = ratingValueText.match(/([\d.]+)\/5 \((\d+) votes\)/);
        const rating = {
            value: ratingMatch ? parseFloat(ratingMatch[1]) : null,
            votes: ratingMatch ? parseInt(ratingMatch[2], 10) : null,
            text: ratingValueText
        };
        
        const modInfo = $("#more-info-1 p").map((_, el) => $(el).text().trim()).get();

        const description = mainArticle.find('div.entry-content').clone().children('h2, img, p, ul').remove().end().text().trim().split('\n').filter(p => p.trim() !== '');

        const images = mainArticle.find('div.entry-content img').map((_, el) => $(el).attr('src')).get();
        
        const comments = [];
        $('section div.comment').each((_, element) => {
            comments.push({
                author: $(element).find('.h6').text().trim(),
                text: $(element).find('.small.text-break').text().trim(),
                date: $(element).find('time').text().trim()
            });
        });

        return {
            title,
            iconUrl,
            coverImageUrl,
            lastUpdated,
            shortDescription,
            details,
            modInfo,
            rating,
            downloadLink,
            description,
            images,
            comments
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export {
    scrapeModyolo,
    scrapeModyoloApps,
    scrapeModyoloGames,
    scrapeModyoloNews,
    scrapeModyoloEssentialApps,
    scrapeModyoloEditorChoice,
    scrapeModyoloGameGenres,
    scrapeModyoloAppGenres,
    scrapeModyoloInfo
};

// This comes from: https://gist.github.com/Frenzycore/7d534619dea8a51788dd9da14a0f80b1