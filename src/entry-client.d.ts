import { AppData } from './App';
declare global {
    interface Window {
        __APP_DATA__: AppData;
        __PAGE_DATA__: any;
    }
}
//# sourceMappingURL=entry-client.d.ts.map