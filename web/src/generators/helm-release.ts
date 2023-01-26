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


export interface ReleaseInfo {
    release: string;
    chart: string;
    name: string;
    key: string;
    chartsUrl: string;
}


interface RepoInfo {
    name: string,
    repo: string,
    helm_repo_name: string,
    helm_repo_url: string,
    url: string,
    repo_url: string,
    chart_version: string,
    stars: number,
    icon: string,
    timestamp: number,
}

export interface CollectorData {
    releases: ReleaseInfo[];
    keys: string[];
    count: Record<string, number>;
    repos: Record<string, RepoInfo[]>;
    values: Record<string, ValueTree>;
}

export interface ValuesData {
    list: ValueList,
    urlMap: Record<number, string>,
    valueMap: Record<string, Record<number, any[]>>
}

export interface PageData {
    key: string;
    name: string;
    doc?: string;
    icon?: string;
    helmRepoName?: string,
    helmRepoURL?: string,
    values: ValuesData,
    repos: RepoInfo[];
}


function mode<K extends string | number | symbol>(array: K[]) {
    if (array.length == 0)
        return undefined;
    let modeMap: Record<K, number> = {} as Record<K, number>;
    let maxEl = array[0], maxCount = 1;
    for (let i = 0; i < array.length; i++) {
        let el = array[i];
        if (modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;
        if (modeMap[el] > maxCount) {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}

interface ValueTree {
    [key: string]: ValueTree | string;
}

export async function collector(
    db: Database<sqlite3.Database, sqlite3.Statement>,
    dbExtended: Database<sqlite3.Database, sqlite3.Statement>
): Promise<CollectorData> {
    const query = `
    select 
        hrep.helm_repo_url,
        hrep.helm_repo_name,
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

    group by rel.url
    `;

    const keySet: Set<string> = new Set();
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
                chartsUrl: helm_repo_url,
                key,
            } as ReleaseInfo;

        keySet.add(key);
        if (!count[key]) {
            count[key] = 0;
            repos[key] = [];
        }
        count[key]++;
        repos[key].push(
            {
                name: row.release_name,
                repo: row.repo_name,
                helm_repo_name: row.helm_repo_name,
                helm_repo_url: row.helm_repo_url,
                url: row.url,
                chart_version: row.chart_version,
                repo_url: row.repo_url,
                stars: row.stars,
                icon: row.hajimari_icon,
                timestamp: row.timestamp,
            }
        );
    });
    const keys = Array.from(keySet);
    const values: Record<string, ValueTree> = {};
    for (const key of keys) {
        const urls = repos[key].map(r => r.url);
        const query = `
        select url, val
        from flux_helm_release_values
        where url in (${urls.map(() => '?').join(',')})
`;
        await dbExtended.each(query, urls, (err, row) => {
            if (err) {
                throw err;
            }
            const { url, val } = row;
            values[url] = JSON.parse(val);
        });
    }
    return {
        releases: Object.values(releases).map(r => ({ ...r, count: count[r.key] })),
        keys,
        count,
        repos,
        values,
    }
}

export function appDataGenerator(data: CollectorData) {
    const { releases, keys, count, repos } = data;

    return {
        releases: releases.map(r => ({
            ...r,
            count: count[r.key],
            icon: mode(repos[r.key].filter(r => r.icon).map(r => r.icon)),
        })),
    }
};

const range = (start: number, end: number) => Array.from({ length: end - start }, (_, i) => i + start);

type ValueList = {
    name: string,
    count: number,
    types: string[],
    urls: number[]
}[];

const isObject = (k: any) => typeof k === 'object' && !Array.isArray(k) && k !== null;

function* visitValues(values: [string, any]): Generator<{
    name: string,
    type: string,
    url: string,
    value?: any
}> {
    const [url, input] = values;
    if (isObject(input)) {
        for (const [key, value] of Object.entries(input)) {
            for (const val of visitValues([url, value])) {
                let name = key.replaceAll('.', '#');
                if(val.name.startsWith('[')) {
                    name = key + val.name;
                } else if(val.name !== "") {
                    name = key + '.' + val.name
                }
                yield {
                    name,
                    type: val.type,
                    url,
                    value: val.value
                }
            }
        }
    } else if (Array.isArray(input)) {
        for (const cur of input) {
            for (const val of visitValues([url, cur])) {
                yield {
                    name: val.name !== "" ? '[]' + '.' + val.name : '[]',
                    type: val.type,
                    url,
                    value: val.value
                }
            }
        }
    } else {
        yield {
            name: "",
            type: typeof input,
            url,
            value: input !== null ? input.toString() : input
        };
    }
}

export function calculateValues(input: [string, ValueTree][]): ValuesData {
    const list = 
        input.map(x => [...visitValues(x)]).flat()
            .filter(x => x.name !== "")
            .filter(x => x.type !== "object");
    const names = [...new Set(list.map(x => x.name))]        

    const types = list.reduce(
        (map, val) => {
            if (!(val.name in map)) {
                map[val.name] = new Set()
            }
            map[val.name].add(val.type);
            return map;
        }, {} as Record<string, Set<string>>
    )
    const urlToIdMap: Record<string, number> = list
        .reduce((map, val) => {
            if (!(val.url in map)) {
                map[val.url] = Object.keys(map).length;
            }
            return map;
        }, {} as Record<string, number>);
    const idToUrlMap: Record<number, string> = Object.fromEntries(Object.entries(urlToIdMap).map(([k, v]) => [v, k]));

    const valueMap = list.map(item => {
        const {  name, url, value } = item;
        return {
            name,
            url: urlToIdMap[url],
            value,
        }
    }).reduce((map, val) => {
        if (!(val.name in map)) {
            map[val.name] = {};
        }
        if (!(val.url in map[val.name])) {
            map[val.name][val.url] = [];
        }
        map[val.name][val.url].push(val.value);
        return map;
    }, {} as Record<string, Record<number, any[]>>);

    const nameUrlMap: Record<string, Set<number>> = list.
        reduce((map, val) => {
            if (!(val.name in map)) {
                map[val.name] = new Set()
            }
            map[val.name].add(urlToIdMap[val.url]);
            return map;
        }, {} as Record<string, Set<number>>);
    
        
    // use nameUrlMap for count 
    const counts = 
        Object.fromEntries(names
              .map(x => [x, nameUrlMap[x].size]));

    // we want the max count for each prefix
    const countSplitted: [string, number][] = Object.entries(counts).map(([name, count]) => {
        const splitted = name.split('.');
        return range(1, splitted.length + 1)
            .map(o => splitted.slice(0, o).join("."))
            .map(o => [o, count]) as [string, number][];
    }).flat();
    const countMap = countSplitted.reduce((map, [name, count]) => {
        if (!(name in map)) {
            map[name] = 0;
        }
        map[name] = Math.max(map[name], count);
        return map;
    }, {} as Record<string, number>);
    // check if one of the count > 50
    const isDebug = Object.values(countMap).find(c => c > 50) !== undefined;
    if (isDebug) {
        console.log(countMap);
    }

    const valuesList = names.sort((a, b) => {
        const an = a.split('.');
        const bn = b.split('.');
        let c = 0;
        while (c < an.length && c < bn.length) {
            if (an[c] !== bn[c]) {
                break;
            }
            c++;
        }
        
        const caMax = range(1, an.length + 1).map(o => an.slice(0, o).join(".")).map(o => countMap[o]).slice(c).reduce((a, b) => Math.max(a, b), 0);
        const cbMax = range(1, bn.length + 1).map(o => bn.slice(0, o).join(".")).map(o => countMap[o]).slice(c).reduce((a, b) => Math.max(a, b), 0);
        if(caMax === cbMax) {
            return a.localeCompare(b);
        }
        return cbMax - caMax;
    }).map((name) => ({
        name: name.replaceAll('#', '.'),
        count: counts[name],
        types: [...(name in types ? types[name] : [])],
        urls: [...(name in nameUrlMap ? nameUrlMap[name] : [])]
    })).filter(n => n.types.length > 0);
    return {
        list: valuesList,
        urlMap: idToUrlMap,
        valueMap
    }
}

export function pageGenerator({ releases, repos, values, count }: CollectorData): Record<string, PageData> {
    const releaseMap = releases.reduce((acc, cur) => {
        acc[cur.key] = cur;
        return acc;
    }, {} as Record<string, ReleaseInfo>);
    const pages: Record<string, PageData> = {};
    const relevant = Object.entries(count)
        .sort((a, b) => b[1] - a[1])
        .filter(([k, v]) => v > 3);
    for (const [key, value] of relevant) {
        const { name } = releaseMap[key];
        let doc = undefined;
        const docPath = path.join(__dirname, '../info/', `${name}.md`);
        const icon = mode(repos[key].filter(r => r.icon).map(r => r.icon));
        const helmRepoName = mode(repos[key].map(r => r.helm_repo_name));
        const helmRepoURL = mode(repos[key].map(r => r.helm_repo_url));

        if (fs.existsSync(docPath)) {
            doc = DOMPurify.sanitize(marked.parse(
                fs.readFileSync(docPath, 'utf-8').replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, "")
            ));
        } else {
            console.log("No doc for", name);
        }
        pages["/hr/" + key] = {
            name,
            key,
            repos: repos[key],
            values: calculateValues(
                repos[key].map(r => r.url).map(url => [url, values[url]])),
            doc,
            icon,
            helmRepoName,
            helmRepoURL,
        }
    }
    return pages;
}