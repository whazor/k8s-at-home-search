import React, { useState } from "react";
import { pluckFirst, useObservable, useObservableState } from 'observable-hooks'
import { debounceTime, filter, from, switchMap } from 'rxjs'

import { tw } from 'twind'
import { releasesByChartname, releasesByValue, searchQuery } from "../../db/queries";
import { Icon } from "@iconify/react";

type ValueResult = Awaited<ReturnType<typeof releasesByValue>>;
type ValueProps = {
  chartname: string,
  value: string,
}
function JSONStringToYaml(json: string) {
  try{
    return JSONToYaml(JSON.parse(json));
  } catch(e) {
    return json;
  }
}
function JSONToYaml(json: any, level: number = 0, isFirst=(level==0)) {
  const spaces = " ".repeat(level*2);
  let result = "";

  if(Array.isArray(json)) {
    result += `\n`
    for (const item of json) {
      result += `${spaces}- ${JSONToYaml(item, level+1, true)}`;
    }
  } else if(typeof json === "object") {
    for (const key in json) {
      if (json.hasOwnProperty(key)) {
        if(isFirst) {
          isFirst = false;
          result += `${key}: ${JSONToYaml(json[key], level+1)}`;
        } else {
          result += `\n${spaces}${key}: ${JSONToYaml(json[key], level+1)}`;
        }
      }
    }
  } else {
    result += String(json);
  }

  return result
}

function ResultView(props: ValueResult[0]) {
  const r = props;
  const [showCode, setShowCode] = useState(false);
  return <div>
  <a href={r.url} target='_blank'>{r.release_name}</a>{' '}
  <span>{r.repo_name}</span> {' '}
  <Icon icon={'mdi:code'} onClick={() => setShowCode(!showCode)} className={tw`inline cursor-pointer border-1 rounded`} />
  {showCode && <pre>{JSONStringToYaml(`{"${r.keyName}":${r.value}}`)}</pre>}
</div> 
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
  return <div className={tw`pl-5`}>
    {results.map(r => <ResultView key={r.repo_name + r.release_name} {...r} />)}
  </div>
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
    {charts.map(chart => <div key={chart.key}>
      <a onClick={() => setOpened(chart.key !== opened ? chart.key : null)}>
        <Icon icon={"mdi:chevron-" + (chart.key === opened ? "down" : "right")} className={tw`inline`} />
      </a>
      <span>{chart.key} <span className={tw`text-sm`}>({chart.amount} times)</span></span>
      {chart.key === opened && <ValueView chartname={props.name} value={chart.key} />}
    </div>)}
  </div>;
}