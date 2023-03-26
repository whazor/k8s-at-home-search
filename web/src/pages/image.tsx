import type { ImagePageData } from "../generators/helm-release/models"

function Highlight(props: {text: string, keyword: string}) {
    const { text, keyword } = props;
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return <>{parts.map((part, i) =>
        <span key={i} className={part.toLowerCase() === keyword.toLowerCase() ? `
            bg-yellow-400
            dark:bg-yellow-600
            dark:text-black
            text-black
        ` : ""}>
            {part}
        </span>
    )}</>;
}

function Copy({id, text}: {id: string, text: string}) {
    return <button
    className="text-sm bg-gray-200 dark:bg-gray-800 dark:text-gray-200 text-gray-800 rounded px-1 border
    border-gray-300 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-700"
    id={"copy-button-" + id}
    onClick={() => {
        navigator.clipboard.writeText(text);
        // animate
        const el = document.getElementById("copy-button-" + id);
        if (el) {
            el.classList.add("bg-green-400");
            el.classList.remove("hover:bg-gray-300")
            setTimeout(() => {
                el.classList.remove("bg-green-400");
                el.classList.add("hover:bg-gray-300")
            }, 1000);
        }
    }}
>Copy</button>
}

// we sort by version, but we need to ensure non version parts are sorted correctly
function TagSorter(a: string, b: string) {
    const aParts = a.split(".");
    const bParts = b.split(".");

    // if the first part is not a number, sort by string
    if (isNaN(parseInt(aParts[0])) || isNaN(parseInt(bParts[0]))) {
        return a.localeCompare(b);
    }

    // if the first part is a number, sort by number
    for (let i = 0; i < aParts.length; i++) {
        const aPart = parseInt(aParts[i]);
        const bPart = parseInt(bParts[i]);
        // check if not number
        if (isNaN(aPart) || isNaN(bPart)) {
            return a.localeCompare(b);
        }

        if (aPart > bPart) {
            return -1;
        } else if (aPart < bPart) {
            return 1;
        }
    }

    return 0;
}

export default function (props : ImagePageData & { search : string }) {
    // repository -> tag -> url[]
    const images: Record<string, Record<string, string[]>> = props.images;
    const search = props.search.replace(/^image /, "")

    const results = search.length > 0 ? 
        Object.keys(images).filter((repo) => repo.includes(search)) : [];
    
    const urlName = (url: string) => {
        // https://github.com/solidDoWant/infra-mk2/blob/main/cluster/apps/media/sonarr/helm-release.yaml
        // extract solidDoWant
        const parts = url.split("/");
        return parts[3];
    }

    return <div>
        {search.length > 0 && <div className="mt-4">
            <h2 className="text-2xl font-bold">Results</h2>
            <ul className="mt-4">
                {/* {results.map((item, i) => {
                    return <li key={item + i} className="mb-1">
                        <Highlight text={item} keyword={search} />
                    </li>
                })} */}
                {results.map((repo, i) => {
                    return <li key={repo + i} className="mb-1">
                        <Highlight text={repo} keyword={search} />  <Copy id={repo+i} text={repo} />
                        <ul className="ml-4">
                            {Object.keys(images[repo]).sort(
                                // (a, b) => images[repo][b].length - images[repo][a].length
                                TagSorter
                            ).map((tag, j) => {
                                return <li key={tag + j} className="mb-1">
                                    <code>{tag}</code> <Copy id={tag+i} text={tag} /> ({images[repo][tag].length})
                                    <br />
                                        {images[repo][tag].map((url, i) => {
                                            return <a href={url} key={url + i} className="text-blue-500 ml-2" target="_blank">
                                                {urlName(url)}
                                            </a>
                                        })}
                                </li>
                            })}
                        </ul>
                    </li>
                })}
                {results.length === 0 && <li className="text-gray-500">No results</li>}
            </ul>
        </div>}

    </div>
}