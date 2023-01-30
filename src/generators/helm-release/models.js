export function denormalize(appData) {
    return {
        releases: appData.releases.map(([release, chart, name, key, chartsUrl, count, icon]) => ({
            release,
            chart,
            name,
            key,
            chartsUrl: appData.chartURLs[chartsUrl],
            count,
            icon,
        })),
    };
}
export const MINIMUM_COUNT = 3;
//# sourceMappingURL=models.js.map