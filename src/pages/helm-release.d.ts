/// <reference types="react" />
import type { PageData } from '../generators/helm-release/models';
interface HRProps {
    release: string;
    url: string;
    chart: string;
    pageData?: PageData;
    keyFileMap: Record<string, number>;
}
export default function HR(props: HRProps): JSX.Element;
export {};
//# sourceMappingURL=helm-release.d.ts.map