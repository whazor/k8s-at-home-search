import { Icon as IconifyIcon } from '@iconify/react';

export default function Icon(props: { icon?: string }) {
  const name = (!props.icon?.includes(":") ? "mdi:" : "") + props.icon;
  return (
    <span className='w-4 h-4 mr-1 align-middle -mt-1 inline-block text-base leading-none'>
      {props.icon && <IconifyIcon icon={name} className=" " />}
    </span>
  );
}
