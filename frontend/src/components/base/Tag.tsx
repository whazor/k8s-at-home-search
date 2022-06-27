import React from "react";
import { tw } from "twind";

interface TagProps {
  text: string,
}

export function Tag(props: TagProps) {
  return <div className={tw`text-xs inline-flex items-center font-bold px-1.5 mr-0.5 py-1 bg-blue-200 text-blue-700 rounded-full`}>
    {props.text}
  </div>;
}