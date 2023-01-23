export default function(props: {
    headers: any[],
    rows: any[][]
}) {
    return <table className="table-auto w-full">
        <thead className="border-b">
            <tr>
                {props.headers.map((header) => {
                    return <th
                        className="text-left px-4 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-white"
                    >{header}</th>
                }
                )}
            </tr>
        </thead>
        <tbody>
            {props.rows.map((row) => {
                return <tr>
                    {row.map((cell) => {
                        return <td className="border-t dark:border-gray-800 px-4 py-2 text-sm dark:text-white"
                        >{cell}</td>
                    }
                    )}
                </tr>
            }
            )}
        </tbody>
    </table>
}