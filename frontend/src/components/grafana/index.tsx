import React from "react";
import { useObservableState } from 'observable-hooks'
import { from } from 'rxjs'

import { releasesByValue } from "../../db/queries";
import { Table } from "../base/Table";
import { intSort, localCompareSort } from "../../helpers/sort";
import { JSONStringToYaml } from "../../helpers/jsontoyaml";

const topGrafanaDashboards = () => useObservableState(() => from(releasesByValue("grafana", undefined, "dashboards")), []);

function dashboardWalk(obj: any): any {
  if (typeof obj !== 'object') {
    return []
  }
  let res: any[] = [];
  for (const [category, d] of Object.entries(obj)) {
    if (typeof d !== 'object') {
      console.error("err dashboard not recognized:", obj, d);
      continue;
    }
    if (!!d && ("url" in d || "gnetId" in d)) {
      res.push([category, d]);
    } else {
      res = res.concat(dashboardWalk(d));
    }
  }
  return res;
}

function defaultDict<V>(defaultValue: () => V): Record<string, V> {
  return new Proxy({}, {
    get: (target: Record<string, V>, name: string) => name in target ? target[name] : defaultValue()
  });
}

export function GrafanaDashboardsView() {
  const [results] = topGrafanaDashboards();
  const count = defaultDict<number>(() => 0);
  const categoryMap = defaultDict<Record<string, number>>(() => defaultDict<number>(() => 0));
  const sourceMap = defaultDict<Record<string, number>>(() => defaultDict<number>(() => 0));
  for (const res of results) {
    const dashboards = dashboardWalk(JSON.parse(res.value));
    for (const [category, def] of dashboards) {
      let hash;
      if ("url" in def) {
        hash = def["url"];
      } else if ("gnetId" in def) {
        hash = def["gnetId"] + '-' + def["revision"];
      }
      count[hash] += 1;
      const cmap = categoryMap[hash];
      cmap[category] += 1;
      categoryMap[hash] = cmap;
      const smap = sourceMap[hash];
      smap[JSON.stringify(def)] += 1;
      sourceMap[hash] = smap;
    }
  }
  const sortedHashes = Object.entries(count).sort((a, b) => b[1] - a[1]);
  const sortedDashboards = sortedHashes.map(([hash, count]) => {
    const category = Object.entries(categoryMap[hash]).sort((a, b) => b[1] - a[1])[0][0];
    const source = Object.entries(sourceMap[hash]).sort((a, b) => b[1] - a[1])[0][0];
    const sourceObj = JSON.parse(source);
    const gnetId = typeof sourceObj === 'object' && 'gnetId' in sourceObj && !isNaN(sourceObj['gnetId']) && sourceObj['gnetId'];
    const url = !!gnetId && "https://grafana.com/grafana/dashboards/" + gnetId;
    return {
      hash,
      count,
      category,
      source,
      url
    }
  });
  return <div>
    <span><strong>Note:</strong> Newer versions of a dashboard might be less popular. Please improve our data by upgrading dashboards.</span> <br />
    <Table items={sortedDashboards}
      defaultSort="count"
      tableProps={{ id: "top-dashboards" }}
      headers={{
        "count": {
          "label": "Count",
          "sort": intSort("count", true)
        },
        "category": {
          "label": "Category",
          "sort": localCompareSort("category")
        },
        "hash": {
          "label": "Code",
          "sort": localCompareSort("hash")
        }
      }}
      renderRow={(repo: typeof sortedDashboards[0]) => <tr key={repo.hash}>
        <td className="cell count">{repo.count}</td>
        <td className="cell category">
          {repo.category}
        </td>
        <td className="cell embed">
          <div className="overflow-x-scroll max-w-lg">
            <pre>{JSONStringToYaml(repo.source)}</pre>
          </div>
          {!!repo.url && <a className='link' href={repo.url} target='_blank'>Link</a>}
        </td>
      </tr>}
    />
  </div>
}

