<script>
    import { resolverFondo } from "../fondos.js";
    export let lista;
    import { createEventDispatcher } from "svelte";
    import ListarEtiquetas from "./ListarEtiquetas.svelte";
    import { Icon, LockClosed } from "svelte-hero-icons";
    const dispatch = createEventDispatcher();

    const editarLista = (lista) => {
        dispatch("editarLista", lista);
    };
</script>

<div
    on:click={() => {
        editarLista(lista);
    }}
    class="relative w-full items-center overflow-hidden p-4 shadow-sm rounded-lg"
>
    <div
        style="background-image: url('{resolverFondo(
            lista.fondo
        )}'); z-index: -1; height: 100%; position: absolute; top: 0; left:0; width: 100%; opacity: 0.1;"
    />
    <h1 class="text-lg font-bold my-4 text-amber-950 fuente-titulo">
        {lista.titulo}
    </h1>
    <div class="space-y-3 mb-2">
        {#each lista.elementos as elemento, indice}
            <div class="flex items-center">
                <input
                    disabled
                    name="comments"
                    type="checkbox"
                    checked={elemento.terminado}
                    class="rounded border-gray-300 text-pink-400 focus:ring-pink-400 h-4 w-4"
                    class:invisible={lista.encriptada}
                />
                <div
                    id={"elemento_" + indice}
                    class:tachado={elemento.terminado}
                    class="flex-1 input-elemento-lista text-sm ml-2 text-amber-950"
                    class:desenfocado={lista.encriptada}
                >
                    {elemento.contenido}
                </div>
            </div>
        {/each}
    </div>
    {#if lista.encriptada}
        <Icon src={LockClosed} class="w-4 h-4 text-green-500" />
    {/if}
    <ListarEtiquetas etiquetas={lista.etiquetas} />
</div>

