
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const toAbsolute = (p) => path.resolve(__dirname, p)

const template = fs.readFileSync(toAbsolute('dist/static/index.html'), 'utf-8')
const { render } = await import('./dist/server/entry-server.js')

// determine routes to pre-render from src/pages
// const routesToPrerender = fs
//   .readdirSync(toAbsolute('src/pages'))
//   .map((file) => {
//     const name = file.replace(/\.jsx$/, '').toLowerCase()
//     return name === 'home' ? `/` : `/${name}`
//   })

const query = `
select 
    repo.helm_repo_url,
    rel.chart_name,
    rel.chart_version,
    rel.release_name
from flux_helm_release rel
join flux_helm_repo repo
on rel.helm_repo_name = repo.helm_repo_name
and rel.helm_repo_namespace = repo.namespace
and rel.repo_name = repo.repo_name
`;

;(async () => {
  // pre-render each route...
  const db = await open({
    filename: 'repos.db',
    driver: sqlite3.Database
  });

  const urls = new Set();
  const releases = new Set();
  const count = {}
  await db.each(query, (err, row) => {
    if (err) {
        throw err;
    }
    // console.log(row);
    const {helm_repo_url, chart_name, chart_version, release_name} = row;
    const name = chart_name == release_name ? chart_name : `${chart_name}-${release_name}`;
    const url = 
      (helm_repo_url
        .replace("https://", "")
        .replace("http://", "")
        .replace(/\/$/, '')
        .replaceAll("/", "-")
         + '-' + name).replaceAll(/\s+/g, '-')
          .replaceAll(/[^a-zA-Z0-9\.\-]/gi, '')
          .replaceAll(/^\.+/g, '').toLowerCase();
    releases.add(
      {
        release: release_name,
        chart: chart_name,
        url: url
      }
    );
    urls.add(url);
    if (count[url]) {
      count[url]++;
    } else {
      count[url] = 1;
    }
  });
  console.log([...urls].sort());
  const relevant = Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .filter(([k, v]) => v > 3);
  console.log("Total pages: ", relevant.length);
  relevant
    .forEach(([k, v]) => console.log(k, v));
  
    fs.mkdirSync(toAbsolute('dist/static/hr/'), { recursive: true })
  
  const appData = {
    releases: [...releases]
  }
  const appDataJS = `window.__APP_DATA__ = ${JSON.stringify(appData)}`
  for(const [k, v] of relevant) {
    const context = {
      url: k
    }
    const appHtml = await render(`/hr/${k}`, appData)

    const html = template.replace(`<!--app-html-->`, appHtml).replace(`/**--app-data--**/`, appDataJS)

    const filePath = `dist/static/hr/${k}.html`
    fs.writeFileSync(toAbsolute(filePath), html)
    console.log('pre-rendered:', filePath)
  }
  
  const routesToPrerender = [];
  for (const url of routesToPrerender) {
    const context = {}
    const appHtml = await render(url, context)

    const html = template.replace(`<!--app-html-->`, appHtml).replace(`/**--app-data--**/`, appDataJS)

    const filePath = `dist/static${url === '/' ? '/index' : url}.html`
    fs.writeFileSync(toAbsolute(filePath), html)
    console.log('pre-rendered:', filePath)
  }
})()