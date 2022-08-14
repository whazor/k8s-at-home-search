import { Link } from "wouter";
import React, { useState } from "react";
import { pluckFirst, useObservable, useObservableState } from 'observable-hooks'
import { from, } from 'rxjs'
import { switchMap, filter, debounceTime } from 'rxjs/operators'

import moment from "moment";
import { searchQuery } from "../../db/queries";
import { MDIIcon } from "../mdi_icon";
import { Icon } from "@iconify/react";
import { Table } from "../base/Table";
import { localCompareSort, intSort, versionSort } from "../../helpers/sort";
import { Tag } from "../base/Tag";


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


  const repoLink = (rel: Item) => !!rel.helm_repo_url && <span>(<a href={rel.helm_repo_url} className='link' target="_blank">repo</a>)</span>
  return <Table items={results} defaultSort="timestamp" tableProps={{ id: 'search-results' }} headers={
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
      "releases": {
        "label": "Also has",
        "sort": localCompareSort("releases")
      }
    }}
    renderRow={(release: Item) => <tr key={release.url}>
      {hasIcon &&
        <td className="cell icon">{!!release.hajimari_icon && <MDIIcon icon={release.hajimari_icon} />}</td>}
      <td className="cell release-name">
        <a href={release.url} title="Link to Github" className="link" target="_blank">
          {release.release_name}
        </a>
      </td>
      <td className='cell chart-name'>
        {release.chart_name}
        <Link title="Value tree" href={`/chart:${release.chart_name}`} className="btn">
          {''}
          <Icon icon='mdi:file-tree-outline' className="inline h-3" />
        </Link>
        {repoLink(release)}
      </td>
      <td className='cell chart-version'>{release.chart_version}</td>
      <td className='cell repo-name'>
        <a href={release.repo_url} className="link" target="_blank">{release.repo_name}</a>
        {/* search icon: */}
        <Link href={`/repo:${release.repo_name}`} className="btn">
          {' '}
          <Icon icon={'mdi:search'} className="inline" />
        </Link>
      </td>
      <td className='cell amount-lines'>{release.lines}</td>
      <td className='cell stars'>{release.stars} ⭐</td>
      <td className='cell last-modified'>{moment.unix(parseInt(release.timestamp)).fromNow()}</td>
      <td className='cell'>{release.releases?.split(',').map((x, i) =>
        <Tag key={release.repo_name + x + i} text={x} />
      )}
      </td>
    </tr>}
  />
}
