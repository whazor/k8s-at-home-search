// import { addAndMultiply } from '../add'
// import { multiplyAndAdd } from '../multiply'
// import { commonModuleExport } from '../forked-deadlock/common-module'

export default function HR(props: { release: string, url: string; chart: string }) {
    //   commonModuleExport()
    
      return (
        <>
          <h1>Release: {props.release}</h1>
          {/* <div>{addAndMultiply(1, 2, 3)}</div>
          <div>{multiplyAndAdd(1, 2, 3)}</div>
          <div className="circ-dep-init">{getValueAB()}</div> */}
        </>
      )
    }