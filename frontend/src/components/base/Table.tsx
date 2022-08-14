import React, { useState } from "react";

type HeadersType = readonly string[]

export type HeaderElement<T extends HeadersType> = T extends readonly (infer U)[] ? U : never;

enum SortState {
  Ascending,
  Descending,
}

export function TH(props: React.HTMLAttributes<HTMLTableCellElement> & {
  sortable?: boolean, sortState?: SortState
}) {
  const sortIcon = props.sortState === SortState.Ascending ? "↓" : props.sortState === SortState.Descending ? "↑" : "";
  const { sortable, sortState: _2, ...thProps } = props;
  return <th className={`th ${sortable ? 'th-sortable' : ''}`} {...thProps}>
    {sortIcon}
    {props.children}
  </th >;
}

export function Table<
  Item,
  Headers extends Record<string, {
    label: string,
    sort?: (a: Item, b: Item) => number;
  }>
>(props: {
  items: Item[];
  defaultSort?: keyof Headers;
  headers: Headers;
  tableProps?: React.HTMLAttributes<HTMLTableElement>,
  renderRow: (item: Item) => React.ReactNode;
}) {
  const [reverse, setReverseState] = useState(false);
  const [sort, setSortState] = useState<keyof Headers>(props.defaultSort ?? props.headers[0].label);
  const setSort = (next: keyof Headers) => {
    if (sort === next) {
      setReverseState(!reverse);
    } else {
      setSortState(next);
      setReverseState(false);
    }
  }
  const sorted = props.items.sort(props.headers[sort].sort ?? (() => 0));
  const reverseSorted = reverse ? sorted.reverse() : sorted;
  return <div className="table-outside">
    <table {...props.tableProps} className={"table-inside " + props.tableProps?.className} >
      <thead>
        <tr className="tr-head">
          {Object.entries(props.headers).map(([key, { label }]) =>
            <TH
              sortable={!!props.headers[key].sort}
              key={key} sortState={sort === key ? !reverse ? SortState.Ascending : SortState.Descending : undefined}
              onClick={() => !!props.headers[key].sort && setSort(key)}>{label}</TH>)}
        </tr>
      </thead>
      <tbody className="table-inside">
        {reverseSorted.map(item => props.renderRow(item))}
      </tbody>
    </table>
  </div>;
}

export function TableBody<Item>(props: React.HTMLAttributes<HTMLTableSectionElement> & {
  row: (item: Item) => React.ReactElement;
}) {
  return <tbody className="table-inside" {...props} />;
}


