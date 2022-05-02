import { Icon } from '@iconify/react';

import { tw } from 'twind'
export function MDIIcon(props: {icon: string}) {
    return (props.icon && 
      <Icon icon={"mdi:"+props.icon} className={tw`text-base leading-none inline-block`} />
    ) 
    || null;
}