import { useCallback, useEffect, useRef, useState } from "react";

import { useLocation } from "react-router-dom";

export const searchModes = ["hr", "image", "grep"] as const;

export const names: Record<SearchMode, string> = {
  hr: "Helm Release",
  image: "Image",
  grep: "Grep"
}

export type SearchMode = typeof searchModes[number];

interface P {
  search: string,
  setSearch: (s: string) => void,
  mode: SearchMode | undefined
  setMode: (m: SearchMode) => void,
  onEnter: () => void
}

function getTextWidth(text: string, element: HTMLElement) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;

  context.font = getComputedStyle(element).font;

  return context.measureText(text).width;
}


export function SearchBar(props: P) {
  const { search, setSearch, mode, setMode } = props;
  const [selectWidth, setSelectWidth] = useState(30);
  const selectRef = useRef<HTMLSelectElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  let location = useLocation();
  useEffect(() => {
    if (location.pathname !== "/" && location.pathname !== "/" && search.length > 0) {
      setSearch(mode + ' ');
    }
  }, [location.pathname])
  useEffect(() => {
    for (const m of searchModes) {
      if ((search.startsWith(m + ' ')
      ) && mode !== m) {
        setMode(m);
      } else if (search.startsWith(mode + ' ' + m + ' ') && mode !== m) {
        setMode(m);
        setSearch(m + ' ' + search.slice((mode + ' ' + m + ' ').length));
      }
    }
  }, [search]);

  const keyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSearch("");
    }
    if (e.key === "Enter") {
      props.onEnter()
    }
  }, [setSearch]);
  useEffect(() => {
    if (!selectRef.current) return;
    setSelectWidth(getTextWidth(selectRef.current.value, selectRef.current) + 35);
  }, [selectRef, mode])

  const message = {
    "hr": "Search for a helm release...",
    "image": "Search for an image...",
    "grep": "Search for a grep pattern..."
  }[mode || "hr"]
  return <label className="
    bg-slate-50 appearance-none border-2 p-3 border-gray-200 rounded w-full text-gray-700 leading-tight
    focus-within:bg-white focus-within:border-blue-500 dark:bg-black dark:text-gray-300 dark:border-gray-700 dark:focus-within:bg-gray-800 dark:focus-within:border-gray-200
    flex flex-row peer
    ">
    <span className='sr-only'>{message}</span>
    {mode ? <select ref={selectRef} style={{ width: selectWidth, fontSize: "16px" }} className='font-mono mr-3 p-1 border-none  rounded text-sm bg-blue-200 dark:bg-gray-600'
      value={mode}
      onChange={(e) => setMode(e.target.value as SearchMode)}
    >
      {searchModes.map(m => <option key={m} value={m} title={names[m]}>{m}</option>)}
    </select> : <span className='font-mono mr-3 p-1 border-none rounded text-sm bg-blue-200 dark:bg-gray-600'>...</span>}
    <input
      ref={inputRef}
      autoFocus
      className={`bg-transparent grow  focus:outline-none`}
      type="text"
      placeholder={message}
      value={search.replace(new RegExp(`^${mode} `), "")}
      onKeyDown={keyDown}
      onChange={(e) => {
        const val = mode === "hr" ? e.target.value : mode + " " + e.target.value;
        setSearch(val)
      }}
    />
  </label>;
}
