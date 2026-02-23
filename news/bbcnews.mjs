import axios from "axios";
import * as cheerio from "cheerio";

async function bbcNews() {
    try {
        const { data: html } = await axios.get("https://www.bbc.com/", {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
            },
        });

        const $ = cheerio.load(html);

        const getFullUrl = (path) => {
            if (!path) return null;
            if (path.startsWith("http")) return path;
            if (path.startsWith("/")) return `https://www.bbc.com${path}`;
            return `https://www.bbc.com/${path}`;
        };

        const mainStoryArticle = $(
            '[data-testid="westminster-article"]'
        ).first();
        const mainStory = {
            title: mainStoryArticle
                .find('h2[data-testid="card-headline"]')
                .text()
                .trim(),
            link: getFullUrl(mainStoryArticle.closest("a").attr("href")),
            description: mainStoryArticle
                .find('p[data-testid="card-description"]')
                .text()
                .trim(),
            image: mainStoryArticle.find("img").attr("src"),
            metadata: {
                time: mainStoryArticle
                    .find('[data-testid="card-metadata-lastupdated"]')
                    .text()
                    .trim(),
                category: mainStoryArticle
                    .find('[data-testid="card-metadata-tag"]')
                    .text()
                    .trim(),
            },
        };

        const topStories = $(
            '[data-testid="vermont-section"] [data-testid$="-card"] a'
        )
            .map((i, el) => {
                const article = $(el);
                const title = article
                    .find('h2[data-testid="card-headline"]')
                    .text()
                    .trim();
                const link = getFullUrl(article.attr("href"));

                if (!title || link === mainStory.link) return null;

                return {
                    title,
                    link,
                    description: article.find("p").text().trim() || null,
                    image: article.find("img").attr("src") || null,
                    metadata: {
                        time: article
                            .find('[data-testid="card-metadata-lastupdated"]')
                            .text()
                            .trim(),
                        category: article
                            .find('[data-testid="card-metadata-tag"]')
                            .text()
                            .trim(),
                    },
                };
            })
            .get()
            .filter(Boolean);

        const uniqueTopStories = topStories.filter(
            (v, i, a) => a.findIndex((t) => t.link === v.link) === i
        );

        const navigation = $(
            'nav[data-testid="level1-navigation-container"] ul li a'
        )
            .map((i, el) => ({
                text: $(el).text().trim(),
                link: getFullUrl($(el).attr("href")),
            }))
            .get();

        const editorsPicks = $(
            'section[data-analytics_group_name="Editor\'s picks"] [data-testid="edinburgh-card"] a'
        )
            .map((i, el) => ({
                title: $(el)
                    .find('h2[data-testid="card-headline"]')
                    .text()
                    .trim(),
                link: getFullUrl($(el).attr("href")),
                description: $(el)
                    .find('p[data-testid="card-description"]')
                    .text()
                    .trim(),
                image: $(el).find("img").attr("src"),
                category: $(el)
                    .find('[data-testid="card-metadata-tag"]')
                    .text()
                    .trim(),
            }))
            .get();

        const documentaries = $(
            'div[data-analytics_group_name="Documentaries"] [data-testid="worcester-card"] a'
        )
            .map((i, el) => ({
                title: $(el).find("h3").text().trim(),
                link: getFullUrl($(el).attr("href")),
                image: $(el).find("img").attr("src"),
            }))
            .get();

        return {
            mainStory,
            topStories: uniqueTopStories,
            navigation,
            editorsPicks,
            documentaries,
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { bbcNews };
