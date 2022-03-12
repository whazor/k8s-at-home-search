import {
  Kysely,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
} from 'kysely/dist/esm/index-nodeless.js'
import { SQLJSDriver } from './sqlite';


interface Repo {
  repo_name: string,
  url: string,
  branch: string,
  stars: number
}
interface Chart {
  release_name: string,
  chart_name: string,
  repo_name: string,
  hajimari_icon: string,
  lines: number,
  url: string,
  timestamp: string
}
interface Database {
  repos: Repo,
  charts: Chart
}

const dataPromise = fetch(`repos.db`).then(res => res.arrayBuffer());
const db =  new Kysely<Database>({
  dialect: {
    createAdapter() { return new SqliteAdapter() },
    createDriver() { return new SQLJSDriver(
      dataPromise
      ) },
    createIntrospector(db: Kysely<unknown>) { return new SqliteIntrospector(db)},
    createQueryCompiler() { return new SqliteQueryCompiler() },
  },
})


export function searchQuery(query: string) {
  query = query.trim().replace(' ', '%');
  const s = db.selectFrom('charts')
          .innerJoin('repos', 'charts.repo_name', 'repos.repo_name')
          .select([
            'charts.release_name as release_name', 
            'charts.chart_name as chart_name', 
            'repos.repo_name as repo_name',
            'repos.url as repo_url',
            'charts.url as url',
            'charts.hajimari_icon as hajimari_icon',
            'charts.lines as lines',
            'charts.timestamp as timestamp',
            'repos.stars as stars'
          ]) // 'stars', 
          .where('chart_name', 'like', `%${query}%`)
          .groupBy('charts.url')
          .orderBy('timestamp', 'desc');
  return s.execute();
}
export function wordcloud() {
  const st = db.selectFrom('charts')
    .groupBy('chart_name')
    .select([
      'chart_name', 
      db.raw<number>('count(*)').as('count'),
      db.raw<string>(`
        (select ci.hajimari_icon from charts ci
        where ci.chart_name = charts.chart_name and 
          ci.hajimari_icon is not null and
          ci.hajimari_icon != ''
        group by ci.hajimari_icon
        order by count(ci.hajimari_icon) desc)
      `).as('icon'),
    ]).orderBy('count', 'desc');
  return st.execute();
}