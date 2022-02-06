
import {
  Kysely,
  Generated,
  DummyDriver,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
  DatabaseConnection,
  CompiledQuery,
  QueryResult,
  Driver,
  TransactionSettings
} from 'kysely/dist/esm/index-nodeless.js'

export class SQLJSDriver implements Driver {
  connection: SQLJSConnection;
  constructor(buf: Promise<ArrayBuffer>) {
    this.connection = new SQLJSConnection(buf);
  }
  init(): Promise<void> {
    return this.connection.opened;
  }
  acquireConnection(): Promise<DatabaseConnection> {
    return Promise.resolve(this.connection);
  }
  beginTransaction(connection: DatabaseConnection, settings: TransactionSettings): Promise<void> {
    throw new Error('Method not implemented.');
  }
  commitTransaction(connection: DatabaseConnection): Promise<void> {
    throw new Error('Method not implemented.');
  }
  rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    throw new Error('Method not implemented.');
  }
  releaseConnection(connection: DatabaseConnection): Promise<void> {
    return Promise.resolve();
  }
  destroy(): Promise<void> {
    throw new Error('Method not implemented.');
  }

}

class SQLJSConnection implements DatabaseConnection {
  // db: Database;
  worker: Worker;

  constructor(buf: Promise<ArrayBuffer>) {
    // this.worker = new Worker("sql.js/dist/worker.sql-wasm.js");
    this.worker = new Worker(new URL('/dist/worker.sql-wasm.js', import.meta.url), { type: "module" });
    this.opened = new Promise((resolve, reject) => {
      buf.then(buffer => {
        this.worker.postMessage({
          id:1,
          action:"open",
          buffer
        });
      });
      this.worker.onmessage = () => {
        resolve();
      }
      this.worker.onerror = (e) => {
        reject(e);
      }
    });
  }
  opened: Promise<void>;
  id: number = 0;
  executeQuery<R>(compiledQuery: CompiledQuery): Promise<QueryResult<R>> {
    return new Promise<QueryResult<R>>((resolve, reject) => {
      const currentId = this.id++;
      this.worker.postMessage({
        id: currentId,
        action: "exec",
        sql: compiledQuery.sql,
        params: compiledQuery.parameters
      });
      this.worker.onmessage = (e) => {
        if (e.data.id === currentId) {
          if('error' in e.data) {
            reject(e.data.error);
          } else if(e.data.results.length > 0) {
            const columns = e.data.results[0].columns as string[];
            const values = e.data.results[0].values;
            console.log(columns, values);
            resolve(
              {
                rows: values.map((row: any) => 
                  Object.fromEntries(columns.map((_, i) => [columns[i], row[i]]))
                ),
              }
            )
          } else {
            resolve({
              rows: []
            });
          }
        }
      }
    });
  }

}