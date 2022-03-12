import React, { useState } from "react";
import { Icon } from '@iconify/react';
import { useObservable, useObservableState } from 'observable-hooks'
import { from, Observable } from 'rxjs'
import { switchMap, map, debounceTime } from 'rxjs/operators'


import { tw } from 'twind'
import moment from "moment";
import { searchQuery, wordcloud } from "./queries";


const linkTw = tw` text-blue-500 cursor-pointer text-underline `;
function MDIIcon(props: {icon: string}) {
  return (props.icon && 
    <Icon icon={"mdi:"+props.icon} className={tw`text-base leading-none inline-block`} />
  ) 
  || null;
}

const wordcloudObservable = () => useObservableState(() => from(wordcloud()), []);
const searchObservable = (search$: Observable<string>) => 
  useObservableState(
    () => search$.pipe(
      debounceTime(100),
      switchMap((val) => {
        if(val.length < 3) {
          return from([])
        }
        return from(searchQuery(val))
      })
    ), []
  );

function SearchView(props: {results: ReturnType<typeof searchObservable>[0]}) {
  const { results } = props;
  const hasIcon = results.some(r => !!r.hajimari_icon);
  const hasCustomNames = results.some(r => r.release_name !== r.chart_name);
  
  type Item = typeof results[0]
  const [reverse, setReverseState] = useState(false);
  const sorts: Record<string, (a: Item, b: Item) => number> = 
  {
    "release_name": (a: Item, b: Item) => (a.release_name ?? "").localeCompare(b.release_name ?? ""),
    "chart_name": (a: Item, b: Item) => (a.chart_name ?? "").localeCompare(b.chart_name ?? ""),
    "timestamp": (a: Item, b: Item) => parseInt(b.timestamp) - parseInt(a.timestamp),
    "repo": (a: Item, b: Item) => a.repo_name.localeCompare(b.repo_name),
    "stars": (a: Item, b: Item) => b.stars - a.stars,
    "lines": (a: Item, b: Item) => a.lines - b.lines,
    "icon": (a: Item, b: Item) => (a.hajimari_icon ?? "").localeCompare(b.hajimari_icon ?? ""),
  }
  const [sort, setSortState] = useState<keyof typeof sorts>("timestamp");
  const setSort = (next: keyof typeof sorts) => {
    if(sort === next) {
      setReverseState(!reverse);
    } else {
      setSortState(next);
    }
  }
  const Th = (props: any) => 
    <th className={tw`text-sm text-gray-600 cursor-pointer`} {...props} />;
  const sorted = results.sort(sorts[sort]);
  const reverseSorted = reverse ? sorted.reverse() : sorted;
  return <table className={tw`table-auto w-full text-left`}>
    <thead>
      <tr>
        {hasIcon && <Th onClick={() => setSort("icon")}>Icon</Th>}
        {hasCustomNames && <Th onClick={()=>setSort("release_name")}>Release</Th>}
        {hasCustomNames && <Th onClick={()=>setSort("chart_name")}>Chart</Th>}
        {!hasCustomNames && <Th onClick={()=>setSort("chart_name")}>Release&Chart</Th>}
        <Th onClick={()=>setSort("repo")}>Repo</Th>
        <Th onClick={()=>setSort("lines")}>Lines</Th>
        <Th onClick={()=>setSort("stars")}>Stars</Th>
        <Th onClick={()=>setSort("timestamp")}>Last modified</Th>
      </tr>
    </thead>
    <tbody>
    {reverseSorted
      .map(release => (
        <tr>
          {hasIcon && <td>{!!release.hajimari_icon && <MDIIcon icon={release.hajimari_icon} />}</td>}
          <td>
            <a href={release.url} target="_blank" className={linkTw}>
              {release.release_name}
            </a>
          </td>
          {hasCustomNames && <td>{release.chart_name}</td>}
          <td><a href={release.repo_url} target="_blank" className={linkTw}>{release.repo_name}</a></td>
          <td>{release.lines}</td>
          <td>{release.stars} ⭐</td>
          <td>{moment.unix(parseInt(release.timestamp)).fromNow()}</td>
        </tr>
    ))}
    </tbody>
  </table>
}

function WordCloudview(props: {
  words: ReturnType<typeof wordcloudObservable>[0],
  setSearchValue: (val: string) => void
}) {
  const { words, setSearchValue } = props;
  return <div>{words.map(word => (
    <div key={word.chart_name}  className={tw`rounded-xl pb-0 pt-0 m-1 mb-0 inline-block ml-0 p-2 border-1` + ' ' + linkTw} 
      title={`${word.count} times`} onClick={() => setSearchValue(word.chart_name ?? "")}>
      <MDIIcon icon={word.icon} />{' '}
      <span className={tw`underline`}>{word.chart_name}</span>
    </div>
  ))}</div>
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
  const [results] = searchObservable(search$);
  const [words] = wordcloudObservable();

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
        className={tw`p-1 pb-0 mb-2 rounded border-2 w-full`} 
        value={searchValue}
        placeholder="search a chart"
      />
      </div>
      
      <div >
        {searchValue.length > 2 && <SearchView results={results} />}
      </div>
      <div>
        {searchValue.length <= 2 && <WordCloudview words={words} setSearchValue={setSearchValue} />}
      </div>
    </div>
  )
}

