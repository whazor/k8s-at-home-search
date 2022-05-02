import React from "react";
import { useObservableState } from 'observable-hooks'
import { from } from 'rxjs'

import { tw } from 'twind'
import { wordcloud } from "../../db/queries";
import { MDIIcon } from "../mdi_icon";

const wordcloudObservable = () => useObservableState(() => from(wordcloud()), []);

export function WordCloudview(props: {
    setSearchValue: (val: string) => void
  }) {
    const [words] = wordcloudObservable();

    const { setSearchValue } = props;
    return <div>{words.map(word => (
      <div key={word.chart_name}  className={tw`rounded-xl pb-0 pt-0 m-1 mb-0 inline-block ml-0 p-2 border-1`} 
        title={`${word.count} times`} onClick={() => setSearchValue(word.chart_name ?? "")}>
        <a className={'word-cloud-word ' + tw`underline`}><MDIIcon icon={word.icon} />{' '}{word.chart_name}</a>
      </div>
    ))}</div>
  }
  