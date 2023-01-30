/// <reference types="./vendor-typings/sqlite3" />
import sqlite3 from 'sqlite3';
import { Database } from 'sqlite';
export declare class Renderer {
    db?: Database<sqlite3.Database, sqlite3.Statement>;
    dbExtended?: Database<sqlite3.Database, sqlite3.Statement>;
    private appData;
    private htmlPageData;
    jsonFilesData: Record<number, string>;
    jsonFilesKeyMap: Record<string, number>;
    prepareData(): Promise<void>;
    getJsonPageData(jsonPageData: Record<string, any>): {
        fileData: string[];
        keyFileMap: Record<string, number>;
    };
    getPages(): string[];
    generatePage(url: string, template: string): Promise<string>;
}
//# sourceMappingURL=renderer.d.ts.map