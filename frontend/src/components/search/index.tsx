import { Link } from "wouter";
import React, { useState } from "react";
import { pluckFirst, useObservable, useObservableState } from 'observable-hooks'
import { from, } from 'rxjs'
import { switchMap, filter, debounceTime } from 'rxjs/operators'
import semverRegex from 'semver-regex';
import semver from 'semver';

import { tw } from 'twind'
import moment from "moment";
import { searchQuery } from "../../db/queries";
import { MDIIcon } from "../mdi_icon";
import { Icon } from "@iconify/react";


interface SearchProps {
  search?: string, 
  repo?: string
}

const sr = semverRegex();
function parseVersion(str?: string) {
  const res = sr.exec(str || "0.0.1");
  if(res) {
    return res[0] || str || "0.0.1";
  }
  return str || "0.0.1";
}
function compareVersions(a: string, b: string) {
  console.log(a, b)
  let aClean = "0.0.1", bClean = "0.0.1";
  try {
    aClean = semver.clean(a);
  } catch (_e) {}
  try {
    bClean = semver.clean(b);
  } catch (_e) {}
  return semver.compare(aClean || "0.0.1", bClean || "0.0.1");
}

type SearchResults = Awaited<ReturnType<typeof searchQuery>>;

export function SearchView(props: SearchProps) {
    const search$ = useObservable<SearchResults, [SearchProps]>(
      props$ => props$.pipe(
        pluckFirst,
        debounceTime(500),
        filter(p => 
          (!!p.search && p.search.length > 2) || (!!p.repo && p.repo.length > 2)
        ),
        switchMap(props => from(searchQuery(props))),
      ), [props]) 
    
    const results = useObservableState(
      search$, []
      );
    
    const hasIcon = results.some(r => !!r.hajimari_icon);
    
    type Item = typeof results[0]
    const [reverse, setReverseState] = useState(false);
    

    const sorts: Record<string, (a: Item, b: Item) => number> = 
    {
      "release_name": (a: Item, b: Item) => (a.release_name ?? "").localeCompare(b.release_name ?? ""),
      "chart_name": (a: Item, b: Item) => (a.chart_name ?? "").localeCompare(b.chart_name ?? ""),
      "chart_version": (a: Item, b: Item) => compareVersions(parseVersion(a.chart_version), parseVersion(b.chart_version)),
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
    const repo_link = (rel) => !!rel.helm_repo_url && <span>(<a href={rel.helm_repo_url} target="_blank">repo</a>)</span>
    return <table className={'search-results '+ tw`table-auto w-full text-left`}>
      <thead>
        <tr>
          {hasIcon && <Th onClick={() => setSort("icon")}>Icon</Th>}
          <Th onClick={()=>setSort("release_name")}>Release</Th>
          <Th onClick={()=>setSort("chart_name")}>Chart</Th>
          <Th onClick={()=>setSort("chart_version")}>Version</Th>
          <Th onClick={()=>setSort("repo")}>Repo</Th>
          <Th onClick={()=>setSort("lines")}>Lines</Th>
          <Th onClick={()=>setSort("stars")}>Stars</Th>
          <Th onClick={()=>setSort("timestamp")}>Last modified</Th>
        </tr>
      </thead>
      <tbody>
      {reverseSorted
        .map(release => (
          <tr key={release.url}>
            {hasIcon && <td className="icon">{!!release.hajimari_icon && <MDIIcon icon={release.hajimari_icon} />}</td>}
            <td className="release-name">
              <a href={release.url} target="_blank">
                {release.release_name}
              </a>
            </td>
            <td className='chart-name'><Link href={`/chart:${release.chart_name}`}>{release.chart_name}</Link> {repo_link(release)}</td>
            <td className='chart-version'>{release.chart_version}</td>
            <td className='repo-name'>
              <a href={release.repo_url} target="_blank">{release.repo_name}</a>
              {/* search icon: */}
              <Link href={`/repo:${release.repo_name}`} className={tw`cursor-pointer`}>
                <Icon icon={'mdi:search'} className={tw`inline`} />
              </Link>
            </td>
            <td className='amount-lines'>{release.lines}</td>
            <td className='stars'>{release.stars} ⭐</td>
            <td className='last-modified'>{moment.unix(parseInt(release.timestamp)).fromNow()}</td>
          </tr>
      ))}
      </tbody>
    </table>
  }