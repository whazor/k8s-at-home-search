
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
    const trimmed = url.replace(/\/+$/, '');

    if (trimmed.startsWith('http')) {
        // remove https
        let name = trimmed.replace(/https?:\/\//, '').split('/')[0];
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

    if (
        trimmed.startsWith('oci://ghcr.io/') ||
        trimmed.startsWith('oci://quay.io/') ||
        trimmed.startsWith('oci://tccr.io/')
    ) {
        // Split by "/" and get everything after the third "/"
        const parts = trimmed.split('/');
        // parts[0] = "oci:"
        // parts[1] = "" (empty, because of the double slash)
        // parts[2] = "ghcr.io" | "quay.io" | "tccr.io"
        // parts[3] = actual name
        return parts.slice(3).join('/');
    }

    if (trimmed.startsWith('oci')) {
        // remove oci://
        let name = trimmed.split('oci://')[1];
        // get domain
        name = name.split('.').slice(0, -1).join('.');
        return name;
    }
    return trimmed;
};
