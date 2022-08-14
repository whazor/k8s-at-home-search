import React from "react";
import { useObservableState } from 'observable-hooks'
import { from } from 'rxjs'

import { topReposQuery } from "../../db/queries";
import { Link } from "wouter";
import { Icon } from "@iconify/react";
import { Table } from "../base/Table";
import { intSort, localCompareSort } from "../../helpers/sort";

import { Tag } from "../base/Tag";

const topReposObservable = () => useObservableState(() => from(topReposQuery()), []);

export function TopReposView() {
  const [repos] = topReposObservable();
  console.log(repos);
  return <Table items={repos}
    defaultSort="count"
    tableProps={{ id: "top-repos" }}
    headers={{
      "count": {
        "label": "# of Helm releases",
        "sort": intSort("count", true)
      },
      "name": {
        "label": "Repo",
        "sort": localCompareSort("name")
      },
      "stars": {
        "label": "Stars",
        "sort": intSort("stars", true)
      },
      "releases": {
        "label": "Highlights",
        "sort": localCompareSort("releases")
      }
    }}
    renderRow={(repo: any) => <tr key={repo.name}>
      <td className="cell count">{repo.count}</td>
      <td className="cell name">
        <a href={repo.url}>{repo.name}</a>
        <Link href={`/repo:${repo.name}`} className="cursor-pointer">
          <Icon icon={'mdi:search'} className="inline" />
        </Link>
      </td>
      <td className="cell stars">{repo.stars}</td>
      <td className="cell">{(repo.releases || "").split(',').map((x: string, i: number) =>
        <Tag key={repo.repo_name + x + i} text={x} />
      )}
      </td>
    </tr>}
  />
}

