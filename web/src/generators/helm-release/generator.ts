import fs from 'node:fs'
import path from 'node:path'
import { Database } from "sqlite";
import sqlite3 from "sqlite3";
import { marked } from 'marked';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// const createDOMPurify = require('dompurify');
// const { JSDOM } = require('jsdom');
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { CollectorData, ReleaseInfo, RepoInfo, ValuesData, PageData, MINIMUM_COUNT, ValueTree, ReleaseInfoCompressed, AppData, RepoPageData, RepoReleaseInfo, denormalize, GrepData, ImagePageData } from './models';
import { mode, simplifyURL } from '../../utils';

const window = new JSDOM('<!DOCTYPE html>').window;
// @ts-expect-error
const DOMPurify = createDOMPurify(window);


// When looking at a certain release,
// we want to offer users the ability to filter
// repos that also have the following releases.
//
// Add more if you want via PR. The idea is to have releases
// that divide the community into groups, such as nginx vs traefik.
const INTERESTING = [
  'authelia',
  'authentik',
  'nfs-subdir-external-provisioner',
  'cloudnative-pg',
  'csi-driver-nfs',
  'external-dns',
  'ingress-nginx',
  'longhorn',
  'rook-ceph-cluster',
  'traefik',
  'velero',
  'volsync',
];

function mergeHelmURL(url: string) {
  // wrap http to known oci registries
  const mapping: Record<string, string> = {
    "https://bjw-s.github.io/helm-charts/": "oci://ghcr.io/bjw-s/helm/",
    "https://charts.bitnami.com/bitnami/": "oci://registry-1.docker.io/bitnamicharts/",
    "https://github.com/prometheus-community/helm-charts/": "oci://ghcr.io/prometheus-community/charts/",
    "https://prometheus-community.github.io/helm-charts/": "oci://ghcr.io/prometheus-community/charts/",
    "https://actions.github.io/actions-runner-controller/": "oci://ghcr.io/actions/actions-runner-controller-charts/",
    "https://kyverno.github.io/kyverno/": "oci://ghcr.io/kyverno/charts/",
    "https://grafana.github.io/helm-charts/": "oci://ghcr.io/grafana-operator/helm-charts/",

  };
  if (url in mapping) {
    return mapping[url];
  }

  return url;
}


function releaseKey(url: string, name: string) {
  return (url
    .replace("https://", "")
    .replace("http://", "")
    .replace("oci://", "")
    .replace(/\/$/, '')
    .replaceAll("/", "-")
    + '-' + name).replaceAll(/\s+/g, '-')
    .replaceAll(/[^a-zA-Z0-9\.\-]/gi, '')
    .replaceAll(/^\.+/g, '').toLowerCase()
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
    const { chart_name, chart_version, release_name } = row;
    const helm_repo_url = mergeHelmURL(row.helm_repo_url);
    const name = chart_name == release_name ? chart_name : `${chart_name}-${release_name}`;
    const key = releaseKey(helm_repo_url, name);
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
        helm_repo_url,
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

function normalizeData(data: string[]): [string[], Record<string, number>] {
  const set = new Set(data);
  const map: Record<string, number> = {};
  let i = 0;
  for (const s of set) {
    map[s] = i++;
  }
  return [
    Array.from(set),
    map,
  ]
}

function repoAlsoHas(data: CollectorData) {
  const interestingIdToName = Object.fromEntries(INTERESTING.map((x, i) => [i, x]));
  const interestingNameToId = Object.fromEntries(INTERESTING.map((x, i) => [x, i]));

  const { repos } = data;
  const set = new Set(INTERESTING);
  const repoAlsoHasMap: Record<string, number[]> = {};
  for (const { repo, name } of Object.values(repos).flat()) {
    if (set.has(name)) {
      if (!repoAlsoHasMap[repo]) {
        repoAlsoHasMap[repo] = [];
      }
      if (!repoAlsoHasMap[repo].includes(interestingNameToId[name])) {
        repoAlsoHasMap[repo].push(interestingNameToId[name]);
      }
    }
  }
  return {
    interestingIdToName,
    repoAlsoHasMap
  }
}

export function appDataGenerator(data: CollectorData):
  Pick<AppData, 'chartURLs' | 'releases' | 'repoAlsoHas' | 'repos'> {
  const { releases, keys, count, repos } = data;
  const [chartURLs, chartURLMap] = normalizeData(releases.map(r => r.chartsUrl));




  return {
    chartURLs,
    repoAlsoHas: repoAlsoHas(data),
    repos: [...new Set(Object.values(repos).flatMap((arr) => arr.map(r => r.repo)))],
    releases: releases.map(r => ([
      r.release,
      r.chart,
      r.name,
      r.key,
      chartURLMap[r.chartsUrl],
      count[r.key],
      mode(repos[r.key].filter(r => r.icon).map(r => r.icon)),
    ]))
  }
};

const range = (start: number, end: number) => Array.from({ length: end - start }, (_, i) => i + start);

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
        if (val.name.startsWith('[')) {
          name = key + val.name;
        } else if (val.name !== "") {
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
    const { name, url, value } = item;
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
    if (caMax === cbMax) {
      return a.localeCompare(b);
    }
    return cbMax - caMax;
  }).map((name) => ({
    name,
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

export function pageGenerator(
  { releases, repos, values, count }: CollectorData,
  filterRelevant: boolean = true
): Record<string, PageData> {
  const releaseMap = releases.reduce((acc, cur) => {
    acc[cur.key] = cur;
    return acc;
  }, {} as Record<string, ReleaseInfo>);
  const pages: Record<string, PageData> = {};
  const relevant = Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .filter(([k, v]) =>
      filterRelevant ?
        v >= MINIMUM_COUNT
        : v < MINIMUM_COUNT
    );
  for (const [key, value] of relevant) {
    const { name, chart } = releaseMap[key];
    let doc = undefined;
    const docPath = path.join(__dirname, '../../info/', `${name}.md`);
    console.log(docPath);
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
      title: name + ' helm release',
      name,
      key,
      repos: repos[key],
      values: calculateValues(
        repos[key].map(r => r.url).map(url => [url, values[url]])),
      doc,
      icon,
      chartName: chart,
      helmRepoName,
      helmRepoURL,
    }
  }
  return pages;
}

export interface TopRepoInfo {
  count: number,
  name: string,
  url: string,
  stars: number,
}

export function generateTopReposPageData(
  { releases, repos, values, count }: CollectorData,
): TopRepoInfo[] {
  return Object.values(Object.entries(repos).reduce((acc, [key, repo]) => {
    for (const r of repo) {
      if (!(r.repo in acc)) {
        acc[r.repo] = {
          count: 0,
          name: r.repo,
          url: r.repo_url,
          stars: r.stars,
        }
      }
      acc[r.repo].count += 1;
    }
    return acc;
  }, {} as Record<string, TopRepoInfo>)).sort((a, b) => b.stars - a.stars);
}

export function generateRepoPagesData(data: CollectorData,): Record<string, RepoPageData> {
  const { releases, repos } = data;
  const charts = Object.fromEntries(releases.map(r => [r.key, simplifyURL(r.chartsUrl) + '/' + r.chart]));
  const releaseMap = Object.entries(repos).reduce((acc, [key, repo]) => {
    for (const r of repo) {
      if (!(r.repo in acc)) {
        acc[r.repo] = []
      }
      acc[r.repo].push(
        {
          name: r.name,
          chart: charts[key],
          url: r.url,
          icon: r.icon,
          version: r.chart_version,
          timestamp: r.timestamp,
        }
      );
    }
    return acc;
  }, {} as Record<string, RepoReleaseInfo[]>);

  return Object.entries(releaseMap)
    .filter(([, repos]) => repos.length >= 1)
    .reduce((acc, [key, repos]) => {
      const parsedUrl = new URL(repos[0].url);
      const url = `https://${parsedUrl.host}/${key}`;
      acc[key] = {
        name: key,
        url,
        releases: repos,
      };
      return acc;
    }, {} as Record<string, RepoPageData>);


}

export function generateGrepPageData(data: CollectorData): GrepData {
  // const {values} = data;
  const values = calculateValues(Object.entries(data.values))

  return {
    values
  };
}

export function generateImagePageData(data: CollectorData): ImagePageData {
  // repository -> tag -> url[]
  const images: Record<string, Record<string, string[]>> = {

  }

  for (const [url, values] of Object.entries(data.values)) {
    if (!(typeof values === 'object' && !!values && 'image' in values)) {
      continue;
    }
    const image = values['image'];
    // check if object and whether tag and repository are set
    if (typeof image !== 'object' || image == null || !('tag' in image) || !('repository' in image)) {
      continue;
    }
    // images.push(`${image.repository}:${image.tag}`);
    const repo = image.repository;
    const tag = image.tag;
    // if repo or tag not string, skip
    if (!(typeof repo === 'string' && typeof tag === 'string')) {
      continue;
    }
    if (!(repo in images)) {
      images[repo] = {};
    }
    if (!(tag in images[repo])) {
      images[repo][tag] = [];
    }
    images[repo][tag].push(url);

  }

  return {
    images
  };
}
