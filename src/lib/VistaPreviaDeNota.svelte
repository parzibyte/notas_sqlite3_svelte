<script>
    import { resolverFondo } from "../fondos.js";
    export let nota;
    import { createEventDispatcher } from "svelte";
    import ListarEtiquetas from "./ListarEtiquetas.svelte";
    import { Icon, LockClosed } from "svelte-hero-icons";
    const dispatch = createEventDispatcher();

    const editarNota = (nota) => {
        dispatch("editarNota", nota);
    };
</script>

<div
    on:click={() => {
        editarNota(nota);
    }}
    class="relative w-full items-center overflow-hidden p-4 shadow-sm rounded-lg"
>
    <div
        style="background-image: url('{resolverFondo(
            nota.fondo
        )}'); z-index: -1; height: 100%; position: absolute; top: 0; left:0; width: 100%; opacity: 0.1;"
    />
    <h1 class="text-lg font-bold my-4 text-amber-950 fuente-titulo">
        {nota.titulo}
    </h1>
    <div
        class:desenfocado={nota.encriptada}
        class="space-y-3 mb-2"
    >
        {nota.contenido}
    </div>
    {#if nota.encriptada}
        <Icon src={LockClosed} class="w-4 h-4 text-green-500" />
    {/if}
    <ListarEtiquetas etiquetas={nota.etiquetas} />
</div>
