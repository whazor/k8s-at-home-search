
type SortTypes = 
"alphabatical" | "version" | "number" | "date" | "size" | "cpu";

const sorters = {
    "alphabatical": (a: string, b: string) => a.localeCompare(b),
    "version": (a: string, b: string) => {
        const aSplit = a.split(".");
        const bSplit = b.split(".");
        for (let i = 0; i < Math.min(aSplit.length, bSplit.length); i++) {
            if (parseInt(aSplit[i]) > parseInt(bSplit[i])) {
                return 1;
            } else if (parseInt(aSplit[i]) < parseInt(bSplit[i])) {
                return -1;
            }
        }
        return 0;
    },
    "number": (a: string, b: string) => parseInt(a) - parseInt(b),
    "date": (a: string, b: string) => {
        const date1 = new Date(a);
        const date2 = new Date(b);
        return date1.getTime() - date2.getTime();
    },
    "size": (a: string, b: string) => {
        const suffix: Record<string, number> = {
            "K": 1000,
            "M": Math.pow(1000, 2),
            "G": Math.pow(1000, 3),
            "T": Math.pow(1000, 4),
            "P": Math.pow(1000, 5),
            "E": Math.pow(1000, 6),
            "Ki": 1024,
            "Mi": Math.pow(1024, 2),
            "Gi": Math.pow(1024, 3),
            "Ti": Math.pow(1024, 4),
            "Pi": Math.pow(1024, 5),
            "Ei": Math.pow(1024, 6)
        }
        const regex = /(\d+)([KMGTPEi]*)B?/;
        const aSplit = regex.exec(a);
        const bSplit = regex.exec(b);
        if (aSplit && bSplit) {
            const aNum = parseInt(aSplit[1]);
            const bNum = parseInt(bSplit[1]);
            const aSuffix = aSplit[2];
            const bSuffix = bSplit[2];
            if (aSuffix in suffix && bSuffix in suffix) {
                return aNum * suffix[aSuffix] - bNum * suffix[bSuffix];
            }
        }
        return a.localeCompare(b);
    },
    "cpu": (a: string, b: string) => {
        const normalize = (cpu: string) => {
            if (cpu.endsWith("m")) {
                return parseInt(cpu.slice(0, -1));
            } else {
                return (parseFloat(cpu) * 1000);
            }
        };
        return normalize(a) - normalize(b);
    }
};

function detectSort(input: string[]) {
    const versionRegex = /(\d+\.)+\d+/;
}