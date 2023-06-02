import { useCallback, useEffect, useState } from "react";

import { useLocation } from "react-router-dom";

export const searchModes = ["hr", "image", "grep"] as const;

export const names : Record<SearchMode, string> = {
    hr: "Helm Release",
    image: "Image",
    grep: "Grep"
}

export type SearchMode = typeof searchModes[number];

interface P  {
    search: string, 
    setSearch: (s: string) => void,
    mode: SearchMode|undefined
    setMode: (m: SearchMode) => void,
    onEnter: () => void
}

export function SearchBar(props: P ) {
    const {search, setSearch, mode, setMode} = props;

    let location = useLocation();
    useEffect(() => {
        if(location.pathname !== "/k8s-at-home-search/" && location.pathname !== "/" && search.length > 0) {
            setSearch(mode + ' ');
        }
    }, [location.pathname])
    useEffect(() => {
        for (const m of searchModes) {
            if ((search.startsWith(m+' ') 
            ) && mode !== m) {
                setMode(m);
            } else if (search.startsWith(mode + ' ' + m + ' ') && mode !== m) {
                setMode(m);
                setSearch(m + ' ' + search.slice((mode + ' ' + m + ' ').length));
            }
        }
    }, [search]);

    const keyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if(e.key === "Escape") {
            setSearch("");
        }
        if(e.key === "Enter") {
            props.onEnter()
        }
    }, [setSearch]);
    return <div><label>
        <span className='sr-only'>Search for a chart:</span>
        {/* draw mode 'inside' input, with border */}
        {mode && <span title={names[mode]} className='absolute z-50 m-3 mt-3 p-1 border-2 border-blue-500 rounded text-sm bg-blue-200'>
            {mode}
        </span>}
        <input
            autoFocus
            className={`peer bg-slate-50 appearance-none border-2 border-gray-200 rounded w-full py-4 px-4 text-gray-700 leading-tight focus:outline-none 
                    focus:bg-white focus:border-blue-500 dark:bg-black dark:text-gray-300 dark:border-gray-700 dark:focus:bg-gray-800 dark:focus:border-blue-500
            `}
            style={{
                paddingLeft: mode && mode.length > 0 ? 34 + mode.length * 8 : undefined
            }}
            type="text"
            placeholder="Search for a chart..."
            value={search.replace(new RegExp(`^${mode} `), "")}
            onKeyDown={keyDown}
            onChange={(e) => {
                const val = mode === "hr" ? e.target.value : mode+" "+e.target.value;
                setSearch(val)
            }}
        />
        <span className="text-sm text-slate-500">
            Switch modes by typing <span><code>image</code>[space] for image search</span> or <code>grep</code>[space] for grep mode.</span>
        </label>
        
        </div>;
}