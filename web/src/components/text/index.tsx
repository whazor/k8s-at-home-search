export default function(props: { 
    children: any }) {
    return <p className="text-base dark:text-white">
        {props.children}
    </p>
}