<script>
    import { onMount } from "svelte";
    import { push } from "svelte-spa-router";
    import VistaPreviaDeLista from "./VistaPreviaDeLista.svelte";
    import Menu from "./Menu.svelte";
    import VistaPreviaDeNota from "./VistaPreviaDeNota.svelte";
    import { debounce } from "../utiles";
    import Retroalimentacion from "./Retroalimentacion.svelte";
    import { singleton } from "./Singleton.js";
    import { NotasService } from "../NotasService.js";
    let cargando = false;
    let notas = [];
    let listas = [];
    let notasYListasCombinadas = [];
    let notasService = null;
    let busqueda = "";
    onMount(async () => {
        singleton.subscribe((bd) => {
            notasService = new NotasService(bd);
            mostrarTodasLasListasYNotas();
        });
    });

    const mostrarTodasLasListasYNotas = async () => {
        listas = await notasService.obtenerListas(busqueda);
        notas = await notasService.obtenerNotas(busqueda);
        notasYListasCombinadas = listas.concat(notas);
        notasYListasCombinadas.sort((notaOLista, otraNotaOLista) => {
            return otraNotaOLista.fechaCreacion - notaOLista.fechaCreacion;
        });
        cargando = false;
    };
    const editarLista = (evento) => {
        const lista = evento.detail;
        let tipo = "normal";
        if (lista.encriptada) {
            tipo = "encriptada";
        }
        push(`/agregar-lista/${tipo}/${lista.id}`);
    };
    const editarNota = (evento) => {
        const nota = evento.detail;
        let tipo = "normal";
        if (nota.encriptada) {
            tipo = "encriptada";
        }
        push(`/agregar-nota/${tipo}/${nota.id}`);
    };

    const funcionDeBusqueda = debounce(() => {
        mostrarTodasLasListasYNotas();
    }, 500);

    const buscar = () => {
        cargando = true;
        funcionDeBusqueda();
    };
</script>

<div class="flex mx-2 mt-2">
    <div class="relative w-full">
        <input
            on:input={buscar}
            bind:value={busqueda}
            type="search"
            id="search-dropdown"
            class="rounded-l-lg block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-r-lg border-l-gray-300 border-l-2 border border-gray-300 focus:ring-pink-500 focus:border-pink-500"
            placeholder="Buscar por contenido, título y/o etiqueta"
        />
    </div>
</div>
<Retroalimentacion {cargando} {notasYListasCombinadas} {busqueda} />

<div
    class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-2"
>
    <Menu />
    {#each notasYListasCombinadas as notaOLista}
        {#if notaOLista.contenido}
            <VistaPreviaDeNota on:editarNota={editarNota} nota={notaOLista} />
        {:else}
            <VistaPreviaDeLista
                on:editarLista={editarLista}
                lista={notaOLista}
            />
        {/if}
    {/each}
</div>
