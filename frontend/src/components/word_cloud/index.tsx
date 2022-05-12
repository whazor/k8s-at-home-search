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
  const query$ = useObservable<WordCloudResults, [boolean]>(
    props$ => props$.pipe(
      pluckFirst,
      switchMap(props => from(wordcloud(props ? 0 : AT_LEAST))),
    ), [showAll])
  const [words, ] = useObservableState(() => query$, []);
  return <div>
    {words.map(word => (
      <Link href={`/${word.chart_name ?? ""}`}  title={`${word.count} times`} className={'word-cloud-word '+tw`cursor-pointer rounded-xl pb-0 pt-0 m-1 mb-0 inline-block ml-0 p-2 border-1`}>
        <MDIIcon icon={word.icon} />{' '}{word.chart_name}
      </Link>
    ))}
    {!showAll && <button onClick={() => setShowAll(true)}>...</button>}
  </div>
}
  