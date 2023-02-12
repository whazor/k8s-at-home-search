import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import {
    collector as hrCollector,
    appDataGenerator as hrAppDataGenerator,
    pageGenerator as hrPageGenerator,
    generateTopReposPageData,
    generateRepoPagesData,
} from './src/generators/helm-release/generator';
import type { RenderFunction } from './src/entry-server';

// use class, to avoid variables going back and forth
export class Renderer {
    public db?: Database<sqlite3.Database, sqlite3.Statement>;
    public dbExtended?: Database<sqlite3.Database, sqlite3.Statement>;
    private appData: any;
    // we split the pageData, most popular pages get html files, the rest get bundled into a json file
    private htmlPageData: {
        [key: string]: any
    } = {};
    public jsonFilesData: Record<number, string> = {};
    public jsonFilesKeyMap: Record<string, number> = {};

    // methods
    async prepareData() {
        this.db = await open({
            filename: 'repos.db',
            driver: sqlite3.Database
        });
        this.dbExtended = await open({
            filename: 'repos-extended.db',
            driver: sqlite3.Database
        });

        const hrPageData = await hrCollector(this.db, this.dbExtended);
        for (const [key, pageData] of Object.entries(hrPageGenerator(hrPageData))) {
            this.htmlPageData[key] = pageData;
        }
        this.htmlPageData['/top'] = generateTopReposPageData(hrPageData);
        for (const [key, pageData] of Object.entries(generateRepoPagesData(hrPageData))) {
            this.htmlPageData['/repo/'+key] = pageData;
        }
        
        const jsonPageData: Record<string, any> = {};
        for (const [key, pageData] of Object.entries(hrPageGenerator(hrPageData, false))) {
            jsonPageData[key] = pageData;
        }

        const { fileData, keyFileMap } = this.getJsonPageData(jsonPageData);
        this.jsonFilesData = fileData;
        this.jsonFilesKeyMap = keyFileMap;

        this.appData = {
            ...hrAppDataGenerator(hrPageData),
            keyFileMap
        }

    }

    public getJsonPageData(jsonPageData: Record<string, any>) {
        // split jsonPageData into multiple files
        const jsonPageDataKeys = Object.keys(jsonPageData);
        // max size 300kb
        const jsonMaxSize = (300 - 5) * 1024;

        const keyFileMap: Record<string, number> = {};

        let currentFile = 0;
        let currentSize = 0;

        for (const key of jsonPageDataKeys) {
            const jsonPageDataString = JSON.stringify(jsonPageData[key]);
            if (currentSize + jsonPageDataString.length > jsonMaxSize) {
                currentFile++;
                currentSize = 0;
            }
            keyFileMap[key] = currentFile;
            currentSize += jsonPageDataString.length;
        }
        // [0, 1, 2, ..., currentFile]
        const fileData = Array.from(Array(currentFile + 1).keys()).map(i => {
            const data = JSON.stringify(jsonPageDataKeys.reduce((acc, key) => {
                if (keyFileMap[key] === i) {
                    acc[key] = jsonPageData[key];
                }
                return acc;
            }, {} as typeof jsonPageData));
            return data;
        });
        return {
            fileData,
            keyFileMap,
        }
    }

    getPages() {
        return Object.keys(this.htmlPageData);
    }

    async generatePage(render: RenderFunction,  url: string, template: string) {
        const pageData = (
            () => {
                let strippedUrl = url;
                if (url.startsWith("/k8s-at-home-search")) {
                    strippedUrl = url.replace("/k8s-at-home-search", "");
                }
                if (strippedUrl in this.htmlPageData) {
                    return this.htmlPageData[strippedUrl];
                }
                strippedUrl = url.replace(/\.html$/, '');
                if (strippedUrl in this.htmlPageData) {
                    return this.htmlPageData[strippedUrl];
                }
                return undefined;
            }
        )();

        function b64EncodeUnicode(data: string|undefined) {
           return Buffer.from(data || "null", 'utf8').toString('base64');
        }
        console.log("rendering", url);

        const appHtml = await render(url, this.appData, pageData)


        const title = pageData && "title" in pageData ? pageData.title + ' - ' : "";
        const pageDataJS = `window.__PAGE_DATA__ = "${b64EncodeUnicode(JSON.stringify(pageData))}";`
        const appDataJS = `window.__APP_DATA__ = "${b64EncodeUnicode(JSON.stringify(this.appData))}";`

        const html = template
            .replace(`<!--title-->`, title)
            .replace(`<!--app-html-->`, appHtml)
            .replace(`/**--app-data--**/`, appDataJS)
            .replace(`/**--page-data--**/`, pageDataJS);

        return html;
    }

    public generateSitemap() {
        const pages = this.getPages();
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">        
        ${pages.map(page => `
            <url>
                <loc>https://nanne.dev/k8s-at-home${page}</loc>
                <lastmod>${new Date().toISOString()}</lastmod>
            </url>
        `).join('')}
            <url>
                <loc>https://nanne.dev/k8s-at-home/</loc>
                <lastmod>${new Date().toISOString()}</lastmod>
            </url>
        </urlset>
        `;
        return sitemap;
    }
}
