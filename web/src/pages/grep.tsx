import { useState } from "react"
import type { GrepData } from "../generators/helm-release/models"

function Highlight(props: {text: string, keyword: string}) {
    const { text, keyword } = props;
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return <>{parts.map((part, i) =>
        <span key={i} className={part.toLowerCase() === keyword.toLowerCase() ? `
            bg-yellow-400
            dark:bg-yellow-600
            dark:text-black
            text-black
        ` : ""}>
            {part}
        </span>
    )}</>;
}


export default function (props : GrepData) {
    const [search, setSearch] = useState("")
    const { valueMap, list, urlMap } = props.values;
    
    const results = search.length > 0 ? list.filter((item) => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        Object.entries(valueMap[item.name]).some(([url, values]) =>
            values.some((v) => v.toLowerCase().includes(search.toLowerCase()))
        )
    ).slice(0, 30) : [];

    const [expanded, setExpanded] = useState(new Set<string>())

    const toggleExpanded = (name: string) => {
        if (expanded.has(name)) {
            expanded.delete(name)
        } else {
            expanded.add(name)
        }
        setExpanded(new Set(expanded))
    }

    return <div>
        Sorry for the double input field:
        <input
            autoFocus
            className='peer bg-slate-50 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 dark:bg-black dark:text-gray-300 dark:border-gray-700 dark:focus:bg-gray-800 dark:focus:border-blue-500'
            type="text"
            placeholder="Grep through values..."
            value={search}
            onChange={(e) => {
                setSearch(e.target.value)
            }}
        />

        {search.length > 0 && <div className="mt-4">
            <h2 className="text-2xl font-bold">Results</h2>
            <ul className="mt-4">
                {results.map((item) => {
                    return <li key={item.name} className="mb-1">
                        <h3 className="text-xl font-bold">
                            <Highlight text={item.name} keyword={search} />
                            {/* small expand button */}
                            <button className="ml-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                                onClick={() => toggleExpanded(item.name)}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    {expanded.has(item.name) ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>}    
                                </svg>
                            </button>
                        </h3>
                        {!expanded.has(item.name) && <span>
                            {Object.entries(valueMap[item.name]).map(([url, values], i) => {
                                const vals = values.filter((v) => v.toLowerCase().includes(search.toLowerCase()))
                                return <ul key={i} className="ml-2">
                                    {vals.map((value, j) => {
                                        return <li key={j} className="dark:text-gray-300">
                                                <a href={urlMap[parseInt(url)]} target="_blank" rel="noreferrer">
                                                    <Highlight text={value} keyword={search} />
                                                </a>
                                            </li>
                                    })}
                                </ul>
                            })}
                        </span>}
                        {expanded.has(item.name) && <div className="ml-2">
                            <ul>
                                {Object.entries(valueMap[item.name]).map(([url, values], i) => {
                                    return <>
                                        {values.map((value, j) => {
                                            return <li key={j} className="dark:text-gray-300">
                                                <a href={urlMap[parseInt(url)]} target="_blank" rel="noreferrer">
                                                    <Highlight text={value} keyword={search} />
                                                </a>
                                            </li>
                                        })}
                                    </>
                                })}
                            </ul>
                        </div>}
                            
                    </li>
                })}
            </ul>
        </div>}

    </div>
}