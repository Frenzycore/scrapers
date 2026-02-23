import axios from "axios";
import * as cheerio from "cheerio";

async function viceNews() {
    try {
        const { data: html } = await axios.get("https://www.vice.com/", {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
            },
        });

        const $ = cheerio.load(html);

        const getNavLinks = (selector) => {
            return $(selector)
                .map((_, el) => ({
                    text: $(el).text().trim(),
                    link: $(el).attr("href"),
                }))
                .get();
        };

        const getSocialLinks = (selector) => {
            return $(selector)
                .map((_, el) => {
                    const parentLi = $(el).closest("li.wp-social-link");
                    const classList = parentLi.attr("class") || "";
                    const platformClass = classList
                        .split(" ")
                        .find((cls) => cls.startsWith("wp-social-link-"));
                    const platform = platformClass
                        ? platformClass.replace("wp-social-link-", "")
                        : "unknown";

                    return {
                        platform,
                        link: $(el).attr("href"),
                    };
                })
                .get();
        };

        const pageMeta = {
            title: $("head title").text().trim(),
            description: $('head meta[name="description"]')
                .attr("content")
                ?.trim(),
            ogImage: $('head meta[property="og:image"]')
                .attr("content")
                ?.trim(),
        };

        const headerNavigation = getNavLinks(
            'nav[data-location="header"] .menu-item a'
        );

        const megaMenu = {
            mainLinks: getNavLinks(
                'nav[data-location="mega-menu-1"] .menu-item a'
            ),
            categoryLinks: getNavLinks(
                'nav[data-location="mega-menu-2"] .menu-item a'
            ),
        };

        const languageEditions = $(".language-picker__menu > li > a")
            .map((_, el) => ({
                language: $(el)
                    .contents()
                    .filter((i, node) => node.type === "text")
                    .text()
                    .trim(),
                code: $(el).attr("lang"),
                link: $(el).attr("href"),
                isSelected: $(el).attr("aria-selected") === "true",
            }))
            .get();

        const footer = {
            navigation: getNavLinks('nav[data-location="footer"] .menu-item a'),
            socialLinks: getSocialLinks(
                ".site-footer__inner .wp-block-social-links .wp-social-link-anchor"
            ),
            copyright: $(".wp-block-savage-platform-theme-copyright")
                .text()
                .trim(),
        };

        return {
            pageMeta,
            headerNavigation,
            megaMenu,
            languageEditions,
            footer,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { viceNews };
