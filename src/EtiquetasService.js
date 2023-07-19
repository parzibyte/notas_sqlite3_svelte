export class EtiquetasService {
    baseDeDatos = null;
    constructor(baseDeDatos) {
        this.baseDeDatos = baseDeDatos;
    }
    async quitarEtiquetaDeNota(idNota, idEtiqueta) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.baseDeDatos.exec({
                    sql: "DELETE FROM etiquetas_notas WHERE id_nota = ? AND id_etiqueta = ?",
                    bind: [idNota, idEtiqueta],
                    rowMode: "object",
                });
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }
    async agregarEtiquetaANota(idNota, idEtiqueta) {
        return new Promise(async (resolve, reject) => {
            try {
                const etiquetas = await this.baseDeDatos.exec({
                    sql: `INSERT INTO etiquetas_notas (id_nota, id_etiqueta)
                    VALUES
                    (?, ?)`,
                    bind: [idNota, idEtiqueta],
                    rowMode: "object",
                });
                resolve(etiquetas);
            } catch (error) {
                reject(error);
            }
        });
    }
    async quitarEtiquetaDeLista(idLista, idEtiqueta) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.baseDeDatos.exec({
                    sql: "DELETE FROM etiquetas_listas WHERE id_lista = ? AND id_etiqueta = ?",
                    bind: [idLista, idEtiqueta],
                    rowMode: "object",
                });
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }
    async agregarEtiquetaALista(idLista, idEtiqueta) {
        return new Promise(async (resolve, reject) => {
            try {
                const etiquetas = await this.baseDeDatos.exec({
                    sql: `INSERT INTO etiquetas_listas (id_lista, id_etiqueta)
                    VALUES
                    (?, ?)`,
                    bind: [idLista, idEtiqueta],
                    rowMode: "object",
                });
                resolve(etiquetas);
            } catch (error) {
                reject(error);
            }

        });
    }
    async obtenerEtiquetasDeNota(idNota) {
        return new Promise(async (resolve, reject) => {
            try {
                const etiquetas = await this.baseDeDatos.exec({
                    sql: `SELECT etiquetas.id, nombre FROM etiquetas 
                    INNER JOIN
                    etiquetas_notas ON etiquetas_notas.id_etiqueta = etiquetas.id 
                    WHERE etiquetas_notas.id_nota = ?`,
                    bind: [idNota],
                    rowMode: "object",
                });
                resolve(etiquetas);
            } catch (error) {
                reject(error);
            }

        });
    }

    async obtenerEtiquetasDeLista(idLista) {
        return new Promise(async (resolve, reject) => {
            try {
                const etiquetas = await this.baseDeDatos.exec({
                    sql: `SELECT etiquetas.id, nombre FROM etiquetas 
                    INNER JOIN
                    etiquetas_listas ON etiquetas_listas.id_etiqueta = etiquetas.id 
                    WHERE etiquetas_listas.id_lista = ?`,
                    bind: [idLista],
                    rowMode: "object",
                });
                resolve(etiquetas);
            } catch (error) {
                reject(error);
            }

        });
    }

    async guardarEtiqueta(nombre) {
        return new Promise(async (resolve, reject) => {
            try {
                const filasInsertadas = await this.baseDeDatos.exec({
                    sql: "INSERT INTO etiquetas(nombre) VALUES (?) RETURNING id, nombre",
                    bind: [nombre,],
                    rowMode: "object",
                    returnValue: "resultRows"
                });
                if (filasInsertadas.length <= 0) {
                    reject("Error insertando");
                }
                const etiquetaRecienInsertada = filasInsertadas[0];
                resolve(etiquetaRecienInsertada);
            } catch (error) {
                reject(error);
            }
        });
    }
    async buscarEtiquetas(busqueda) {
        return new Promise(async (resolve, reject) => {
            try {
                const etiquetas = await this.baseDeDatos.exec({
                    sql: `SELECT id, nombre FROM etiquetas WHERE nombre LIKE ?`,
                    bind: [`%${busqueda}%`],
                    rowMode: "object",
                });
                resolve(etiquetas);
            } catch (error) {
                reject(error);
            }

        });
    }
    async obtenerEtiquetas() {
        return new Promise(async (resolve, reject) => {
            try {
                const etiquetas = await this.baseDeDatos.exec({
                    sql: `SELECT id, nombre FROM etiquetas`,
                    rowMode: "object",
                });
                resolve(etiquetas);
            } catch (error) {
                reject(error);
            }

        });
    }
}