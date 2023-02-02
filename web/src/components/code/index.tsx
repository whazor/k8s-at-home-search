export default function(props: {
    children: any
}) {
    return <pre className="text-base dark:text-gray-300">
        <code className="text-base dark:text-gray-300">
            {props.children}
        </code>
    </pre>;
} 