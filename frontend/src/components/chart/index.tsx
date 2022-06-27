import React, { useState } from "react";
import { pluckFirst, useObservable, useObservableState } from 'observable-hooks'
import { debounceTime, filter, from, switchMap } from 'rxjs'

import { tw } from 'twind'
import { releasesByChartname, releasesByValue, searchQuery } from "../../db/queries";
import { Icon } from "@iconify/react";
import { JSONStringToYaml } from "../../helpers/jsontoyaml";
import { Table, TR, TD } from "../base/Table";
import { localCompareSort } from "../../helpers/sort";
import { Tag } from "../base/Tag";

type ValueResult = Awaited<ReturnType<typeof releasesByValue>>;
type ValueProps = {
  chartname: string,
  value: string,
}

function ResultView(props: ValueResult[0] & {key: string}) {
  const r = props;
  const [showCode, setShowCode] = useState(false);
  return <><TR key={r.key}>
    <TD>
      <Icon icon={'mdi:code'} onClick={() => setShowCode(!showCode)} className={tw`inline cursor-pointer border-1 rounded`} />
      {showCode && <Icon icon={'mdi:arrow-down'} className={tw`inline cursor-pointer`} />}
    </TD>
    <TD><a href={r.url} target='_blank'>{r.release_name}</a></TD>
  <TD>{r.repo_name}</TD>
  <TD>{r.releases?.split(',').map((x, i) => 
      <Tag key={r.repo_name+x+i} text={x} />
    )}
  </TD>
  </TR>
  {showCode && <TR><TD colSpan={4}><pre>{JSONStringToYaml(`{"${r.keyName}":${r.value}}`)}</pre></TD></TR>}
  </>;
}

function ValueView(props: ValueProps) {
  const value$ = useObservable<ValueResult, [ValueProps]>(
    props$ => props$.pipe(
      pluckFirst,
      debounceTime(300),
      filter(p => !!p.chartname && !!p.value),
      switchMap(props => from(releasesByValue(props.chartname, props.value))),
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
    }} defaultSort="release_name" className={tw`pl-5`} items={results} 
    renderRow={r => <ResultView key={r.repo_name + r.release_name} {...r} />}>
  </Table>
}

type ChartResults = Awaited<ReturnType<typeof releasesByChartname>>;
type ChartProps = {
  name: string
}

export function ChartView(props: ChartProps) {
  const search$ = useObservable<ChartResults, [ChartProps]>(
    props$ => props$.pipe(
      pluckFirst,
      debounceTime(300),
      switchMap(props => from(releasesByChartname(props.name))),
    ), [props]) 
  
  const charts = useObservableState(search$, []);
  const [opened, setOpened] = useState("")
  console.log(charts);
  return <div>
    <h1 className={tw`text-3xl pb-3 font-bold`}>{props.name}</h1>
    <p>Below you find all the different types of values used for this helm chart:</p>
    {charts.filter(c => c.amount > 0).map(chart => <div key={chart.key}>
      <a onClick={() => setOpened(chart.key !== opened ? chart.key : null)}>
        <Icon icon={"mdi:chevron-" + (chart.key === opened ? "down" : "right")} className={tw`inline`} />
      </a>
      <span>{chart.key} <span className={tw`text-sm`}>({chart.amount} times)</span></span>
      {chart.key === opened && <ValueView chartname={props.name} value={chart.key} />}
    </div>)}
  </div>;
}