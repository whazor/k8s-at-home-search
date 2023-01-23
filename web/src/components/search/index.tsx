import { useState } from "react";
import { ReleaseInfo } from "../../generators/helm-release";

export function SearchBar(props: { releases: ReleaseInfo[] }) {
    const [search, setSearch] = useState('')
    const simplifyURL = (url: string) => {
        // get domain
        let domain = url.replace(/https?:\/\//, '').split('/')[0];
        // remove tld
        domain = domain.split('.').slice(0, -1).join('.');
        // remove charts.
        domain = domain.replace(/^charts\./, '');
        // remove www
        domain = domain.replace(/^www\./, '');
        // remove github
        domain = domain.replace(/\.github$/, '');
        return domain;
    };
    const fullHeight = "max-h-128";
    const peerFullHeight = "peer-focus:max-h-128"
    return <label>
        <span className='sr-only dark:text-white'>Search for a chart:</span>
        <input
            className='
                peer bg-slate-50 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500
                dark:bg-black dark:text-white dark:border-gray-700 dark:focus:bg-gray-800 dark:focus:border-blue-500
            '
            type="text"
            placeholder="Search for a chart..."
            value={search}
            onChange={(e) => {
                setSearch(e.target.value)
            }}
        />
        <div className={`${search==="" ? "max-h-0" : fullHeight} overflow-hidden ease-in-out duration-300 transition-[max-height] ${peerFullHeight}`}>
            <table className="w-full m-2 dark:text-white">
                <thead>
                    <tr>
                        <th className="text-left">Release</th>
                        <th className="text-left">Chart</th>
                        <th className="text-left">Count</th>
                    </tr>
                </thead>
                <tbody>
                    {/* {JSON.stringify(props.releases)} */}
                    {props.releases.filter(({ chart, release, chartsUrl }) => {
                        return chart.toLowerCase().includes(search.toLowerCase()) || release.toLowerCase().includes(search.toLowerCase()) || simplifyURL(chartsUrl).toLowerCase().includes(search.toLowerCase())
                    }).map(({ key, chart, release, chartsUrl, count }) => {
                        return <tr key={key}>
                            <td><a href={`/hr/${key}`}>{release}</a></td>
                            <td><a href={`/hr/${key}`}>
                                {simplifyURL(chartsUrl)+'/'+chart}
                            </a></td>
                            <td><a href={`/hr/${key}`}>{count}</a></td>
                        </tr>
                    })}
                </tbody>
            </table>
        </div>
    </label>
        ;
}