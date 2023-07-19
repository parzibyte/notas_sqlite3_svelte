<script>
    export let etiquetas;
</script>

{#each etiquetas as etiqueta}
    <p
        class="bg-pink-400 whitespace-nowrap rounded-lg text-gray-100 font-bold uppercase text-xs p-1 ml-1 mt-1 whitespace-nowrap inline-flex"
    >
        {etiqueta.nombre}
    </p>
{/each}
