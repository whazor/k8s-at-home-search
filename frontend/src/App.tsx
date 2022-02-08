// import 'regenerator-runtime/runtime'
import React, {useEffect, KeyboardEvent, useState } from "react";
import { Icon } from '@iconify/react';
import { pluckFirst, useObservable, useObservableState } from 'observable-hooks'
import { from } from 'rxjs'
import { switchMap, debounceTime, filter, last, pluck, map } from 'rxjs/operators'
import {
  Kysely,
  Generated,
  DummyDriver,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
} from 'kysely/dist/esm/index-nodeless.js'
import { SQLJSDriver } from './sqlite';

import { tw } from 'twind'
import moment from "moment";
// import tw from 'twin.macro'

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

// moment js UTC 2022-02-08
const date = moment.utc().format('YYYY-MM-DD');

const dataPromise = fetch(`https://github.com/Whazor/k8s-at-home-search/releases/download/${date}/repos.db`).then(res => res.arrayBuffer());
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
  console.log(props.icon);
  return (props.icon && 
    // <span className={"material-icons " +tw`text-base leading-none`}>{props.icon}</span>
    <Icon icon={"mdi:"+props.icon} className={tw`text-base leading-none inline-block`} />
  ) 
  || null;
}
export function App() {
  
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
  

  console.log(words)
  return (
    <div className={tw`max-w-xl mx-auto bg-white rounded-xl shadow-lg`}>
      <h1 
        className={tw`cursor-pointer text-4xl pt-5 pb-5`}
        onClick={() => setSearchValue('')}
      >k8s at home search</h1>
      <div className={tw`relative`}>
      {searchValue.length > 0 && <span 
        className={tw`text-black float-right absolute right-2 top-1 text-xl cursor-pointer`}
        onClick={() => setSearchValue('')}>✕</span>}
      <input 
        type="text" 
        onChange={(e) => setSearchValue(e.target.value)} 
        className={tw`p-1 rounded border-2 w-full`} 
        value={searchValue}
      />
      </div>
      
      <div >
        {searchValue.length > 2 && results.map(chart => (
          <div key={chart.url}>
            <MDIIcon icon={chart.hajimari_icon} />
            <a href={chart.url} target="_blank">{chart.chart_name} {chart.repo_name} ({chart.stars} ⭐) - {moment.unix(parseInt(chart.timestamp)).fromNow()}</a> 
          </div>
        ))}
      </div>
      <div>
        {searchValue.length <= 2 && words.map(word => (
          <div key={word.chart_name}  className={tw`rounded-xl pb-0 pt-0 m-1 mb-0 cursor-pointer inline-block text-blue-300 ml-0 p-2 border-1`} 
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