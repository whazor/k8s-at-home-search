import { Link } from "wouter";
import React, { useState } from "react";
import { pluckFirst, useObservable, useObservableState } from 'observable-hooks'
import { from, } from 'rxjs'
import { switchMap, filter, debounceTime } from 'rxjs/operators'

import { tw } from 'twind'
import moment from "moment";
import { searchQuery } from "../../db/queries";
import { MDIIcon } from "../mdi_icon";
import { Icon } from "@iconify/react";
import { Table, TD, TR } from "../base/Table";
import {localCompareSort,intSort, versionSort } from "../../helpers/sort";
import { reverse } from "cypress/types/lodash";


interface SearchProps {
  search?: string, 
  repo?: string
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


    const repo_link = (rel) => !!rel.helm_repo_url && <span>(<a href={rel.helm_repo_url} target="_blank">repo</a>)</span>
    return <Table items={results} defaultSort="timestamp" id='search-results' headers={
      {
        ...(hasIcon ? {
          "hajimari_icon": {
            "label": "Icon",
            "sort": localCompareSort("hajimari_icon")
          }
        } : {}),
      "release_name": {
        "label": "Release",
        "sort": localCompareSort("release_name")
      },
      "chart_name": {
        "label": "Chart",
        "sort": localCompareSort("chart_name")
      },
      "chart_version": {
        "label": "Version",
        "sort": versionSort("chart_version")
      },
      "repo": {
        "label": "Repo",
        "sort": localCompareSort("repo_name")
      },
      "lines": {
        "label": "Lines",
        "sort": intSort("lines")
      },
      "stars": {
        "label": "Stars",
        "sort": intSort("stars", true)
      },
      "timestamp": {
        "label": "Last Modified",
        "sort": intSort("timestamp", true)
      },
    }}
    renderRow={(release: Item) => <TR key={release.url}>
            {hasIcon && 
              <TD className="icon">{!!release.hajimari_icon && <MDIIcon icon={release.hajimari_icon} />}</TD>}
            <TD className="release-name">
              <a href={release.url} target="_blank">
                {release.release_name}
              </a>
            </TD>
            <TD className='chart-name'><Link href={`/chart:${release.chart_name}`}>{release.chart_name}</Link> {repo_link(release)}</TD>
            <TD className='chart-version'>{release.chart_version}</TD>
            <TD className='repo-name'>
              <a href={release.repo_url} target="_blank">{release.repo_name}</a>
              {/* search icon: */}
              <Link href={`/repo:${release.repo_name}`} className={tw`cursor-pointer`}>
                <Icon icon={'mdi:search'} className={tw`inline`} />
              </Link>
            </TD>
            <TD className='amount-lines'>{release.lines}</TD>
            <TD className='stars'>{release.stars} ⭐</TD>
            <TD className='last-modified'>{moment.unix(parseInt(release.timestamp)).fromNow()}</TD>
          </TR>}
    />
  }