import { Link } from "react-router-dom"
import Icon from "../components/icon"
import Heading from "../components/heading";

export default function Home(props: {releases: {key: string, chart: string, release: string, count: number, icon?: string}[]}) {

    return (
      <>
        <Heading type="h2">Popular releases</Heading>
        {props.releases.sort((a, b) => b.count - a.count).filter(a => a.count > 5).map(({key, chart, icon, release}) => {
          return (
            
              <a href={`/hr/${key}`} key={key} className=" cursor-pointer text-lg rounded pb-0 pt-0 px-1 m-1 mb-0 inline-block ml-0 border-1 
              dark:text-white dark:bg-gray-800 dark:border-gray-800 hover:bg-gray-200 hover:border-gray-200 dark:hover:bg-gray-700
              ">
                {icon && <Icon icon={icon} />}{' '}
                {release}
              </a>
            
          )
        })}
      </>
    )
  }