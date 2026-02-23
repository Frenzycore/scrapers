import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeJkt48() {
    const baseUrl = 'https://jkt48.com';
    try {
        const { data: html } = await axios.get(baseUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
            }
        });
        
        const $ = cheerio.load(html);

        const resolveUrl = (path) => (path ? new URL(path, baseUrl).href : null);

        const banners = $('.hero-home a').map((_, el) => ({
            link: resolveUrl($(el).attr('href')),
            image: resolveUrl($(el).find('img').attr('src')),
        })).get();

        const latestNews = $('.entry-home__news').map((_, el) => {
            const element = $(el);
            const label = element.find('.entry-home__news--label');
            const item = element.find('.entry-home__news--item a');
            return {
                title: item.text().trim(),
                link: resolveUrl(item.attr('href')),
                date: label.find('time').text().trim(),
                categoryIcon: resolveUrl(label.find('img').attr('src')),
            };
        }).get();

        const schedule = $('.entry-schedule__calendar tbody tr').map((_, el) => {
            const row = $(el);
            const dateText = row.find('h3').html()?.replace('<br>', ' ').trim() || '';
            const events = row.find('.contents').map((_, eventEl) => {
                const eventElement = $(eventEl);
                const eventLink = eventElement.find('p a');
                return {
                    title: eventLink.text().trim(),
                    link: resolveUrl(eventLink.attr('href')),
                    categoryIcon: resolveUrl(eventElement.find('span img').attr('src')),
                };
            }).get();
            return { date: dateText, events };
        }).get();

        const nextBirthday = $('.entry-home__schedule--birthday__item a').map((_, el) => {
            const element = $(el);
            const infoHtml = element.find('p').html();
            if (!infoHtml) return null;

            const [team, name, birthDate] = infoHtml.split('<br>').map(s => s.trim());

            return {
                name,
                birthDate,
                team: team.replace(/[\[\]]/g, ''),
                profileLink: resolveUrl(element.attr('href')),
                image: resolveUrl(element.find('img').attr('src')),
            };
        }).get().filter(Boolean);

        const videos = $('.entry-home__video--item iframe').map((_, el) => ({
            title: $(el).attr('title'),
            embedUrl: $(el).attr('src').startsWith('http') ? $(el).attr('src') : `https:${$(el).attr('src')}`
        })).get();

        const sisterGroups = $('.entry-home__48group a').map((_, el) => {
            const element = $(el);
            const logoSrc = element.find('img').attr('src');
            const groupName = logoSrc?.split('/').pop().split('.')[0].toUpperCase() || 'UNKNOWN';
            return {
                name: groupName.replace('AKBSH', 'AKB48 Team SH').replace('AKBTP', 'AKB48 Team TP'),
                link: element.attr('href'),
                logo: resolveUrl(logoSrc),
            };
        }).get();

        const socialMedia = $('footer .sns a').map((_, el) => {
            const link = $(el).attr('href');
            const iconClass = $(el).find('i').attr('class') || '';
            let platform = 'Unknown';
            if (iconClass.includes('facebook')) platform = 'Facebook';
            else if (iconClass.includes('twitter')) platform = 'Twitter';
            else if (iconClass.includes('instagram')) platform = 'Instagram';
            else if (iconClass.includes('youtube')) platform = 'YouTube';
            else if (iconClass.includes('tiktok')) platform = 'TikTok';
            return { platform, link };
        }).get();

        return {
            pageTitle: $('title').text().trim(),
            pageDescription: $('meta[name="description"]').attr('content')?.trim() || null,
            banners,
            latestNews,
            schedule,
            nextBirthday,
            videos,
            sisterGroups,
            socialMedia,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeJkt48 };