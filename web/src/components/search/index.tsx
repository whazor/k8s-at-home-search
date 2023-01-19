import { useState } from "react";

export function SearchBar(props: { releases: { key: string, chart: string, release: string, count: number }[] }) {
    const [search, setSearch] = useState('')

    const fullHeight = "max-h-128";
    const peerFullHeight = "peer-focus:max-h-128"
    return <label>
        <span className='sr-only'>Search for a chart:</span>
        <input
            className='peer bg-slate-50 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500'
            type="text"
            placeholder="Search for a chart..."
            value={search}
            onChange={(e) => {
                setSearch(e.target.value)
            }}
        />
        <div className={`${search==="" ? "max-h-0" : fullHeight} overflow-hidden ease-in-out duration-300 transition-[max-height] ${peerFullHeight}`}>
            <table className="w-full m-2">
                <thead>
                    <tr>
                        <th className="text-left">Release</th>
                        <th className="text-left">Chart</th>
                        <th className="text-left">Count</th>
                    </tr>
                </thead>
                <tbody>
                    {props.releases.filter(({ chart, release }) => {
                        return chart.toLowerCase().includes(search.toLowerCase()) || release.toLowerCase().includes(search.toLowerCase())
                    }).map(({ key, chart, release, count }) => {
                        return <tr key={key}>
                            <td><a href={`/hr/${key}`}>{release}</a></td>
                            <td><a href={`/hr/${key}`}>{chart}</a></td>
                            <td><a href={`/hr/${key}`}>{count}</a></td>
                        </tr>
                    })}
                </tbody>
            </table>
        </div>
    </label>
        ;
}