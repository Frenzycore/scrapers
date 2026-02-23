import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeFuDomainsWhoIs(url = "example.com") {
    try {
        let rawUrl = url.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        const { data: html } = await axios.get('https://fudomains.com/whois/' + rawUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' }
        });
        
        const $ = cheerio.load(html);
        const whoisRawText = $('.whoisText').text();
        const whoisLines = whoisRawText.split('\n').map(line => line.trim()).filter(Boolean);
        const whoisInformation = {
            domainStatus: [],
            nameServers: [],
            dnssecData: []
        };
        const keyMap = {
            'Domain Name': 'domainName',
            'Registry Domain ID': 'registryDomainId',
            'Registrar WHOIS Server': 'registrarWhoisServer',
            'Registrar URL': 'registrarUrl',
            'Updated Date': 'updatedDate',
            'Creation Date': 'creationDate',
            'Registry Expiry Date': 'registryExpiryDate',
            'Registrar': 'registrar',
            'Registrar IANA ID': 'registrarIanaId',
            'DNSSEC': 'dnssec',
            'URL of the ICANN Whois Inaccuracy Complaint Form': 'icannWhoisInaccuracyComplaintFormUrl',
        };

        whoisLines.forEach(line => {
            const separatorIndex = line.indexOf(':');
            if (line.startsWith('>>> Last update of whois database:')) {
                whoisInformation.lastUpdateOfWhoisDatabase = line.replace('>>> Last update of whois database:', '').replace('<<<', '').trim();
                return;
            }

            if (separatorIndex === -1) return;

            const key = line.substring(0, separatorIndex).trim();
            const value = line.substring(separatorIndex + 1).trim();

            if (key === 'Domain Status') {
                whoisInformation.domainStatus.push(value);
            } else if (key === 'Name Server') {
                whoisInformation.nameServers.push(value);
            } else if (key === 'DNSSEC DS Data') {
                whoisInformation.dnssecData.push(value);
            } else if (keyMap[key]) {
                whoisInformation[keyMap[key]] = value;
            }
        });

        const recentSearches = $('.recent-sidebar-searches a').map((_, el) => ({
            domain: $(el).text().trim(),
            url: $(el).attr('href'),
            favicon: $(el).find('img').attr('src'),
        })).get();

        return {
            domain: rawUrl,
            favicon: $('.left-title-area img').attr('src') || null,
            whoisInformation,
            recentSearches
        };
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

export { scrapeFuDomainsWhoIs };

// This comes from: https://gist.github.com/Frenzycore/c71a8b19f13668a6416990412cffaf85