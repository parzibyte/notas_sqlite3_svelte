<script>
    import { Icon, Trash, Tag, ChevronLeft } from "svelte-hero-icons";
    import { afterUpdate, onMount, tick } from "svelte";
    import { debounce, milisegundosComoFecha } from "../utiles.js";
    import { fondos, resolverFondo } from "../fondos.js";
    import { push } from "svelte-spa-router";
    import DialogoConfirmacion from "./DialogoConfirmacion.svelte";
    import ListarEtiquetas from "./ListarEtiquetas.svelte";
    import { encriptacionService } from "../EncriptacionService.js";
    import DialogoSolicitarDato from "./DialogoSolicitarDato.svelte";
    import { singleton } from "./Singleton.js";
    import { NotasService } from "../NotasService.js";
    let deberiaGuardar = false;
    const MILISEGUNDOS_ESPERAR_PARA_GUARDAR_NOTA = 300;
    afterUpdate(
        debounce(async () => {
            if (deberiaGuardar && !notaEstaVacia()) {
                await guardarNota();
                deberiaGuardar = false;
            }
        }, MILISEGUNDOS_ESPERAR_PARA_GUARDAR_NOTA)
    );

    export let params;
    let estaEditando = false;
    let haTocadoElTitulo = false;
    let haTocadoElContenido = false;
    let nota = {
        titulo: "Escribe el título",
        contenido: "Contenido de la nota...",
        etiquetas: [],
    };
    let notasService = null;
    let fondo = null;
    let mostrarDialogoConfirmacion = false;
    let mostrarDialogoSolicitarContraseña = false;
    let contraseña = "";
    let errorContraseña = "";
    const notaEstaVacia = () => {
        if (haTocadoElTitulo) {
            return false;
        }
        if (nota.contenido.length > 0) {
            return false;
        }
        return true;
    };
    onMount(async () => {
        singleton.subscribe((bd) => {
            notasService = new NotasService(bd);
            if (esNotaEncriptada()) {
                mostrarDialogoSolicitarContraseña = true;
            } else {
                cargarNota();
            }
        });
    });

    const eliminarNota = async () => {
        await notasService.eliminarNota(nota.id);
        mostrarDialogoConfirmacion = false;
        volver();
    };

    const volver = () => {
        push("/");
    };

    const esNotaEncriptada = () => params.tipo === "encriptada";

    const guardarNota = async () => {
        let resultado;
        const ahora = new Date().getTime();
        nota.ultimaModificacion = ahora;
        let notaParaGuardar = Object.assign({}, nota);
        if (esNotaEncriptada()) {
            notaParaGuardar = await encriptacionService.encriptarNota(
                notaParaGuardar,
                contraseña
            );
        }
        if (estaEditando) {
            resultado = await notasService.actualizarNota(
                notaParaGuardar.titulo,
                ahora,
                esNotaEncriptada(),
                notaParaGuardar.contenido,
                notaParaGuardar.id
            );
        } else {
            resultado = await notasService.guardarNota(
                notaParaGuardar.titulo,
                ahora,
                esNotaEncriptada(),
                notaParaGuardar.contenido,
                fondo
            );
            nota.id = resultado.id;
            estaEditando = true;
        }
        console.log({ resultado });
    };
    const limpiarTituloSiEsNecesario = async () => {
        if (haTocadoElTitulo) {
            return;
        }
        nota.titulo = "";
        await tick();
        document.querySelector("#titulo").focus();
        haTocadoElTitulo = true;
    };

    const limpiarContenidoSiEsNecesario = async () => {
        if (haTocadoElContenido) {
            return;
        }
        nota.contenido = "";
        await tick();
        document.querySelector("#contenido").focus();
        haTocadoElContenido = true;
    };
    const onAlgoCambiado = () => {
        deberiaGuardar = true;
    };
    const modificarEtiquetasDeNota = () => {
        push("/etiquetas/nota/" + nota.id);
    };
    const onContraseñaIntroducida = async (evento) => {
        contraseña = evento.detail;
        try {
            await cargarNota();
            mostrarDialogoSolicitarContraseña = false;
        } catch (e) {
            errorContraseña = "Error con la contraseña " + e;
        }
    };

    const cargarNota = async () => {
        if (params.id) {
            haTocadoElTitulo = true;
            haTocadoElContenido = true;
            estaEditando = true;
            nota = await notasService.obtenerNotaPorId(params.id);
            if (nota.encriptada) {
                nota = await encriptacionService.desencriptarNota(
                    nota,
                    contraseña
                );
            }
            fondo = resolverFondo(nota.fondo);
        } else {
            fondo = fondos[Math.floor(Math.random() * fondos.length)];
            nota.ultimaModificacion = new Date().getTime();
        }
    };
</script>

{#if mostrarDialogoConfirmacion}
    <DialogoConfirmacion
        titulo="¿Eliminar nota?"
        contenido="Esto no se puede deshacer"
        mensajeConfirmar="Sí, eliminar"
        on:confirmar={eliminarNota}
        on:cancelar={() => {
            mostrarDialogoConfirmacion = false;
        }}
    />
{/if}
<DialogoSolicitarDato
    mostrar={mostrarDialogoSolicitarContraseña}
    titulo="Se requiere una contraseña"
    mensajeConfirmar="Ok"
    error={errorContraseña}
    on:confirmar={onContraseñaIntroducida}
    on:cancelar={volver}
/>

{#if fondo}
    <div
        style="background-image: url('{fondo}'); z-index: -1; height: 100%; position: absolute; top: 0; width: 100%; opacity: 0.1;"
    />
{/if}
<div class="container mx-auto px-4">
    <div class="mt-2 flex justify-between">
        <div>
            <button on:click={volver} class="w-8 h-8 text-neutral-950">
                <Icon src={ChevronLeft} outline />
            </button>
        </div>
        <div>
            <p class="text-xs text-center">
                Última modificación
                <br />
                {milisegundosComoFecha(nota.ultimaModificacion)}
            </p>
        </div>
        <div>
            {#if estaEditando}
                <button
                    on:click={modificarEtiquetasDeNota}
                    class="w-8 h-8 text-neutral-950"
                >
                    <Icon src={Tag} outline />
                </button>
                <button
                    on:click={() => {
                        mostrarDialogoConfirmacion = true;
                    }}
                    class="w-8 h-8 text-neutral-950"
                >
                    <Icon src={Trash} outline />
                </button>
            {/if}
        </div>
    </div>
    <h1
        contenteditable="true"
        class="text-4xl font-bold my-4 text-amber-950 fuente-titulo"
        bind:innerText={nota.titulo}
        id="titulo"
        on:click={limpiarTituloSiEsNecesario}
        on:input={onAlgoCambiado}
    >
        Aquí va el título
    </h1>
    <div
        class="space-y-3"
        contenteditable="true"
        id="contenido"
        on:click={limpiarContenidoSiEsNecesario}
        bind:innerText={nota.contenido}
        on:input={onAlgoCambiado}
    >
        Contenido de la nota...
    </div>

    <ListarEtiquetas etiquetas={nota.etiquetas} />
</div>

<style lang="postcss">
    [contenteditable="true"],
    [contenteditable="true"]:focus {
        border: none;
        box-shadow: none;
        outline: none;
    }
</style>
