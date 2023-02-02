import Icon from "../components/icon"

export default function Home(props: {releases: {key: string, chart: string, release: string, count: number, icon?: string}[]}) {
    return (
      <>
        <h2>Popular releases</h2>
        {props.releases.sort((a, b) => b.count - a.count).filter(a => a.count > 5).map(({key, chart, icon, release}) => {
          return (
            <a href={`/k8s-at-home-search/hr/${key}`} key={'wordcloud-' + key} className="
              text-slate-900 hover:text-slate-900 no-underline
              dark:text-gray-300 dark:hover:text-white
              cursor-pointer text-lg rounded pb-0 pt-0 px-1 m-1 mb-0 inline-block ml-0 border
              border-slate-200 hover:border-gray-200 hover:bg-gray-200 
              dark:border-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700
              ">
                {icon && <Icon icon={icon} />}{' '}
                {release}
              </a>
            
          )
        })}
      </>
    )
  }