export default function(props: {
    children: any
}) {
    return <pre className="text-base dark:text-white">
        <code className="text-base dark:text-white">
            {props.children}
        </code>
    </pre>;
} 