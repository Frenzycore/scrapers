import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeDnid() {
    try {
        const { data: html } = await axios.get('https://dnid.co.id/', {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(html);

        const pageTitle = $('title').text().trim();

        const breakingNews = $('.flashnewsItem a.flashnewsLink').map((_, el) => ({
            title: $(el).text().trim(),
            link: $(el).attr('href') || null,
        })).get();

        const mainHeadlines = $('#lightSliderMobile > li').map((_, el) => ({
            title: $(el).find('h2 a').text().trim(),
            link: $(el).find('h2 a').attr('href') || null,
            image: $(el).find('img').attr('src') || null,
            timestamp: $(el).find('.headline-tiga-waktu-mobile').text().trim().replace(/\s+/g, ' '),
        })).get();

        const latestNews = $('.news-feed-list').map((_, el) => {
            const linkElement = $(el).find('a.news-feed-link');
            if (!linkElement.attr('href')) return null; 

            return {
                title: linkElement.find('h2.news-feed-judul').text().trim(),
                link: linkElement.attr('href') || null,
                imageDesktop: linkElement.find('figure img.newsfeed-image').attr('src') || null,
                imageMobile: linkElement.find('figure img.newsfeed-image-mobile').attr('src') || null,
                metadata: linkElement.find('p.tanggal').text().trim().replace(/\s+/g, ' '),
                regionLogo: {
                    light: linkElement.find('.logo-light').attr('src') || null,
                    dark: linkElement.find('.logo-dark').attr('src') || null,
                }
            };
        }).get().filter(Boolean);
        
        const sidebarHighlights = $('#sidebar-right .flexslider-mobile > ul.slides > li').map((_, el) => ({
            title: $(el).find('h2.headline-judul-mobile a').text().trim(),
            link: $(el).find('h2.headline-judul-mobile a').attr('href') || null,
            image: $(el).find('img').attr('src') || null,
            regionLogo: $(el).find('p.headline-label-mobile img').attr('src') || null
        })).get();

        const footerSocialLinks = $('.media-social-footer a').map((_, el) => ({
            platform: $(el).attr('title'),
            link: $(el).attr('href'),
            icon: $(el).find('img').attr('src'),
        })).get();

        const footerMenuLinks = $('.menu-bawah li a').map((_, el) => ({
            text: $(el).text().trim(),
            link: $(el).attr('href'),
        })).get();

        return {
            pageTitle,
            breakingNews,
            mainHeadlines,
            latestNews,
            sidebarHighlights,
            footer: {
                address: $('.alamat').text().trim().replace(/\s+/g, ' '),
                socialLinks: footerSocialLinks,
                menuLinks: footerMenuLinks,
                copyright: $('p.footer-copyright').text().trim(),
            }
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeDnid };