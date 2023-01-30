import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { collector as hrCollector, appDataGenerator as hrAppDataGenerator, pageGenerator as hrPageGenerator, } from './src/generators/helm-release/generator';
// use class, to avoid variables going back and forth
export class Renderer {
    constructor() {
        // we split the pageData, most popular pages get html files, the rest get bundled into a json file
        this.htmlPageData = {};
        this.jsonFilesData = {};
        this.jsonFilesKeyMap = {};
    }
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
        const jsonPageData = {};
        for (const [key, pageData] of Object.entries(hrPageGenerator(hrPageData, false))) {
            jsonPageData[key] = pageData;
        }
        const { fileData, keyFileMap } = this.getJsonPageData(jsonPageData);
        this.jsonFilesData = fileData;
        this.jsonFilesKeyMap = keyFileMap;
        this.appData = Object.assign(Object.assign({}, hrAppDataGenerator(hrPageData)), { keyFileMap });
    }
    getJsonPageData(jsonPageData) {
        // split jsonPageData into multiple files
        const jsonPageDataKeys = Object.keys(jsonPageData);
        // max size 300kb
        const jsonMaxSize = (300 - 5) * 1024;
        const keyFileMap = {};
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
            }, {}));
            return data;
        });
        return {
            fileData,
            keyFileMap,
        };
    }
    getPages() {
        return Object.keys(this.htmlPageData);
    }
    async generatePage(url, template) {
        // @ts-ignore
        const { render } = await import('./dist/server/entry-server.mjs');
        const pageData = (() => {
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
        })();
        console.log("rendering", url);
        const appHtml = await render(url, this.appData, pageData);
        const title = pageData && "title" in pageData ? pageData.title + ' - ' : "";
        const pageDataJS = `window.__PAGE_DATA__ = ${JSON.stringify(pageData)};`;
        const appDataJS = `window.__APP_DATA__ = ${JSON.stringify(this.appData)};`;
        const html = template
            .replace(`<!--title-->`, title)
            .replace(`<!--app-html-->`, appHtml)
            .replace(`/**--app-data--**/`, appDataJS)
            .replace(`/**--page-data--**/`, pageDataJS);
        return html;
    }
}
//# sourceMappingURL=renderer.js.map