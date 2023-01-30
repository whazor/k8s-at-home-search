export default function (props: { type: string, children: any }) {
    let textSizeClass;
    if (props.type === "h1") {
        textSizeClass = "text-3xl";
    } else if (props.type === "h2") {
        textSizeClass = "text-2xl";
    } else if (props.type === "h3") {
        textSizeClass = "text-xl";
    } else if (props.type === "h4") {
        textSizeClass = "text-lg";
    } else if (props.type === "h6") {
        textSizeClass = "text-sm";
    } else {
        textSizeClass = "text-base";
    }

    return <h1 className={`font-bold ${textSizeClass} dark:text-white`}>{props.children}</h1>;

}