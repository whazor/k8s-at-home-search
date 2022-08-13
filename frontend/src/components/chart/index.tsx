import React, { useState } from "react";
import { pluckFirst, useObservable, useObservableState } from 'observable-hooks'
import { debounceTime, filter, from, switchMap } from 'rxjs'

import { tw } from 'twind'
import { valuesByChartname, releasesByValue } from "../../db/queries";
import { Icon } from "@iconify/react";
import { JSONStringToYaml } from "../../helpers/jsontoyaml";
import { Table, TR, TD } from "../base/Table";
import { localCompareSort } from "../../helpers/sort";
import { Tag } from "../base/Tag";

type ValueResult = Awaited<ReturnType<typeof releasesByValue>>;
function YAMLView(props: ValueResult[0] & { key: string }) {
  const r = props;
  console.log(r)
  const [showCode, setShowCode] = useState(false);
  return <><TR key={r.key}>
    <TD>
      <Icon icon={'mdi:code'} onClick={() => setShowCode(!showCode)} className={tw`inline cursor-pointer border-1 rounded`} />
      {showCode && <Icon icon={'mdi:arrow-down'} className={tw`inline cursor-pointer`} />}
    </TD>
    <TD><a href={r.url} target='_blank'>{r.release_name}</a></TD>
    <TD>{r.repo_name}</TD>
    <TD>{r.releases?.split(',').map((x, i) =>
      <Tag key={r.repo_name + x + i} text={x} />
    )}
    </TD>
  </TR>
    {showCode && <TR><TD colSpan={4}><pre>{JSONStringToYaml(`{"${r.keyName}":${r.value}}`)}</pre></TD></TR>}
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
  console.log("props:", props);
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
    }} defaultSort="release_name" className={tw`pl-5`} items={results}
    renderRow={r => <YAMLView key={r.repo_name + r.release_name} {...r} />}>
  </Table>
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
  const [opened, setOpened] = useState<string | undefined>(undefined);
  const [showReleases, setShowReleases] = useState(false);
  const fullKey = (val: ChartValueResults[0]) => (props.value ? props.value + '.' : '') + val.key;
  return <div>{values.filter(c => c.amount > 0).filter(val => !(val.key?.toString() || "").match(/^\d/)).map(val => <div key={val.key}>
    <a onClick={() => setOpened(val?.key !== opened ? val?.key : undefined)}>
      <Icon icon={"mdi:chevron-" + (val.key === opened ? "down" : "right")} className={tw`inline`} />
    </a>
    <span>{val.key} <span className={tw`text-sm`}>({val.amount} times)</span></span>
    {val.key === opened &&
      <div className={tw`ml-3`}>
        <a className={tw`ml-3`} onClick={() => setShowReleases(!showReleases)}>{!showReleases ? 'Show' : 'Hide'} releases</a>
        {showReleases && <WhoHasValueTable chartName={props.chartName} path={props.value} keyName={val.key} />}
        <ValueList chartName={props.chartName} value={fullKey(val)} />
      </div>
    }
  </div>)}</div>

}


type ChartProps = {
  name: string
}

export function ChartView(props: ChartProps) {
  return <div>
    <h1 className={tw`text-3xl pb-3 font-bold`}>{props.name}</h1>
    <p>Below you find all the different types of values used for this helm chart:</p>

    <ValueList chartName={props.name} />
  </div>;
}
