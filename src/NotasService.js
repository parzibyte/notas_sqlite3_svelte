import { encriptacionService } from "./EncriptacionService.js"
export class NotasService {
   baseDeDatos = null;
   constructor(baseDeDatos) {
      this.baseDeDatos = baseDeDatos;
   }
   async actualizarElementoDeLista(id, contenido, terminado, encriptado = false, contraseña = "") {
      return new Promise(async (resolve, reject) => {
         try {
            if (encriptado) {
               contenido = await encriptacionService.encriptar(contraseña, contenido);
            }
            await this.baseDeDatos.exec({
               sql: "UPDATE elementos_listas SET contenido = ?, terminado = ? WHERE id = ?",
               bind: [contenido, terminado, id],
               returnValue: "resultRows",
               rowMode: "object",
            });
            resolve(true);
         } catch (error) {
            reject(error);
         }
      });
   }
   async agregarElementoDeLista(idLista) {
      return new Promise(async (resolve, reject) => {
         try {
            const filasInsertadas = await this.baseDeDatos.exec({
               sql: "INSERT INTO elementos_listas(id_lista, contenido) VALUES (?, ?) RETURNING *",
               bind: [idLista, ""],
               returnValue: "resultRows",
               rowMode: "object",
            });
            if (filasInsertadas.length <= 0) {
               return;
            }
            const elementoRecienInsertado = filasInsertadas[0];
            resolve(elementoRecienInsertado);
         } catch (error) {
            reject(error);
         }
      });
   }
   async encriptarNota(nota, contraseña) {
      return new Promise(async (resolve, reject) => {
         try {
            nota.contenido = await encriptacionService.encriptar(contraseña, nota.contenido);
            resolve(nota);
         } catch (error) {
            reject(error);
         }
      });
   }
   async desencriptarNota(nota, contraseña) {
      return new Promise(async (resolve, reject) => {
         try {
            nota.contenido = await encriptacionService.desencriptar(contraseña, nota.contenido);
            resolve(nota);
         } catch (error) {
            reject(error);
         }
      });
   }
   async eliminarNota(id) {
      return new Promise(async (resolve, reject) => {
         try {
            await this.baseDeDatos.exec({
               sql: "DELETE FROM notas WHERE id = ?",
               bind: [id]
            });
            resolve(true);
         } catch (error) {
            reject(error);
         }
      });
   }
   async eliminarElementoDeLista(id) {
      return new Promise(async (resolve, reject) => {
         try {
            await this.baseDeDatos.exec({
               sql: "DELETE FROM elementos_listas WHERE id = ?",
               bind: [id]
            });
            resolve(true);
         } catch (error) {
            reject(error);
         }
      });
   }
   async obtenerNotaPorId(id) {
      return new Promise(async (resolve, reject) => {
         try {
            const notas = await this.baseDeDatos.exec({
               sql: `SELECT notas.id, notas.titulo, notas.ultimaModificacion, notas.fechaCreacion, notas.contenido, notas.encriptada,
               fondos_notas.nombre AS fondo,
               (
                  SELECT json_group_array(json_object('id', etiquetas.id, 'nombre', etiquetas.nombre))
                  FROM etiquetas
                  INNER JOIN etiquetas_notas
                  ON etiquetas.id = etiquetas_notas.id_etiqueta
                  WHERE etiquetas_notas.id_nota = notas.id
                  ORDER BY etiquetas_notas.id
               ) AS etiquetas
               FROM notas
               INNER JOIN fondos_notas ON fondos_notas.id_nota = notas.id
               WHERE notas.id = ?
               ORDER BY notas.id DESC
               LIMIT 1`,
               bind: [id],
               rowMode: "object",
            });
            if (notas.length <= 0) {
               reject(new Error("No hay registros con ese id"));
            }
            const notasConEtiquetasDecodificadas = notas.map(nota => {
               nota.etiquetas = JSON.parse(nota.etiquetas);
               return nota;
            });
            resolve(notasConEtiquetasDecodificadas[0]);
         } catch (error) {
            reject(error);
         }

      });
   }
   async obtenerNotas(busqueda = "") {
      return new Promise(async (resolve, reject) => {
         try {
            let filtro = "";
            let parametros = [];
            if (busqueda) {
               parametros = [`%${busqueda}%`, `%${busqueda}%`, `%${busqueda}%`];
               filtro = ` WHERE
    notas.titulo LIKE ?
    OR (
        NOT notas.encriptada
        AND notas.contenido LIKE ?
    )
    OR notas.id IN (
        SELECT
            id_nota
        FROM
            etiquetas_notas
            INNER JOIN etiquetas ON etiquetas.id = etiquetas_notas.id_etiqueta
        WHERE
            etiquetas.nombre LIKE ?
    ) `;
            }
            const notas = await this.baseDeDatos.exec({
               sql: `SELECT notas.id, notas.titulo, notas.ultimaModificacion, notas.fechaCreacion, notas.contenido, notas.encriptada,
               fondos_notas.nombre AS fondo,
               (
                  SELECT json_group_array(json_object('id', etiquetas.id, 'nombre', etiquetas.nombre))
                  FROM etiquetas
                  INNER JOIN etiquetas_notas
                  ON etiquetas.id = etiquetas_notas.id_etiqueta
                  WHERE etiquetas_notas.id_nota = notas.id
                  ORDER BY etiquetas_notas.id
               ) AS etiquetas
               FROM notas
               INNER JOIN fondos_notas ON fondos_notas.id_nota = notas.id
               ${filtro}
               ORDER BY notas.id DESC;`,
               rowMode: "object",
               bind: parametros,
            });
            resolve(notas.map(nota => {
               nota.etiquetas = JSON.parse(nota.etiquetas);
               return nota;
            }));
         } catch (error) {
            reject(error);
         }

      });
   }
   async actualizarNota(titulo, ultimaModificacion, encriptada, contenido, id) {
      return new Promise(async (resolve, reject) => {
         try {
            await this.baseDeDatos.exec({
               sql: "UPDATE notas SET titulo = ?, ultimaModificacion = ?, encriptada = ?, contenido = ? WHERE id = ?",
               bind: [titulo, ultimaModificacion, encriptada, contenido, id],
               returnValue: "resultRows",
               rowMode: "object",
            });
            resolve(true);
         } catch (error) {
            reject(error);
         }
      });
   }
   async obtenerListaPorId(id) {
      return new Promise(async (resolve, reject) => {
         try {
            const listas = await this.baseDeDatos.exec({
               sql: `SELECT l.id, l.titulo, l.ultimaModificacion, l.fechaCreacion, l.encriptada,fondos_listas.nombre AS fondo,
       (
           SELECT json_group_array(json_object('id', el.id, 'contenido', el.contenido, 'terminado', el.terminado))
           FROM elementos_listas el
           WHERE el.id_lista = l.id
           ORDER BY el.id
       ) AS elementos,
(
           SELECT json_group_array(json_object('id', etiquetas.id, 'nombre', etiquetas.nombre))
           FROM etiquetas
           INNER JOIN etiquetas_listas
           ON etiquetas.id = etiquetas_listas.id_etiqueta
           WHERE etiquetas_listas.id_lista = l.id
           ORDER BY etiquetas_listas.id
       ) AS etiquetas
FROM listas l
INNER JOIN fondos_listas ON fondos_listas.id_lista = l.id
WHERE l.id = ?
LIMIT 1; `,
               bind: [id],
               rowMode: "object",
            });
            if (listas.length <= 0) {
               reject(new Error("No hay lista con ese ID"));
               return;
            }
            resolve(listas.map(lista => {
               lista.elementos = JSON.parse(lista.elementos);
               lista.etiquetas = JSON.parse(lista.etiquetas);
               return lista;
            })[0]);
         } catch (error) {
            reject(error);
         }

      });
   }
   async obtenerListas(busqueda = "") {
      return new Promise(async (resolve, reject) => {
         try {
            let filtro = "";
            let parametros = [];
            if (busqueda) {
               parametros = [`%${busqueda}%`, `%${busqueda}%`, `%${busqueda}%`];
               filtro = ` WHERE
    l.titulo LIKE ?
    OR (
        NOT l.encriptada
        AND l.id IN (
            SELECT
                id_lista
            FROM
                elementos_listas
            WHERE
                elementos_listas.contenido LIKE ?
        )
    )
    OR l.id IN (
        SELECT
            id_lista
        FROM
            etiquetas_listas
            INNER JOIN etiquetas ON etiquetas.id = etiquetas_listas.id_etiqueta
        WHERE
            etiquetas.nombre LIKE ?
    ) `;

            }
            const listasConElementos = await this.baseDeDatos.exec({
               sql: `SELECT l.id, l.titulo, l.ultimaModificacion, l.fechaCreacion, l.encriptada,fondos_listas.nombre AS fondo,
       (
           SELECT json_group_array(json_object('id', el.id, 'contenido', el.contenido, 'terminado', el.terminado))
           FROM elementos_listas el
           WHERE el.id_lista = l.id
           ORDER BY el.id
       ) AS elementos,
      (
           SELECT json_group_array(json_object('id', etiquetas.id, 'nombre', etiquetas.nombre))
           FROM etiquetas
           INNER JOIN etiquetas_listas
           ON etiquetas.id = etiquetas_listas.id_etiqueta
           WHERE etiquetas_listas.id_lista = l.id
           ORDER BY etiquetas_listas.id
       ) AS etiquetas
FROM listas l
INNER JOIN fondos_listas ON fondos_listas.id_lista = l.id
${filtro}
ORDER BY l.id DESC;`,
               rowMode: "object",
               bind: parametros,
            });
            resolve(listasConElementos.map(listaConElementos => {
               listaConElementos.elementos = JSON.parse(listaConElementos.elementos);
               listaConElementos.etiquetas = JSON.parse(listaConElementos.etiquetas);
               return listaConElementos;
            }));
         } catch (error) {
            reject(error);
         }

      });
   }

   async guardarNota(titulo, ultimaModificacion, encriptada, contenido, fondo) {
      return new Promise(async (resolve, reject) => {
         try {
            const filasInsertadas = await this.baseDeDatos.exec({
               sql: "INSERT INTO notas(titulo,ultimaModificacion,fechaCreacion, encriptada, contenido) VALUES (?, ?, ?, ?, ?) RETURNING id",
               bind: [titulo, ultimaModificacion, new Date().getTime(), encriptada, contenido],
               returnValue: "resultRows",
               rowMode: "object",
            });
            if (filasInsertadas.length <= 0) {
               return;
            }
            const notaRecienInsertada = filasInsertadas[0];
            await this.baseDeDatos.exec({
               sql: "INSERT INTO fondos_notas(id_nota, nombre) VALUES (?, ?)",
               bind: [notaRecienInsertada.id, fondo],
            });
            resolve(notaRecienInsertada);

         } catch (error) {
            reject(error);
         }
      });
   }
   async guardarLista(titulo, ultimaModificacion, encriptada, fondo) {
      return new Promise(async (resolve, reject) => {
         try {
            const filasInsertadas = await this.baseDeDatos.exec({
               sql: "INSERT INTO listas(titulo,ultimaModificacion, fechaCreacion,encriptada) VALUES (?, ?, ?, ?) RETURNING id",
               bind: [titulo, ultimaModificacion, new Date().getTime(), encriptada],
               returnValue: "resultRows",
               rowMode: "object",
            });
            if (filasInsertadas.length <= 0) {
               return;
            }
            const listaRecienInsertada = filasInsertadas[0];
            await this.baseDeDatos.exec({
               sql: "INSERT INTO fondos_listas(id_lista, nombre) VALUES (?, ?)",
               bind: [listaRecienInsertada.id, fondo],
            });
            resolve(listaRecienInsertada);
         } catch (error) {
            reject(error);
         }
      });
   }
   async actualizarLista(titulo, ultimaModificacion, id) {
      return new Promise(async (resolve, reject) => {
         try {
            await this.baseDeDatos.exec({
               sql: `UPDATE listas SET 
                  titulo = ?,
                  ultimaModificacion = ?
                  WHERE id = ?`,
               bind: [titulo, ultimaModificacion, id],
            });
            resolve(true);
         } catch (error) {
            reject(error);
         }
      });
   }
   async eliminarLista(id) {
      return new Promise(async (resolve, reject) => {
         try {
            await this.baseDeDatos.exec({
               sql: "DELETE FROM listas WHERE id = ?",
               bind: [id]
            });
            resolve(true);
         } catch (error) {
            reject(error);
         }
      });
   }
};

