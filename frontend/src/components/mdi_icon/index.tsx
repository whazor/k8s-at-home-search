import React from 'react';
import { Icon } from '@iconify/react';

export function MDIIcon(props: { icon: string }) {
  return (props.icon &&
    <Icon icon={"mdi:" + props.icon} className="text-base align-middle leading-none inline-block" />
  ) || null;
}
