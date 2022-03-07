import React, {useState } from "react";
import { Icon } from '@iconify/react';
import { useObservable, useObservableState } from 'observable-hooks'
import { from } from 'rxjs'
import { switchMap, debounceTime, map } from 'rxjs/operators'
import {
  Kysely,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
} from 'kysely/dist/esm/index-nodeless.js'
import { SQLJSDriver } from './sqlite';

import { tw } from 'twind'
import moment from "moment";

interface Repo {
  repo_name: string,
  url: string,
  branch: string,
  stars: number
}
interface Chart {
  chart_name: string,
  repo_name: string,
  hajimari_icon: string,
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

function searchQuery(query: string) {
  query = query.trim().replace(' ', '%');
  const s = db.selectFrom('charts')
          .innerJoin('repos', 'charts.repo_name', 'repos.repo_name')
          .select([
            'charts.chart_name as chart_name', 
            'repos.repo_name as repo_name',
            'charts.url as url',
            'charts.hajimari_icon as hajimari_icon',
            'charts.timestamp as timestamp',
            'repos.stars as stars'
          ]) // 'stars', 
          .where('chart_name', 'like', `%${query}%`)
          .groupBy('charts.url')
          .orderBy('timestamp', 'desc');
  return s.execute();
}
function wordcloud() {
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

function MDIIcon(props: {icon: string}) {
  return (props.icon && 
    <Icon icon={"mdi:"+props.icon} className={tw`text-base leading-none inline-block`} />
  ) 
  || null;
}
export function App() {
  const linkTw = tw` text-blue-500 cursor-pointer text-underline `;
  const [searchValue, setSearchValueInt] = useState(window.location.hash.substring(1));
  const setSearchValue = (v: string) => {
    window.location.hash = v;
    setSearchValueInt(v);
  };
  const search$ = useObservable(          
    map(item => item[0]),
    [searchValue]   
  ) 
  const [results] = useObservableState(
    () => search$.pipe(
      debounceTime(100),
      // withLatestFrom(db$),
      switchMap((val) => {
        if(val.length < 3) {
          return from([])
        }
        return from(searchQuery(val))
      })
    ), []
  );
  const [words] = useObservableState(() => from(wordcloud()), [])
  return (
    <div className={tw`w-10/12 mt-2 mx-auto bg-white rounded-xl shadow-lg p-2`}>
      <h1 
        className={tw`cursor-pointer text-4xl pt-5 pb-5`}
        onClick={() => setSearchValue('')}
      >k8s at home search</h1>
      <p className={tw`mb-2`}>We index Flux HelmReleases from Github repositories with the <a href="https://github.com/topics/k8s-at-home" className={linkTw} target="_blank">k8s-at-home topic</a>.
      To include your repository in this search it must be public and then add the topic <code>k8s-at-home</code> to your GitHub Repository topics. To learn more visit <a href="https://k8s-at-home.com/" target={'_blank'} className={linkTw}>the website from k8s@home</a>.</p>
      <div className={tw`relative`}>
      {searchValue.length > 0 && <span 
        className={tw`text-black float-right absolute right-2 top-1 text-xl cursor-pointer`}
        onClick={() => setSearchValue('')}>✕</span>}
      <input 
        type="text" 
        onChange={(e) => setSearchValue(e.target.value)} 
        className={tw`p-1 rounded border-2 w-full`} 
        value={searchValue}
        placeholder="search a chart"
      />
      </div>
      
      <div >
        {searchValue.length > 2 && results.map(chart => (
          <div key={chart.url} className={tw`py-2 text(2xl)`}>
            <MDIIcon icon={chart.hajimari_icon} />
            <a href={chart.url} target="_blank">{chart.chart_name} {chart.repo_name} ({chart.stars} ⭐) - {moment.unix(parseInt(chart.timestamp)).fromNow()}</a> 
          </div>
        ))}
      </div>
      <div>
        {searchValue.length <= 2 && words.map(word => (
          <div key={word.chart_name}  className={tw`rounded-xl pb-0 pt-0 m-1 mb-0 inline-block ml-0 p-2 border-1` + ' ' + linkTw} 
            title={`${word.count} times`} onClick={() => setSearchValue(word.chart_name)}>
            <MDIIcon icon={word.icon} />{' '}
            <span className={tw`underline`}>{word.chart_name}</span>
          </div>
        ))}
      </div>
    </div>
  )
  // return <h1 class="text-3xl font-bold underline">    Hello world!  </h1>;
}