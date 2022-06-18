import React from "react";
import { useObservableState } from 'observable-hooks'
import { from } from 'rxjs'

import { tw } from 'twind'
import { releasesByValue } from "../../db/queries";
import { Table, TD, TR } from "../base/Table";
import { intSort, localCompareSort } from "../../helpers/sort";
import { JSONStringToYaml } from "../../helpers/jsontoyaml";

const topGrafanaDashboards = () => useObservableState(() => from(releasesByValue("grafana", "dashboards")), []);

function dashboardWalk(obj): any {
  if (typeof obj !== 'object') {
    return []
  }
  let res = [];
  for (const [category, d] of Object.entries(obj)) {
    if (typeof d !== 'object') {
      console.error("err dashboard not recognized:", obj, d);
      continue;
    }
    if("url" in d || "gnetId" in d) {
      res.push([category, d]);
    } else {
      res = res.concat(dashboardWalk(d));
    }
  }
  return res;
}

function defaultDict<D>(defaultValue: () => D): Record<string, D> {
  return new Proxy({}, {
    get: (target, name) => name in target ? target[name] : defaultValue()
  });  
}

export function GrafanaDashboardsView() {
    const [results] = topGrafanaDashboards();
    const count = defaultDict<number>(() => 0);
    const categoryMap = defaultDict<Record<string, number>>(() => defaultDict<number>(() => 0));
    const sourceMap = defaultDict<Record<string, number>>(() => defaultDict<number>(() => 0));
    for (const res of results) {
        const dashboards = dashboardWalk(JSON.parse(res.value));
        for(const [category, def] of dashboards) {
          let hash;
          if("url" in def) {
            hash = def["url"];
          } else if ("gnetId" in def) {
            hash = def["gnetId"] +'-'+ def["revision"];
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
        id="top-dashboards"
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
        renderRow={(repo: typeof sortedDashboards[0]) => <TR key={repo.hash}>
            <TD className="count">{repo.count}</TD>
            <TD className="category">
                {repo.category}
            </TD>
            <TD className="embed">
              <div className={tw`overflow-x-scroll max-w-lg`}>
                <pre>{JSONStringToYaml(repo.source)}</pre>
              </div>
              {!!repo.url && <a href={repo.url} target='_blank'>Link</a>}
            </TD>
        </TR>}
    />
    </div>
  }
  