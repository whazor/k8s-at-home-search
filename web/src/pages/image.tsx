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


export default function (props : ImagePageData & { search : string }) {
    const images = props.images;
    const search = props.search.replace(/^image /, "")
    const results = search.length > 0 ?    images.filter((i) => i.toLowerCase().includes(search.toLowerCase())) : [];

    return <div>
        {search.length > 0 && <div className="mt-4">
            <h2 className="text-2xl font-bold">Results</h2>
            <ul className="mt-4">
                {results.map((item, i) => {
                    return <li key={item + i} className="mb-1">
                        <Highlight text={item} keyword={search} />
                    </li>
                })}
                {results.length === 0 && <li className="text-gray-500">No results</li>}
            </ul>
        </div>}

    </div>
}