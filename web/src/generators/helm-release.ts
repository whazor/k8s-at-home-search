import fs from 'node:fs'
import path from 'node:path'
import { Database } from "sqlite";
import sqlite3 from "sqlite3";
import { marked } from 'marked';
// const createDOMPurify = require('dompurify');
// const { JSDOM } = require('jsdom');
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('<!DOCTYPE html>').window;
// @ts-expect-error
const DOMPurify = createDOMPurify(window);


interface ReleaseInfo {
    release: string;
    chart: string;
    name: string;
    key: string;
}
interface RepoInfo {
    name: string;
    repo: string;
    url: string;
    repo_url: string;
    stars: number;
    icon: string;
    timestamp: number;
}

interface CollectorData {
    releases: ReleaseInfo[];
    keys: string[];
    count: Record<string, number>;
    repos: Record<string, RepoInfo[]>;
}

export async function collector(db: Database<sqlite3.Database, sqlite3.Statement>): Promise<CollectorData> {
    const query = `
    select 
        hrep.helm_repo_url,
        rel.chart_name,
        rel.chart_version,
        rel.release_name,
        rel.url,
        rel.repo_name,
        rel.hajimari_icon,
        rel.timestamp,
        repo.stars,
        repo.url as repo_url
    from flux_helm_release rel
    join flux_helm_repo hrep
    on rel.helm_repo_name = hrep.helm_repo_name
    and rel.helm_repo_namespace = hrep.namespace
    and rel.repo_name = hrep.repo_name
    join repo repo
    on rel.repo_name = repo.repo_name
    `;

    const keys: Set<string> = new Set();
    const releases: Record<string, ReleaseInfo> = {};
    const count: Record<string, number> = {}
    const repos: Record<string, RepoInfo[]> = {};
    await db.each(query, (err, row) => {
        if (err) {
            throw err;
        }
        const { helm_repo_url, chart_name, chart_version, release_name } = row;
        const name = chart_name == release_name ? chart_name : `${chart_name}-${release_name}`;
        const key =
            (helm_repo_url
                .replace("https://", "")
                .replace("http://", "")
                .replace(/\/$/, '')
                .replaceAll("/", "-")
                + '-' + name).replaceAll(/\s+/g, '-')
                .replaceAll(/[^a-zA-Z0-9\.\-]/gi, '')
                .replaceAll(/^\.+/g, '').toLowerCase();
        releases[key] =
            {
                release: release_name,
                chart: chart_name,
                name: release_name,
                key,
            } as ReleaseInfo;

        keys.add(key);
        if (!count[key]) {
            count[key] = 0;
            repos[key] = [];
        }
        count[key]++;
        repos[key].push(
            {
                name: row.release_name,
                repo: row.repo_name,
                url: row.url,
                repo_url: row.repo_url,
                stars: row.stars,
                icon: row.hajimari_icon,
                timestamp: row.timestamp,
            }
        );
    });
    return {
        releases: Object.values(releases).map(r => ({...r, count: count[r.key]})),
        keys: Array.from(keys),
        count,
        repos,
    }
}

export function appDataGenerator(data: CollectorData) {
    const { releases, keys, count, repos } = data;
    return {
        releases,
    }
};

export interface PageData {

}

export function pageGenerator({releases, repos, count}: CollectorData): Record<string, PageData> {
    const releaseMap = releases.reduce((acc, cur) => {
        acc[cur.key] = cur;
        return acc;
    }, {} as Record<string, ReleaseInfo>);
    const pages: Record<string, PageData> = {};
    const relevant = Object.entries(count)
        .sort((a, b) => b[1] - a[1])
        .filter(([k, v]) => v > 3);
    for (const [key, value] of relevant) {
        const name = releaseMap[key].name;
        let doc = undefined;
        const docPath = path.join(__dirname, '../info/', `${name}.md`);
        
        if (fs.existsSync(docPath)) {  
          doc = DOMPurify.sanitize(marked.parse(
            fs.readFileSync(docPath, 'utf-8').replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/,"")
          ));
        } else {
          console.log("No doc for", name);
        }
        pages["/hr/"+key] = {
            name,
            key,
            repos: repos[key],
            doc,
        }
    }
    return pages;
}