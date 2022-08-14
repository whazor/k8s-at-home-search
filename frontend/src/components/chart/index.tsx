import React, { useState } from "react";
import { pluckFirst, useObservable, useObservableState } from 'observable-hooks'
import { debounceTime, filter, from, switchMap } from 'rxjs'

import { valuesByChartname, releasesByValue } from "../../db/queries";
import { Icon } from "@iconify/react";
import { JSONStringToYaml } from "../../helpers/jsontoyaml";
import { Table } from "../base/Table";
import { localCompareSort } from "../../helpers/sort";
import { Tag } from "../base/Tag";

type ValueResult = Awaited<ReturnType<typeof releasesByValue>>;
function YAMLView(props: ValueResult[0] & { key: string }) {
  const r = props;
  console.log(r)
  const [showCode, setShowCode] = useState(false);
  return <><tr key={r.key}>
    <td className="cell">
      <Icon icon={'mdi:code'} onClick={() => setShowCode(!showCode)} className="inline cursor-pointer border-1 rounded" />
      {showCode && <Icon icon={'mdi:arrow-down'} className="inline cursor-pointer" />}
    </td>
    <td className="cell"><a href={r.url} target='_blank'>{r.release_name}</a></td>
    <td className="cell">{r.repo_name}</td>
    <td className="cell">{r.releases?.split(',').map((x, i) =>
      <Tag key={r.repo_name + x + i} text={x} />
    )}
    </td>
  </tr>
    {showCode && <tr><td className="cell" colSpan={4}><pre>{JSONStringToYaml(`{"${r.keyName}":${r.value}}`)}</pre></td></tr>}
  </>;
}

type WhoHasValueProps = {
  chartName: string,
  path: string | undefined,
  keyName: string
}
function WhoHasValueTable(props: WhoHasValueProps) {
  const value$ = useObservable<ValueResult, [WhoHasValueProps]>(
    props$ => props$.pipe(
      pluckFirst,
      debounceTime(300),
      filter(p => !!p.chartName && !!p.keyName),
      switchMap(props => from(releasesByValue(props.chartName, props.path, props.keyName))),
    ), [props])
  const results = useObservableState(
    value$, []
  );
  return <Table headers={
    {
      "release_name": {
        "label": "Release",
        "sort": localCompareSort("release_name")
      },
      "repo_name": {
        "label": "Repo",
        "sort": localCompareSort("repo_name")
      },
      "keyName": {
        "label": "Show code",
      },
      "releases": {
        "label": "Also has",
        "sort": localCompareSort("releases")
      }
    }} defaultSort="release_name" tableProps={{ className: "pl-5" }} items={results}
    renderRow={r => <YAMLView key={r.repo_name + r.release_name} {...r} />} />
}

type ChartValueResults = Awaited<ReturnType<typeof valuesByChartname>>;
type ValueListProps = {
  chartName: string,
  value?: string
};

export function ValueList(props: ValueListProps) {
  const search$ = useObservable<ChartValueResults, [ValueListProps]>(
    props$ => props$.pipe(
      pluckFirst,
      debounceTime(300),
      switchMap(props => from(valuesByChartname(props.chartName, props.value))),
    ), [props])
  const values = useObservableState(search$, []);
  const [opened, setOpenedInside] = useState<string | undefined>(undefined);
  const [showReleases, setShowReleases] = useState(false);
  const setOpened = (val: string | undefined) => {
    setOpenedInside(val);
    setShowReleases(false);
  }
  const fullKey = (val: ChartValueResults[0]) => (props.value ? props.value + '.' : '') + val.key;
  return <div>{values.filter(c => c.amount > 0).filter(val => !(val.key?.toString() || "").match(/^\d/)).map(val => <div key={val.key}>
    <a title={`Open ${val.key}`} onClick={() => setOpened(val?.key !== opened ? val?.key : undefined)} className='cursor-pointer'>
      <Icon icon={"mdi:chevron-" + (val.key === opened ? "down" : "right")} className="inline" />
      <span>{val.key} <span className="text-sm">({val.amount} times)</span></span>
    </a>
    {
      val.key === opened &&
      <div className="ml-3">
        <a className="ml-3 btn mb-1" onClick={() => setShowReleases(!showReleases)}>{!showReleases ? 'Show' : 'Hide'} releases</a>
        <div>{showReleases && <WhoHasValueTable chartName={props.chartName} path={props.value} keyName={val.key} />}</div>
        <ValueList chartName={props.chartName} value={fullKey(val)} />
      </div>
    }
  </div>)
  }</div >

}


type ChartProps = {
  name: string
}

export function ChartView(props: ChartProps) {
  return <div>
    <h1 className="text-3xl pb-3 font-bold">{props.name}</h1>
    <p>Below you find all the different types of values used for this helm chart:</p>

    <ValueList chartName={props.name} />
  </div>;
}
