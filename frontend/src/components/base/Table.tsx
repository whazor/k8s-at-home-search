import { styled } from "@twind/react";
import React, { useState } from "react";

const TableOutside = styled("div", {
  base: "overflow-hidden overflow-x-auto border border-gray-100 rounded"
})

const TableInside = styled("table", {
  base: "min-w-full text-sm divide-y divide-gray-200"
});



const TableBodyInside = styled("tbody", {
  base: "divide-y divide-gray-100"
});

type HeadersType = readonly string[]

export type HeaderElement<T extends HeadersType> = T extends readonly (infer U)[] ? U : never;

enum SortState {
  Ascending,
  Descending,
}

export const THStyled = styled("th", {
  base: "px-4 py-2 font-medium text-left text-gray-900 whitespace-nowrap",
  variants: {
    sortable: {
      true: "cursor-pointer",
    }
  }
});

export function TH(props: React.HTMLAttributes<HTMLTableCellElement>& {
  sortable?: boolean, sortState?: SortState}) {
  const sortIcon = props.sortState === SortState.Ascending ? "↓" : props.sortState === SortState.Descending ? "↑" : "";
  return <THStyled {...props}>
    {sortIcon}
    {props.children}
  </THStyled>;
}

export function Table<
  Item, 
  Headers extends Record<string, {
    label: string,
    sort?: (a: Item, b: Item) => number;
  }>
>(props: React.HTMLAttributes<HTMLTableElement>& {
  items: Item[];
  defaultSort?: keyof Headers;
  headers: Headers;
  renderRow: (item: Item) => React.ReactNode;
}) {
  const [reverse, setReverseState] = useState(false);
  const [sort, setSortState] = useState<keyof Headers>(props.defaultSort ?? props.headers[0].key);
  const setSort = (next: keyof Headers) => {
    if(sort === next) {
      setReverseState(!reverse);
    } else {
      setSortState(next);
      setReverseState(false);
    }
  }
  const sorted = props.items.sort(props.headers[sort].sort ?? (() => 0));
  const reverseSorted = reverse ? sorted.reverse() : sorted;
  return <TableOutside>
    <TableInside {...props}>
    <THead>
        <TRHead>
          {Object.entries(props.headers).map(([key, {label}]) => 
            <TH 
              sortable={!!props.headers[key].sort} 
              key={key} sortState={sort === key ? !reverse ? SortState.Ascending : SortState.Descending : undefined}
              onClick={() => !!props.headers[key].sort && setSort(key)}>{label}</TH>)}
        </TRHead>
      </THead>
      <TableBodyInside>
        {reverseSorted.map(item => props.renderRow(item))}
      </TableBodyInside>
    </TableInside>
  </TableOutside>;
}

export function TableBody<Item>(props: React.HTMLAttributes<HTMLTableSectionElement> & {
  row: (item: Item) => React.ReactElement;
}) {
  return <TableBodyInside {...props}>

    </TableBodyInside>;
}


export const THead = styled("thead", {});

export const TRHead = styled("tr", {
  base: "bg-gray-50"
});


export const TR = styled("tr", {});

export const TD = styled("td", {
  base: "px-4 py-2 text-gray-700 whitespace-nowrap"
});