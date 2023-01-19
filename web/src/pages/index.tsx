import { Link } from "react-router-dom"

export default function Home(props: {releases: {key: string, chart: string, release: string, count: number}[]}) {

    return (
      <>
        <h2 className="text-2xl">Popular releases</h2>
        {props.releases.sort((a, b) => b.count - a.count).filter(a => a.count > 5).map(({key, chart, release}) => {
          return (
            
              <a href={`/hr/${key}`} key={key} className=" cursor-pointer text-lg rounded pb-0 pt-0 px-1 m-1 mb-0 inline-block ml-0 border-1 dark:bg-gray-300">{release}</a>
            
          )
        })}
      </>
    )
  }