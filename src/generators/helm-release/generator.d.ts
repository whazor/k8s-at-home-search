/// <reference types="./vendor-typings/sqlite3" />
import { Database } from "sqlite";
import sqlite3 from "sqlite3";
import { CollectorData, ValuesData, PageData, ValueTree, AppData } from './models';
export declare function collector(db: Database<sqlite3.Database, sqlite3.Statement>, dbExtended: Database<sqlite3.Database, sqlite3.Statement>): Promise<CollectorData>;
export declare function appDataGenerator(data: CollectorData): Pick<AppData, 'chartURLs' | 'releases'>;
export declare function calculateValues(input: [string, ValueTree][]): ValuesData;
export declare function pageGenerator({ releases, repos, values, count }: CollectorData, filterRelevant?: boolean): Record<string, PageData>;
//# sourceMappingURL=generator.d.ts.map