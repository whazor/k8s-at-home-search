import { useCallback, useEffect, useState } from "react";
import { MINIMUM_COUNT, ReleaseInfo } from "../../generators/helm-release/models";
import { Link, redirect, useLocation } from "react-router-dom";
import { simplifyURL } from "../../utils";
import Icon from "../icon";

export function SearchBar(props: { releases: ReleaseInfo[], search: string, setSearch: (s: string) => void}) {
    const {search, setSearch} = props;
    let location = useLocation();
    useEffect(() => {
        console.log(location.pathname);
        if(location.pathname !== "/k8s-at-home-search/" && location.pathname !== "/") {
            setSearch('');
        }
    }, [location.pathname])
    
    const fullHeight = "max-h-128";
    const peerFullHeight = "peer-focus:max-h-128";
    const searches = props.releases
        .filter(_ => search.length > 1)
        .filter(({ chart, release, chartsUrl }) => {
        return chart.toLowerCase().includes(search.toLowerCase()) || release.toLowerCase().includes(search.toLowerCase()) || simplifyURL(chartsUrl).toLowerCase().includes(search.toLowerCase())
    });
    const availableSearches = searches.filter(({ count }) => count >= MINIMUM_COUNT);
    const unavailableSearches = searches.filter(({ count }) => count < MINIMUM_COUNT);
    const keyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if(e.key === "Escape") {
            setSearch("");
        }
        if(e.key === "Enter") {
            console.log(availableSearches, unavailableSearches)
            if(availableSearches.length >= 1) {
                window.location.href = `/k8s-at-home-search/hr/${availableSearches[0].key}`;
            } else if(unavailableSearches.length >= 1) {
                // react router go to link
                redirect(`/hr/${unavailableSearches[0].key}`);
            }
        }
    }, [availableSearches, unavailableSearches, setSearch]);
    return <label>
        <span className='sr-only dark:text-gray-300'>Search for a chart:</span>
        <input
            autoFocus
            className='peer bg-slate-50 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 dark:bg-black dark:text-gray-300 dark:border-gray-700 dark:focus:bg-gray-800 dark:focus:border-blue-500'
            type="text"
            placeholder="Search for a chart..."
            value={search}
            onKeyDown={keyDown}
            onChange={(e) => {
                setSearch(e.target.value)
            }}
        />
        <div className={`${search === "" ? "max-h-0" : fullHeight} overflow-hidden ease-in-out duration-300 transition-[max-height] ${peerFullHeight}`}>
            {search !== "" && search.length > 1 &&
                <table className="w-full m-2 dark:text-gray-300">
                <thead>
                    <tr>
                        <th className="text-left">Release</th>
                        <th className="text-left">Chart</th>
                        <th className="text-left">Count</th>
                    </tr>
                </thead>
                <tbody>
                    {availableSearches.map(({ key, icon, chart, release, chartsUrl, count }) => {
                        return <tr key={'hr-release'+key}>
                            <td><a href={`/k8s-at-home-search/hr/${key}`}><Icon icon={icon} />{release}</a></td>
                            <td>{simplifyURL(chartsUrl) + '/' + chart}</td>
                            <td>{count}</td>
                        </tr>
                    })}
                    {unavailableSearches.map(({ key, icon, chart, release, chartsUrl, count }) => {
                        return <tr key={'hr-release'+key}>
                            <td><Link to={`/hr/${key}`}><Icon icon={icon} />{release}</Link></td>
                            <td>{simplifyURL(chartsUrl) + '/' + chart}</td>
                            <td>{count}</td>
                        </tr>
                    })}
                </tbody>
            </table>
        }
        </div>
    </label>
        ;
}