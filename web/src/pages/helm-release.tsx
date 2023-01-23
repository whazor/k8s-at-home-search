import Icon from '../components/icon';
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime';
import { useState } from 'react';
import Heading from '../components/heading';
import Text from '../components/text';
import Code from '../components/code';
import Table from '../components/table';
import type { PageData } from '../generators/helm-release';

dayjs.extend(relativeTime)


interface HRProps {
  release: string;
  key: string;
  chart: string;

  pageData: PageData;
}

const STAR_THRESHOLD = 30;
const MAX_REPOS = 5;

export default function HR(props: HRProps) {
  const { name, doc, repos, icon, values, helmRepoName, helmRepoURL } = props.pageData;

  const [showAll, setShowAll] = useState(false);
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
      <Heading type='h1'>{icon && <Icon icon={icon} />} {name} helm</Heading>
      <div className='mb-4 dark:text-slate-200'
        dangerouslySetInnerHTML={{
          __html: doc ||
            `No introduction found. <a href="${docUrl}" target="_blank" class="text-blue-500 hover:text-blue-700 hover:underline">Create it?</a>`
        }} />
      <Heading type='h2'>Install</Heading>
      <Text>Install with:</Text>
      <Code>
          {`helm repo add ${helmRepoName} ${helmRepoURL}
helm install ${name} ${helmRepoName}/${name} -f values.yaml`}
      </Code>
      <Heading type='h2'>
        {showAll ? 'All' : 'Top'} Repositories ({showAll ? repos.length : MAX_REPOS} out of {repos.length})
      </Heading>
      <Text>See examples from other people:</Text>
      <Table headers={['Name', 'Repo', 'Stars', 'Version', 'Timestamp']}
        rows={(!showAll ? top : repos).map(repo => [
          <a href={repo.url} target={'_blank'}>
           {repo.icon && <Icon icon={repo.icon} />}
           {repo.name}
         </a>,
          <a href={repo.repo_url} target={'_blank'}>{repo.repo}</a>,
          repo.stars,
          repo.chart_version,
          dayjs.unix(repo.timestamp).fromNow()
        ])} />
      {!showAll && <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-3 mb-6'
        onClick={() => setShowAll(!showAll)}
      >See all {repos.length} releases</button>}
      <Heading type='h2'>Values</Heading>
      <Text>See the most popular values for this chart:</Text>
      <Table headers={['Key', 'Types', "Repo's"]}
        rows={values.map(({ name, count, types }) => [
          <div className='max-w-md break-words'>
            {name} ({count})
          </div>,
          types.join(", "),
          <button className='bg-blue-300 text-white px-2 rounded dark:bg-blue-500 dark:hover:bg-blue-700'>List</button>
        ])} />
    </>
  )
}