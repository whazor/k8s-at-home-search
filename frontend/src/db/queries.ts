import { Subject } from 'rxjs';
import { SQLLiteDialect, sql, Kysely } from './sqlite';


interface Repo {
  repo_name: string,
  url: string,
  branch: string,
  stars: number
}
interface FluxHelmRelease {
  release_name: string,
  chart_name: string,
  chart_version?: string,
  namespace?: string,
  repo_name: string,
  hajimari_icon?: string,
  lines: number,
  url: string,
  timestamp: string
  helm_repo_name: string,
  helm_repo_namespace?: string,
  val?: string
}

interface FluxHelmRepo {
  helm_repo_name: string,
  namespace?: string,
  helm_repo_url: string,
  interval?: string,
  repo_name: string,
  lines: number,
  url: string,
  timestamp: string
}
  
interface Database {
  repo: Repo,
  flux_helm_release: FluxHelmRelease,
  flux_helm_repo: FluxHelmRepo
}



export interface Progress {
  received: number; contentLength: number; 
}

export const dataProgressSubject = new Subject<Progress>();

export async function dataProgress() {
    const response = await fetch(`repos.db`);
    await new Promise(r => setTimeout(r, 3000));
    const reader = response.body.getReader();
    const contentLength = Number(response.headers.get('content-length'));
    let received = 0;
    
    let chunks = [];
    while (true) {
      const {done, value} = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
      received += value.length;
      dataProgressSubject.next({ received, contentLength });
    }
    let chunksAll = new Uint8Array(received);
    let position = 0;
    for(let chunk of chunks) {
      chunksAll.set(chunk, position); // (4.2)
      position += chunk.length;
    }
    dataProgressSubject.complete();
    return chunksAll;
}

const dataPromise = dataProgress();

const db =  new Kysely<Database>({
  dialect: new SQLLiteDialect(dataPromise),
});
export function searchQuery(query: {
  search?: string, 
  repo?: string
}) {
  let { search, repo } = query;
  console.log("search query:", query)
  let select = db.selectFrom('flux_helm_release')
          .innerJoin('repo', 'flux_helm_release.repo_name', 'repo.repo_name')
          .leftJoin('flux_helm_repo', join =>
            join.onRef('flux_helm_release.repo_name', '=', 'flux_helm_repo.repo_name')
              .onRef('flux_helm_release.helm_repo_name','=', 'flux_helm_repo.helm_repo_name')
              .onRef('flux_helm_release.helm_repo_namespace', '=', 'flux_helm_repo.namespace')
          )
          .select([
            'flux_helm_release.release_name as release_name', 
            'flux_helm_release.chart_name as chart_name', 
            'flux_helm_release.chart_version as chart_version',
            'flux_helm_repo.helm_repo_name as helm_repo_name',
            // 'flux_helm_repo.namespace as helm_repo_namespace',
            'flux_helm_repo.url as helm_repo_url',
            'repo.repo_name as repo_name',
            'repo.url as repo_url',
            'flux_helm_release.url as url',
            'flux_helm_release.hajimari_icon as hajimari_icon',
            'flux_helm_release.lines as lines',
            'flux_helm_release.timestamp as timestamp',
            'repo.stars as stars'
          ]);
  if (search) {
    search = search.trim().replace(' ', '%');
    select = select.where('flux_helm_release.chart_name', 'like', `%${search}%`)
            .orWhere('flux_helm_release.release_name', 'like', `%${search}%`)
  }
  if (repo) {
    select = select.where('flux_helm_release.repo_name', '=', repo);
  }
          
  select = select.groupBy('flux_helm_release.url')
          .orderBy('timestamp', 'desc');
  return select.execute();
}

// CREATE TABLE json_tree(
//   key ANY,             -- key for current element relative to its parent
//   value ANY,           -- value for the current element
//   type TEXT,           -- 'object','array','string','integer', etc.
//   atom ANY,            -- value for primitive types, null for array & object
//   id INTEGER,          -- integer ID for this element
//   parent INTEGER,      -- integer ID for the parent of this element
//   fullkey TEXT,        -- full path describing the current element
//   path TEXT,           -- path to the container of the current row
//   json JSON HIDDEN,    -- 1st input parameter: the raw JSON
//   root TEXT HIDDEN     -- 2nd input parameter: the PATH at which to start
// );
interface SqliteJsonTreeWalk {
  key: string,
  value: string,
  type: string,
  atom: string,
  id: number,
  parent: number,
  fullkey: string,
  path: string,
}

export function releasesByChartname(chartName: string) {
  const a = db
    .selectFrom([
      'flux_helm_release as fhr',
      sql<SqliteJsonTreeWalk>`json_each(fhr.val) as val`
    ]).select([
      sql<string>`val.key as key`,
      sql<number>`count(val.key) as amount`
    ])
    .where('fhr.chart_name', '=', chartName)
    .groupBy('val.key')
    .orderBy('amount', 'desc');
  return a.execute();
}

export function releasesByValue(chartname: string, value: string) {
  const a = db
    .selectFrom([
      'flux_helm_release as fhr',
      sql<SqliteJsonTreeWalk>`json_each(fhr.val) as val`
    ]).select([
      'fhr.repo_name as repo_name',
      'val.key as keyName',
      'val.value as value',
      'fhr.url as url',
      'fhr.release_name as release_name'
    ])
    .where('fhr.chart_name', '=', chartname)
    .where('val.key', '=', value);
  return a.execute();
}

export function wordcloud(atLeast=1) {
  console.log("working")
  const st = db.selectFrom('flux_helm_release')
    .groupBy('chart_name')
    .select([
      'chart_name', 
      sql<number>`count(*)`.as('count'),
      sql<string>`
        (select ci.hajimari_icon from flux_helm_release ci
        where ci.chart_name = flux_helm_release.chart_name and 
          ci.hajimari_icon is not null and
          ci.hajimari_icon != ''
        group by ci.hajimari_icon
        order by count(ci.hajimari_icon) desc)`.as('icon'),
    ])
    .having(sql<number>`count(*)`, '>', atLeast)
    .orderBy('count', 'desc');
  return st.execute();
}
export function topReposQuery() {
  const st = db.selectFrom('repo')
    .select([
      'repo.repo_name as name',
      'repo.url as url',
      'repo.stars as stars',
      sql<number>`
        (select count(distinct fr.release_name) from flux_helm_release fr
        where fr.repo_name = repo.repo_name)`.as('count'),
    ]).orderBy('count', 'desc');
  return st.execute();
}