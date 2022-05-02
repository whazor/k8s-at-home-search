import React, { useState } from "react";
import { useObservable, useObservableState } from 'observable-hooks'
import { from, Observable } from 'rxjs'
import { switchMap, map, debounceTime } from 'rxjs/operators'


import { tw } from 'twind'
import moment from "moment";
import { searchQuery } from "../../db/queries";
import { MDIIcon } from "../mdi_icon";

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

export function SearchView(props: {searchValue: string}) {
    const search$ = useObservable(map(item => item[0]), [props.searchValue]     ) 
    const [results] = searchObservable(search$);

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
    return <table className={'search-results '+ tw`table-auto w-full text-left`}>
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
            {hasIcon && <td className="icon">{!!release.hajimari_icon && <MDIIcon icon={release.hajimari_icon} />}</td>}
            <td className="release-name">
              <a href={release.url} target="_blank">
                {release.release_name}
              </a>
            </td>
            {hasCustomNames && <td className='chart-name'>{release.chart_name}</td>}
            <td className='repo-name'><a href={release.repo_url} target="_blank">{release.repo_name}</a></td>
            <td className='amount-lines'>{release.lines}</td>
            <td className='stars'>{release.stars} ⭐</td>
            <td className='last-modified'>{moment.unix(parseInt(release.timestamp)).fromNow()}</td>
          </tr>
      ))}
      </tbody>
    </table>
  }