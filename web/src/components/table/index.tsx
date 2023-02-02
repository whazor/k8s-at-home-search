export default function (props: {
    headers: any[],
    rows: {
        key: string,
        data: any[]
    }[]
}) {
    return <table className="table-auto w-full">
        <thead className="border-b">
            <tr>
                {props.headers.map((header) => {
                    return <th key={header}
                        className="text-left px-4 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                    >{header}</th>
                }
                )}
            </tr>
        </thead>
        <tbody>
            {props.rows.map((row) => {
                return <tr key={row.key}>
                    {row.data.map((cell, i) => {
                        return <td key={row.key + '-' + i}
                            className="border-t dark:border-gray-800 px-4 py-2 text-sm dark:text-gray-300"
                        >{cell}</td>
                    })}
                </tr>
            }
            )}
        </tbody>
    </table>
}