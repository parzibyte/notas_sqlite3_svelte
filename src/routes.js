import Home from './lib/Home.svelte'
import AgregarLista from './lib/AgregarLista.svelte'
import AgregarNota from './lib/AgregarNota.svelte'
import ModificarEtiquetas from './lib/ModificarEtiquetas.svelte'

export const routes = {
    // Exact path
    "/": Home,
    "/agregar-lista/:tipo/:id?": AgregarLista,
    "/etiquetas/:tipo/:id": ModificarEtiquetas,
    "/agregar-nota/:tipo/:id?": AgregarNota,
}