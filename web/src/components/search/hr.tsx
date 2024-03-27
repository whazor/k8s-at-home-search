import { Link, redirect } from "react-router-dom";
import { MINIMUM_COUNT, ReleaseInfo } from "../..//generators/helm-release/models";
import { simplifyURL } from "../../utils";
import Icon from "../icon";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";

interface P {
    search: string,
    releases: ReleaseInfo[]
}

export interface SearchInterface {
    onEnter: () => void
}

const SEARCH_WEIGHTS = {
    fullMatch: 10,
    length: 1,
    count: 5,
}

const HRSearchResults = forwardRef<SearchInterface, P>(function HRSearchResults({search, releases}, ref) {

    const fullHeight = "max-h-128";
    const peerFullHeight = "peer-focus:max-h-128";
    const prevSearch = useRef("");
    const prevResults = useRef<ReleaseInfo[]>(releases);
    
    const [availableSearches, unavailableSearches] = useMemo(() => {
        if (search.length < 2) {
            return [[], []];
        }
        if(!search.toLowerCase().startsWith(prevSearch.current.toLowerCase())) {
            prevResults.current = releases;
        }
        prevSearch.current = search;
        let searches;
        searches = prevResults.current = prevResults.current.filter(({ chart, release, chartsUrl }) => {
            return chart.toLowerCase().includes(search.toLowerCase()) || release.toLowerCase().includes(search.toLowerCase()) || simplifyURL(chartsUrl).toLowerCase().includes(search.toLowerCase())
        }).sort((a, b) => {
            // Calculate full match score
            const fullMatchScoreA = a.name.toLowerCase() === search ? SEARCH_WEIGHTS.fullMatch : 0;
            const fullMatchScoreB = b.name.toLowerCase() === search ? SEARCH_WEIGHTS.fullMatch : 0;
        
            // Calculate length score based on how much longer the name is compared to the query
            const lengthScoreA = (a.name.length - search.length) * SEARCH_WEIGHTS.length;
            const lengthScoreB = (b.name.length - search.length) * SEARCH_WEIGHTS.length;
        
            // Calculate count score
            const countScoreA = a.count * SEARCH_WEIGHTS.count;
            const countScoreB = b.count * SEARCH_WEIGHTS.count;
        
            // Total score for each item
            const totalScoreA = fullMatchScoreA - lengthScoreA + countScoreA;
            const totalScoreB = fullMatchScoreB - lengthScoreB + countScoreB;
        
            // Compare the total scores
            return totalScoreB - totalScoreA; // Sort in descending order of score
        });
        const availableSearches = searches.filter(({ count }) => count >= MINIMUM_COUNT);
        const unavailableSearches = searches.filter(({ count }) => count < MINIMUM_COUNT);
        return [availableSearches, unavailableSearches];
    }, [releases, search]);

    useImperativeHandle(
        ref,
        () => ({
            onEnter() {
                if(availableSearches.length >= 1) {
                    window.location.href = `/hr/${availableSearches[0].key}`;
                } else if(unavailableSearches.length >= 1) {
                    // react router go to link
                    redirect(`/hr/${unavailableSearches[0].key}`);
                }
            }
        }),
    )

    return <div className={`${search === "" ? "max-h-0" : fullHeight} overflow-hidden ease-in-out duration-300 transition-[max-height] ${peerFullHeight}`}>
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
                    <td><a href={`/hr/${key}`}><Icon icon={icon} />{release}</a></td>
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
});
export default HRSearchResults;