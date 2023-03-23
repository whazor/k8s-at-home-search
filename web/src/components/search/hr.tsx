import { Link, redirect } from "react-router-dom";
import { MINIMUM_COUNT, ReleaseInfo } from "../..//generators/helm-release/models";
import { simplifyURL } from "../../utils";
import Icon from "../icon";
import { forwardRef, useImperativeHandle } from "react";

interface P {
    search: string,
    releases: ReleaseInfo[]
}

export interface SearchInterface {
    onEnter: () => void
}

const HRSearchResults = forwardRef<SearchInterface, P>(function HRSearchResults({search, releases}, ref) {

    const fullHeight = "max-h-128";
    const peerFullHeight = "peer-focus:max-h-128";

    
    const searches = releases
        .filter(_ => search.length > 1)
        .filter(({ chart, release, chartsUrl }) => {
        return chart.toLowerCase().includes(search.toLowerCase()) || release.toLowerCase().includes(search.toLowerCase()) || simplifyURL(chartsUrl).toLowerCase().includes(search.toLowerCase())
    });
    const availableSearches = searches.filter(({ count }) => count >= MINIMUM_COUNT);
    const unavailableSearches = searches.filter(({ count }) => count < MINIMUM_COUNT);

    useImperativeHandle(
        ref,
        () => ({
            onEnter() {
                if(availableSearches.length >= 1) {
                    window.location.href = `/k8s-at-home-search/hr/${availableSearches[0].key}`;
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
});
export default HRSearchResults;