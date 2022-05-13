import React, { useState } from "react";
import { pluckFirst, useObservable, useObservableState } from 'observable-hooks'
import { from, switchMap } from 'rxjs'

import { tw } from 'twind'
import { wordcloud } from "../../db/queries";
import { MDIIcon } from "../mdi_icon";
import { Link } from "wouter";

const AT_LEAST = 1;

type WordCloudResults = Awaited<ReturnType<typeof wordcloud>>;

export function WordCloudview() {
  const [showAll, setShowAll] = useState(false);
  const [onlyWithIcons, setOnlyWithIcons] = useState(false);
  const query$ = useObservable<WordCloudResults, [boolean, boolean]>(
    props$ => props$.pipe(
      switchMap(props => from(wordcloud(props[0] ? 0 : AT_LEAST, props[1]))),
    ), [showAll, onlyWithIcons])
  const [words, ] = useObservableState(() => query$, []);
  return <div>
    <div className={tw`mb-2 mt-2`}>
      <span className={tw`p-1 cursor-pointer`} onClick={() => {
          return setOnlyWithIcons(!onlyWithIcons);
        }}>
        <input type="checkbox" className={tw`text-xl`} checked={onlyWithIcons}  />{' '}
        Only with haijmari icons
      </span>
      </div>
    {words.map(word => (
      <Link key={word.chart_name} href={`/${word.chart_name ?? ""}`}  title={`${word.count} times`} className={'word-cloud-word '+tw`cursor-pointer rounded-xl pb-0 pt-0 m-1 mb-0 inline-block ml-0 p-2 border-1`}>
        <MDIIcon icon={word.icon} />{' '}{word.chart_name}
      </Link>
    ))}
    {words.length === 0 && <span>Loading...</span>}
    {!showAll && words.length > 1 && !onlyWithIcons && <button onClick={() => setShowAll(true)}>...</button>}
  </div>
}
  