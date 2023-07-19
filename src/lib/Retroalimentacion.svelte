<script>
    import {
        CircleStack,
        Cog8Tooth,
        ExclamationCircle,
        Icon,
        MagnifyingGlass,
        PlusCircle,
    } from "svelte-hero-icons";

    export let notasYListasCombinadas = [],
        busqueda = "",
        cargando = false;
</script>

{#if notasYListasCombinadas.length <= 0 || cargando}
    <div
        class="rounded-lg flex flex-col mx-2 mt-2 bg-pink-100 text-pink-400 text-3xl p-2"
    >
        <div>
            {#if cargando}
                <div class="place-content-center flex">
                    <Icon src={Cog8Tooth} class="animate-spin w-10 h-10" />
                </div>
            {/if}
            {#if notasYListasCombinadas.length <= 0}
                {#if busqueda && !cargando}
                    <p class="text-center">
                        Sin resultados. Intenta usando otro término de búsqueda
                    </p>
                    <div class="place-content-center flex">
                        <Icon class="w-10 h-10" solid src={ExclamationCircle} />
                    </div>
                {:else if !cargando}
                    <p class="text-center">
                        Qué vacío. Agrega una nota o lista con el botón
                    </p>
                    <div class="place-content-center flex">
                        <Icon class="w-10 h-10" solid src={PlusCircle} />
                    </div>
                {/if}
            {/if}
        </div>
    </div>
{/if}
