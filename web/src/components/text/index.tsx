export default function(props: { 
    children: any }) {
    return <p className="text-base dark:text-gray-300">
        {props.children}
    </p>
}