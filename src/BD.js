import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import * as Comlink from "comlink"
const NOMBRE_BASE_DE_DATOS = "notas.sqlite3";
const log = (...args) => { console.log(...args) };
const error = (...args) => { console.log(...args) };
class EnvolturaDeBaseDeDatos {
    db = null;
    async iniciar() {
        const sqlite3 = await sqlite3InitModule({
            print: log,
            printErr: error,
        });
        if ('opfs' in sqlite3) {
            this.db = new sqlite3.oo1.OpfsDb(NOMBRE_BASE_DE_DATOS);
            log('OPFS is available, created persisted database at', this.db.filename);
        } else {
            this.db = new sqlite3.oo1.DB(NOMBRE_BASE_DE_DATOS, 'ct');
            log('OPFS is not available, created transient database', this.db.filename);
        }
        this.db.exec(`CREATE TABLE IF NOT EXISTS listas(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    fechaCreacion INTEGER NOT NULL,
    ultimaModificacion INTEGER NOT NULL,
    encriptada INTEGER NOT NULL DEFAULT 0
  );`);
        this.db.exec(`CREATE TABLE IF NOT EXISTS elementos_listas(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_lista INTEGER,
    contenido TEXT NOT NULL,
    terminado INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (id_lista) REFERENCES listas(id) ON DELETE CASCADE ON UPDATE CASCADE
  );`);
        this.db.exec(`CREATE TABLE IF NOT EXISTS fondos_listas(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_lista INTEGER,
    nombre TEXT NOT NULL,
    FOREIGN KEY (id_lista) REFERENCES listas(id) ON DELETE CASCADE ON UPDATE CASCADE
  );`);
        this.db.exec(`CREATE TABLE IF NOT EXISTS etiquetas(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
  );`);
        this.db.exec(`CREATE TABLE IF NOT EXISTS etiquetas_listas(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_lista INTEGER,
    id_etiqueta INTEGER,
    FOREIGN KEY (id_lista) REFERENCES listas(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_etiqueta) REFERENCES etiquetas(id) ON DELETE CASCADE ON UPDATE CASCADE
  );`);
        this.db.exec(`CREATE TABLE IF NOT EXISTS notas(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    fechaCreacion INTEGER NOT NULL,
    ultimaModificacion INTEGER NOT NULL,
    encriptada INTEGER NOT NULL DEFAULT 0
  );`);
        this.db.exec(`CREATE TABLE IF NOT EXISTS fondos_notas(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_nota INTEGER,
    nombre TEXT NOT NULL,
    FOREIGN KEY (id_nota) REFERENCES notas(id) ON DELETE CASCADE ON UPDATE CASCADE
  );`);
        this.db.exec(`CREATE TABLE IF NOT EXISTS etiquetas_notas(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_nota INTEGER,
    id_etiqueta INTEGER,
    FOREIGN KEY (id_nota) REFERENCES notas(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_etiqueta) REFERENCES etiquetas(id) ON DELETE CASCADE ON UPDATE CASCADE
  );`);
        this.exponerFuncionesDeDB();
    }

    constructor() {
    }
    exponerFuncionesDeDB() {
        for (const key in this.db) {
            if (typeof this.db[key] === 'function') {
                this[key] = this.db[key].bind(this.db);
            }
        }
    }
}
Comlink.expose(EnvolturaDeBaseDeDatos);