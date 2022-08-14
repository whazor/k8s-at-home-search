import React, { useState } from "react";
import { useObservable, useObservableState } from 'observable-hooks'
import { from, switchMap } from 'rxjs'
import { wordcloud } from "../../db/queries";
import { MDIIcon } from "../mdi_icon";
import { Link } from "wouter";

const AT_LEAST = 2;

type WordCloudResults = Awaited<ReturnType<typeof wordcloud>>;

export function WordCloudView() {
  const [showAll, setShowAll] = useState(false);
  const [onlyWithIcons, setOnlyWithIcons] = useState(false);
  const query$ = useObservable<WordCloudResults, [boolean, boolean]>(
    props$ => props$.pipe(
      switchMap(props => from(wordcloud(props[0] ? 0 : AT_LEAST, props[1]))),
    ), [showAll, onlyWithIcons])
  const [words,] = useObservableState(() => query$, []);
  return <div>
    <div className="mb-1">
      <span className="p-1 cursor-pointer" onClick={() => setOnlyWithIcons(!onlyWithIcons)}>
        <input type="checkbox" className="text-xl" checked={onlyWithIcons} onChange={() => setOnlyWithIcons(!onlyWithIcons)} />{' '}
        Show only releases with
      </span><a href="https://hajimari.io/" className='a' target="_blank">haijmari icons</a>
    </div>
    {words.map(word => (
      <Link key={word.release_name} href={`/${word.release_name ?? ""}`} title={`${word.count} times`}
        className="word-cloud-word cursor-pointer text-lg rounded pb-0 pt-0 px-1 m-1 mb-0 inline-block ml-0 border-1 dark:bg-gray-300">
        {!!word.icon && <MDIIcon icon={word.icon} />}{' '}{word.release_name}
      </Link>
    ))}
    {words.length === 0 && <span>Loading...</span>}
    {!showAll && words.length > 1 && !onlyWithIcons && <button onClick={() => setShowAll(true)}>...</button>}
  </div>
}

