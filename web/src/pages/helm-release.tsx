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

function ValueRow(props: { name: string, count: number, types: string[], urls: string[], 
  values?: [string, any][] }) {
  const { name, count, types, urls, values } = props;
  const [show, setShow] = useState(false);
  const urlNames = 
    Object.fromEntries(urls.map(u => [u, u.split("/").slice(3, 5).join("/")]));
  const shouldDrawArray = name.endsWith("[]");
  return (
          <div className='max-w-md break-words'>
            <a className='text-blue-500 hover:text-blue-700 hover:underline cursor-pointer'
              onClick={() => setShow(!show)}
            >{name} ({count})</a>
            {show && values && 
              <Table headers={['Value', 'Repo']}
                rows={values.map(([url, value]) => [
                  <div className='max-w-md break-words'>{
                    value.map((v: any) => [
                      shouldDrawArray ? "- "+ v : v
                      , <br />]
                      )
                    
                  }</div>,
                  <div>
                    <a href={url} target="_blank"
                    className='text-blue-500 hover:text-blue-700 hover:underline cursor-pointer'
                    >
                      {urlNames[url]}
                    </a>
                  </div>
                ])} />
            }
            
          </div>
          );
}




export default function HR(props: HRProps) {
  const { name, doc, repos, icon, values: valueResult, helmRepoName, helmRepoURL } = props.pageData;
  const urlMap = valueResult.urlMap;
  const valueList = valueResult.list.map(v => ({
    ...v,
    urls: v.urls.map(u => urlMap[u])
  }));
  const valueMap = valueResult.valueMap;
  
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
          <a href={repo.url} target={'_blank'}
            className='text-blue-500 hover:text-blue-700 hover:underline cursor-pointer'
          >
           {repo.icon && <Icon icon={repo.icon} />}
           {repo.name}
         </a>,
          <a href={repo.repo_url} target={'_blank'}
            className='text-blue-500 hover:text-blue-700 hover:underline cursor-pointer'
          >{repo.repo}</a>,
          repo.stars,
          repo.chart_version,
          dayjs.unix(repo.timestamp).fromNow()
        ])} />
      {!showAll && <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-3 mb-6'
        onClick={() => setShowAll(!showAll)}
      >See all {repos.length} releases</button>}
      <Heading type='h2'>Values</Heading>
      <Text>See the most popular values for this chart:</Text>
      <Table headers={['Key', 'Types']}
        rows={valueList.map(({ name, count, types, urls }) => [
          <ValueRow {...{name, count, types, urls}}
            values={name in valueMap ? 
                Object.entries(valueMap[name]).map(([k, v]) => [urlMap[k], v])
              : []
            }
           />,
          types.join(", "),
        ])} />
    </>
  )
}