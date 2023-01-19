import React from 'react';
import { Icon as IconifyIcon } from '@iconify/react';

export default function Icon(props: { icon: string }) {
  const name = (!props.icon.includes(":") ? "mdi:" : "") + props.icon;
  return (props.icon &&
    <IconifyIcon icon={name} className="text-base align-middle leading-none inline-block" />
  ) || null;
}
