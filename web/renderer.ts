import fs from 'node:fs'
import path from 'node:path'

import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import {
    collector as hrCollector,
    appDataGenerator as hrAppDataGenerator,
    pageGenerator as hrPageGenerator,
} from './src/generators/helm-release';

// use class, to avoid variables going back and forth
export class Renderer {
    public db: Database<sqlite3.Database, sqlite3.Statement>;
    private appData: any;
    private pageData: {
        [key: string]: any
    } = {};
    
    // methods
    async prepareData() {
        this.db = await open({
            filename: 'repos.db',
            driver: sqlite3.Database
        });
        const hrPageData = await hrCollector(this.db);
        this.appData = {
            ...hrAppDataGenerator(hrPageData),
        }
        for(const [key, pageData] of Object.entries(hrPageGenerator(hrPageData))) {
            this.pageData[key] = pageData;
        }
        
    }
    async generatePage(url: string, template: string) {
        const { render } = await import('./dist/server/entry-server.mjs')

        const pageData = (
            () => {
                if(url in this.pageData) {
                    return this.pageData[url];
                }
                const strippedUrl = url.replace(/\.html$/, '');
                if(strippedUrl in this.pageData) {
                    return this.pageData[strippedUrl];
                }
                return {};
            }
        )();

        const appHtml = await render(url, this.appData, pageData)
        const pageDataJS = `window.__PAGE_DATA__ = ${JSON.stringify(pageData)};`
        const appDataJS = `window.__APP_DATA__ = ${JSON.stringify(this.appData)};`

        const html = template
            .replace(`<!--app-html-->`, appHtml)
            .replace(`/**--app-data--**/`, appDataJS)
            .replace(`/**--page-data--**/`, pageDataJS);

        return html;
    }
}
