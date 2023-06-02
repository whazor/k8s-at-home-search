
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
    if (url.startsWith('http')) {
        // remove https
        let name = url.replace(/https?:\/\//, '').split('/')[0];
        // remove tld
        name = name.split('.').slice(0, -1).join('.');
        // remove charts.
        name = name.replace(/^charts\./, '');
        // remove www
        name = name.replace(/^www\./, '');
        // remove github
        name = name.replace(/\.github$/, '');
        return name;
    }
    if(url.startsWith('oci://ghcr.io/')) {
        let name = url.split('oci://ghcr.io/')[1];
        // split off before first /
        name = name.split('/')[0];
        return name;
    }
    if (url.startsWith('oci')) {
        // remove oci://
        let name = url.split('oci://')[1];
        // get domain
        name = name.split('.').slice(0, -1).join('.');
        return name;
    }
    return url;
};