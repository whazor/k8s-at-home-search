
import {
  Kysely,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
  DatabaseConnection,
  CompiledQuery,
  QueryResult,
  Driver,
  TransactionSettings,
  Dialect,
  DatabaseIntrospector,
  DialectAdapter,
  QueryCompiler,
  sql
} from 'kysely'

export {
    sql,
    Kysely,
}

export class SQLLiteDialect implements Dialect {
  buf: Promise<ArrayBuffer>;
  constructor(_buf: Promise<ArrayBuffer>) {
    this.buf = _buf;
  }
  createDriver(): Driver {
    return new SQLJSDriver(
      this.buf
    );
  }
  createQueryCompiler(): QueryCompiler {
    return new SqliteQueryCompiler();
  }
  createAdapter(): DialectAdapter {
    return new SqliteAdapter();
  }
  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return new SqliteIntrospector(db);
  }
}
export class SQLJSDriver implements Driver {
  connection: SQLJSConnection;
  constructor(buf: Promise<ArrayBuffer>) {
    this.connection = new SQLJSConnection(buf);
  }
  init(): Promise<void> {
    console.log('SQLJS driver initialized');
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

  resolvers: Record<number, (result: QueryResult<any>) => void> = {};
  rejecters: Record<number, (error: any) => void> = {};
  id: number = 1;

  constructor(buf: Promise<ArrayBuffer>) {
    this.worker = new Worker(import.meta.env.BASE_URL + 'worker.sql-wasm.js');
    const _this = this;
    this.worker.onmessage = (e) => {
      if (!('data' in e) || !('id' in e.data)) {
        return;
      }
      console.log(e.data)
      const id = e.data.id;
      if (!id || 
        !(id in _this.resolvers) || 
        !(id in _this.rejecters) || 
        !_this.rejecters[id] || 
        !_this.resolvers[id]) {
        throw new Error(`Unknown id: ${id}`);
      }
      if('error' in e.data) {
        _this.rejecters[id]?.(e.data.error);
      }
      if('results' in e.data) {
        if(e.data.results.length > 0) {
          const columns = e.data.results[0].columns as string[];
          const values = e.data.results[0].values;
          _this.resolvers[id]?.(
              {
                rows: values.map((row: any) => 
                  Object.fromEntries(columns.map((_, i) => [columns[i], row[i]]))
                ),
              }
          )
        } else {
          _this.resolvers[id]?.({
            rows: []
          });
        }
      } else {
        _this.resolvers[id]?.(e.data);
      }
    };
    this.opened = new Promise((resolve, reject) => {
      _this.id++;
      this.resolvers[_this.id] = (_result: QueryResult<any>) => {
        resolve();
      };
      this.rejecters[_this.id] = (error: any) => {
        reject(error);
      };
      buf.then(buffer => {
        this.worker.postMessage({
          id: _this.id,
          action:"open",
          buffer
        });
      });
      
      this.worker.onerror = (e: any) => {
        console.error(e);
        if('data' in e && 'id' in e.data) {
          const id = e.data.id;
          if('error' in e.data && id in _this.rejecters && _this.rejecters[id]) {
            _this.rejecters?.[id](e);
          }
        }
      };
    });
  }
  opened: Promise<void>;
  

  executeQuery<R>(compiledQuery: CompiledQuery): Promise<QueryResult<R>> {
    return new Promise<QueryResult<R>>((resolve, reject) => {
      const currentId = this.id++;
      console.log("query", currentId , compiledQuery.sql);

      this.resolvers[currentId] = (result: QueryResult<R>) => {
        console.log("result", currentId, result);
        resolve(result);
      }
      this.rejecters[currentId] = (error: any) => {
        reject(error);
      }
    
      this.worker.postMessage({
        id: currentId,
        action: "exec",
        sql: compiledQuery.sql,
        params: compiledQuery.parameters
      });
      
    });
  }

}
