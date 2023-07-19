<script>
    let mostrarMenu = false;
    import { link } from "svelte-spa-router";
    import { Icon, PlusCircle } from "svelte-hero-icons";
    import { fly } from "svelte/transition";
</script>

<div class="fixed right-0 bottom-0 origin-bottom-right text-right z-10">
    {#if mostrarMenu}
        <div
            class="mr-2 w0 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="menu-button"
            transition:fly
            tabindex="-1"
        >
            <div class="py-1" role="none">
                <a
                    href="/agregar-lista/normal"
                    use:link
                    class="text-gray-700 block px-4 py-2 text-sm"
                    role="menuitem"
                    tabindex="-1">Lista</a
                >

                <a
                    href="/agregar-nota/normal"
                    use:link
                    class="text-gray-700 block px-4 py-2 text-sm"
                    role="menuitem"
                    tabindex="-1">Nota</a
                >
                <a
                    href="/agregar-nota/encriptada"
                    use:link
                    class="text-gray-700 block px-4 py-2 text-sm"
                    role="menuitem"
                    tabindex="-1">Nota protegida</a
                >
                <a
                    href="/agregar-lista/encriptada"
                    use:link
                    class="text-gray-700 block px-4 py-2 text-sm"
                    role="menuitem"
                    tabindex="-1">Lista protegida</a
                >
            </div>
        </div>
    {/if}
    <button
        on:click={() => {
            mostrarMenu = !mostrarMenu;
        }}
        class="right-0 w-12 h-12 text-pink-400"
    >
        <Icon src={PlusCircle} solid />
    </button>
</div>
