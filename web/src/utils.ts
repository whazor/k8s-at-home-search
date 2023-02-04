
export function mode<K extends keyof any>(array: K[]) {
    if (array.length == 0)
        return undefined;
    let modeMap: Record<K, number> = {} as Record<K, number>;
    let maxEl = array[0], maxCount = 1;
    for (let i = 0; i < array.length; i++) {
        let el = array[i];
        if (modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;
        if (modeMap[el] > maxCount) {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}

export function modeCount<K extends keyof any>(array: K[]) {
    if (array.length == 0)
        return [undefined, 0];
    let modeMap: Record<K, number> = {} as Record<K, number>;
    let maxEl = array[0], maxCount = 1;
    for (let i = 0; i < array.length; i++) {
        let el = array[i];
        if (modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;
        if (modeMap[el] > maxCount) {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return [maxEl, maxCount];
}



export function simplifyURL(url: string) {
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