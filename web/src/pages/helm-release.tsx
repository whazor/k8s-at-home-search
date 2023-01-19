import Icon from '../components/icon';
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useEffect, useState } from 'react';

dayjs.extend(relativeTime)

interface HRPageData {
  key: string;
  name: string;
  doc?: string;
  repos: {
    name: string,
    repo: string,
    url: string,
    repo_url: string,
    stars: number,
    icon: string,
    timestamp: number,
  }[];
}
interface HRProps {
  release: string;
  key: string;
  chart: string;
  pageData: any;
}

const STAR_THRESHOLD = 30;
const MAX_REPOS = 5;

export default function HR(props: HRProps) {
  const { name, doc, repos } = props.pageData as HRPageData;

  const docUrl = `https://github.com/whazor/k8s-at-home-search/new/main/?filename=web/src/info/${name}.md`;

  // const doc = await import(`../info/${name}.html`);
  const needsFilter = repos.filter(rel => rel.stars > STAR_THRESHOLD).length > MAX_REPOS;

  // sort by timestamp
  const top = repos
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter(rel => rel.stars > STAR_THRESHOLD || !needsFilter)
    .slice(0, MAX_REPOS);
  return (
    <>
      <h1 className='text-lg font-bold'>{name} helm</h1>
      <div dangerouslySetInnerHTML={{
        __html: doc ||
          `No doc found. <a href="${docUrl}">Create it?</a>`
      }} />
      <h2>Top Repositories (5 out of {repos.length})</h2>
      <p>See examples from other people</p>
      <table>
        <thead className='border-b'>
          <tr>
            <th>Name</th>
            <th>Repo</th>
            <th>Stars</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {top.map((repo) => {
            return (
              <tr key={repo.repo}>
                <td><a href={repo.url} target={"_blank"}>
                  {repo.icon && <Icon icon={repo.icon} />}
                  {repo.name}
                </a></td>
                <td><a href={repo.repo_url} target={"_blank"}>{repo.repo}</a></td>
                <td>{repo.stars}</td>
                <td>{dayjs.unix(repo.timestamp).fromNow()}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <button>See all</button>
      <h3>Values</h3>

    </>
  )
}