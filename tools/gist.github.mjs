import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeGistGithubUserProfile(profile) {
    try {
        let username = profile || "Frenzycore";
        const { data: html } = await axios.get(
            "https://gist.github.com/" + encodeURIComponent(username),
            {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
                },
            }
        );

        const $ = cheerio.load(html);

        const userProfile = {
            fullName: $("span.p-name.vcard-fullname").text().trim(),
            username: $("span.p-nickname.vcard-username").text().trim(),
            avatarUrl: $('a[itemprop="image"] img').attr("src"),
            bio: $(".p-note.user-profile-bio div").text().trim(),
            status: $(".user-status-message-wrapper div").text().trim(),
            followers:
                parseInt(
                    $('a[href*="tab=followers"] .text-bold').text().trim(),
                    10
                ) || 0,
            following:
                parseInt(
                    $('a[href*="tab=following"] .text-bold').text().trim(),
                    10
                ) || 0,
            organization:
                $('li.vcard-detail[itemprop="worksFor"] .p-org a')
                    .text()
                    .trim() || null,
            profileUrl: $("a.btn.width-full").attr("href"),
        };

        const gists = $(".gist-snippet")
            .map((i, el) => {
                const element = $(el);
                const titleElement = element.find("strong.css-truncate-target");
                const statsElements = element.find(
                    ".gist-snippet-meta ul li a"
                );

                const getStatCount = (textFragment) => {
                    const statElement = statsElements.filter((_, a) =>
                        $(a).text().includes(textFragment)
                    );
                    return (
                        parseInt(statElement.text().trim().split(" ")[0], 10) ||
                        0
                    );
                };

                return {
                    title: titleElement.text().trim(),
                    url: `https://gist.github.com${titleElement
                        .parent()
                        .attr("href")}`,
                    description: element
                        .find(".d-inline-block.px-lg-2 > span.f6")
                        .text()
                        .trim(),
                    createdAt: element.find("relative-time").attr("datetime"),
                    files: getStatCount("file"),
                    forks: getStatCount("forks"),
                    comments: getStatCount("comments"),
                    stars: getStatCount("stars"),
                };
            })
            .get();

        return {
            userProfile,
            gists,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeGistGithubUserContent(url) {
    try {
        let rawUrl = url || "https://gist.github.com/Frenzycore/b5b2efdbd4893ead8baca41a93c0f375"
        const { data: html } = await axios.get(rawUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36' }
        });

        const $ = cheerio.load(html);

        const authorElement = $('.author a');
        const gistTitleElement = $('.css-truncate-target a');

        const files = $('.file').map((_, el) => {
            const fileElement = $(el);
            const fileName = fileElement.find('.gist-blob-name').text().trim();
            const rawUrlPath = fileElement.find('.file-actions a:contains("Raw")').attr('href');
            const codeContent = fileElement.find('.blob-code-content').text();

            return {
                filename: fileName,
                rawUrl: `https://gist.github.com${rawUrlPath}`,
                content: codeContent.trim()
            };
        }).get();

        return {
            author: {
                username: authorElement.text().trim(),
                profileUrl: `https://gist.github.com${authorElement.attr('href')}`,
                avatarUrl: $('img.avatar-user').attr('src')
            },
            gist: {
                id: gistTitleElement.attr('href').split('/').pop(),
                url: `https://gist.github.com${gistTitleElement.attr('href')}`,
                description: $('div[itemprop="about"]').text().trim().replace(/\s+/g, ' '),
                createdAt: $('relative-time').attr('datetime'),
                starCount: parseInt($('#gist-star-button .Counter').text().trim(), 10) || 0,
                forkCount: parseInt($('#gist-fork-button .Counter').text().trim(), 10) || 0
            },
            files: files
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

async function scrapeGithubGistDiscover() {
    try {
        const { data: html } = await axios.get(
            "https://gist.github.com/discover",
            {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
                },
            }
        );

        const $ = cheerio.load(html);

        const gists = $(".gist-snippet")
            .map((index, element) => {
                const gistElement = $(element);

                const authorInfoContainer = gistElement.find(
                    ".flex-order-1 .d-inline-block.px-lg-2"
                );
                
                const authorLink = authorInfoContainer.find(
                    'a[data-hovercard-type="user"]'
                );
                
                const gistLink = authorLink.next();

                const statsContainer = gistElement.find(".flex-order-2 > li");
                const filesText = statsContainer.eq(0).text().trim();
                const forksText = statsContainer.eq(1).text().trim();
                const commentsText = statsContainer.eq(2).text().trim();
                const starsText = statsContainer.eq(3).text().trim();

                const author = {
                    username: authorLink.text().trim(),
                    profileUrl: `https://gist.github.com${authorLink.attr(
                        "href"
                    )}`,
                    avatarUrl: gistElement.find("img.avatar-user").attr("src"),
                };

                const gist = {
                    title: gistLink.find("strong").text().trim(),
                    url: `https://gist.github.com${gistLink.attr("href")}`,
                    description: authorInfoContainer
                        .find(".f6.color-fg-muted")
                        .last()
                        .text()
                        .trim(),
                    createdAt: authorInfoContainer
                        .find("relative-time")
                        .attr("datetime"),
                };

                const stats = {
                    files: parseInt(filesText, 10) || 0,
                    forks: parseInt(forksText, 10) || 0,
                    comments: parseInt(commentsText, 10) || 0,
                    stars: parseInt(starsText, 10) || 0,
                };

                return {
                    author,
                    gist,
                    stats,
                };
            })
            .get();

        return {
            pageTitle: $("h1").first().text().trim(),
            totalGistsOnPage: gists.length,
            gists,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeGithubGistDiscover, scrapeGithubGistUserProfile, scrapeGithubGistUserContent }; 

// This comes from: https://gist.github.com/Frenzycore/36d132ab5dd7b33f9454a6968e09d31e