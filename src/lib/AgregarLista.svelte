<script>
    import {
        Icon,
        PlusCircle,
        Trash,
        Tag,
        ChevronLeft,
        XCircle,
    } from "svelte-hero-icons";
    import { afterUpdate, onMount, tick } from "svelte";
    import { debounce, milisegundosComoFecha } from "../utiles.js";
    import { fondos, resolverFondo } from "../fondos.js";
    import { imagenesAnimadas } from "../imagenesAnimadas.js";
    import { push } from "svelte-spa-router";
    import DialogoConfirmacion from "./DialogoConfirmacion.svelte";
    import ListarEtiquetas from "./ListarEtiquetas.svelte";
    import { slide } from "svelte/transition";
    import { encriptacionService } from "../EncriptacionService.js";
    import DialogoSolicitarDato from "./DialogoSolicitarDato.svelte";
    import { singleton } from "./Singleton.js";
    import { NotasService } from "../NotasService.js";
    let deberiaGuardar = false;
    let contraseña = "";
    const MILISEGUNDOS_ESPERAR_PARA_GUARDAR_LISTA = 300;
    afterUpdate(
        debounce(async () => {
            if (deberiaGuardar && !listaEstaVacia()) {
                await guardarLista();
                deberiaGuardar = false;
            }
        }, MILISEGUNDOS_ESPERAR_PARA_GUARDAR_LISTA)
    );

    export let params;
    let errorContraseña = "";
    let estaEditando = false;
    let haTocadoElTitulo = false;
    let lista = {
        titulo: "Escribe el título",
        elementos: [],
        etiquetas: [],
    };
    let notasService = null;
    let fondo = null;
    let imagen = null;
    const claseAnimar = "animar";
    let idTimeout = null;
    let mostrarDialogoConfirmacion = false;
    let mostrarDialogoSolicitarContraseña = false;
    let indiceElementoEnfocado = -1;
    const milisegundosMostrarImagen = 300;
    const listaEstaVacia = () => {
        if (haTocadoElTitulo) {
            return false;
        }
        if (
            lista.elementos.length >= 1 &&
            lista.elementos[lista.elementos.length - 1].contenido
        ) {
            return false;
        }
        return true;
    };
    onMount(async () => {
        singleton.subscribe((bd) => {
            notasService = new NotasService(bd);
            if (esListaEncriptada()) {
                mostrarDialogoSolicitarContraseña = true;
            } else {
                cargarLista();
            }
        });
        imagen = new Image(100, 100);
        imagen.src =
            imagenesAnimadas[
                Math.floor(Math.random() * imagenesAnimadas.length)
            ];
        Object.assign(imagen.style, {
            position: "absolute",
            display: "none",
            pointerEvents: "none",
            userSelect: "none",
        });
        imagen.onload = () => {
            document.body.appendChild(imagen);
        };
    });

    const eliminarLista = async () => {
        await notasService.eliminarLista(lista.id);
        mostrarDialogoConfirmacion = false;
        volver();
    };

    const esListaEncriptada = () => params.tipo === "encriptada";

    const cargarLista = async () => {
        if (params.id) {
            haTocadoElTitulo = true;
            estaEditando = true;
            lista = await notasService.obtenerListaPorId(params.id);
            if (lista.encriptada) {
                lista = await encriptacionService.desencriptarLista(
                    lista,
                    contraseña
                );
            }
            fondo = resolverFondo(lista.fondo);
        } else {
            fondo = fondos[Math.floor(Math.random() * fondos.length)];
            agregarElementoALista();
            lista.ultimaModificacion = new Date().getTime();
        }
    };

    const volver = () => {
        push("/");
    };

    const guardarLista = async () => {
        let resultado;
        const ahora = new Date().getTime();
        lista.ultimaModificacion = ahora;
        let listaParaGuardar = structuredClone(lista);
        if (esListaEncriptada()) {
            listaParaGuardar = await encriptacionService.encriptarLista(
                listaParaGuardar,
                contraseña
            );
        }
        if (estaEditando) {
            resultado = await notasService.actualizarLista(
                listaParaGuardar.titulo,
                ahora,
                esListaEncriptada(),
                listaParaGuardar.elementos,
                fondo,
                listaParaGuardar.id
            );
        } else {
            resultado = await notasService.guardarLista(
                listaParaGuardar.titulo,
                ahora,
                esListaEncriptada(),
                listaParaGuardar.elementos,
                fondo
            );
            lista.id = resultado.id;
            estaEditando = true;
        }
    };
    const limpiarTituloSiEsNecesario = async () => {
        if (haTocadoElTitulo) {
            return;
        }
        lista.titulo = "";
        await tick();
        document.querySelector("#titulo").focus();
        haTocadoElTitulo = true;
    };
    const onEnterPresionadoEnElemento = (evento) => {
        if (evento.key === "Enter") {
            evento.preventDefault();
            agregarElementoALista();
        }
    };
    const agregarElementoALista = async () => {
        const ultimoElemento = lista.elementos[lista.elementos.length - 1];
        const deberiaAgregarElementoALista =
            lista.elementos.length <= 0 ||
            (ultimoElemento && ultimoElemento.contenido);
        if (deberiaAgregarElementoALista) {
            lista.elementos = [
                ...lista.elementos,
                {
                    contenido: "",
                    terminado: false,
                },
            ];
        }
        await tick();
        document
            .querySelector(`#elemento_${lista.elementos.length - 1}`)
            .focus();
    };
    const mostrarImagen = async (
        elemento,
        imagen,
        porcentajeCompensacionX,
        porcentajeCompensacionY
    ) => {
        await tick();
        imagen.classList.remove(claseAnimar);
        clearTimeout(idTimeout);
        const posicionXCheckbox =
            elemento.offsetLeft + elemento.offsetWidth / 2;
        const posicionYCheckbox =
            elemento.offsetTop + elemento.offsetHeight / 2;
        const compensacionX = (porcentajeCompensacionX * imagen.width) / 100;
        const compensacionY = (porcentajeCompensacionY * imagen.height) / 100;
        const x = posicionXCheckbox + compensacionX;
        const y = posicionYCheckbox + compensacionY;
        Object.assign(imagen.style, {
            left: x + "px",
            top: y + "px",
            display: "block",
        });
        imagen.classList.add(claseAnimar);
        idTimeout = setTimeout(() => {
            imagen.classList.remove(claseAnimar);
            imagen.style.display = "none";
        }, milisegundosMostrarImagen);
    };
    const onEstadoInputCambiado = async (event, estadoAnterior) => {
        const propioElemento = event.target;
        const nuevoEstado = !estadoAnterior;
        if (nuevoEstado) {
            mostrarImagen(propioElemento, imagen, -17, -22);
        }
        onAlgoCambiado();
    };
    const onAlgoCambiado = () => {
        deberiaGuardar = true;
    };
    const onElementoEnfocado = (indice) => {
        indiceElementoEnfocado = indice;
    };
    const modificarEtiquetasDeLista = () => {
        push("/etiquetas/lista/" + lista.id);
    };
    const eliminarElemento = async (elemento, indice) => {
        indiceElementoEnfocado = -1;
        lista.elementos = lista.elementos.filter(
            (_, indiceDeElementoEnFilter) => {
                if (indiceDeElementoEnFilter === indice) {
                    return false;
                }
                return true;
            }
        );
        await notasService.eliminarElementoDeLista(elemento.id);
    };

    const onContraseñaIntroducida = async (evento) => {
        contraseña = evento.detail;
        try {
            await cargarLista();
            mostrarDialogoSolicitarContraseña = false;
        } catch (e) {
            errorContraseña = "Error con la contraseña " + e;
        }
    };
</script>

{#if mostrarDialogoConfirmacion}
    <DialogoConfirmacion
        titulo="¿Eliminar lista?"
        contenido="Esto no se puede deshacer"
        mensajeConfirmar="Sí, eliminar"
        on:confirmar={eliminarLista}
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
                {milisegundosComoFecha(lista.ultimaModificacion)}
            </p>
        </div>
        <div>
            {#if estaEditando}
                <button
                    on:click={modificarEtiquetasDeLista}
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
        bind:innerText={lista.titulo}
        id="titulo"
        on:click={limpiarTituloSiEsNecesario}
        on:input={onAlgoCambiado}
    >
        Aquí va el título
    </h1>
    <div class="space-y-3">
        {#each lista.elementos as elemento, indice}
            <div class="flex items-center">
                <input
                    type="checkbox"
                    on:change={(event) => {
                        onEstadoInputCambiado(event, elemento.terminado);
                    }}
                    bind:checked={elemento.terminado}
                    class="rounded border-gray-300 text-pink-400 focus:ring-pink-400 h-8 w-8"
                />
                <div
                    id={"elemento_" + indice}
                    class:tachado={elemento.terminado}
                    contenteditable="true"
                    on:keypress={onEnterPresionadoEnElemento}
                    on:input={onAlgoCambiado}
                    class="flex-1 input-elemento-lista text-xl ml-2 text-amber-950"
                    bind:innerText={elemento.contenido}
                    on:focus={() => {
                        onElementoEnfocado(indice);
                    }}
                />
                {#if indiceElementoEnfocado === indice}
                    <button
                        transition:slide
                        on:click={() => {
                            eliminarElemento(elemento, indice);
                        }}
                        class="right-0 w-8 h-8 text-zinc-700"
                    >
                        <Icon src={XCircle} solid />
                    </button>
                {/if}
            </div>
        {/each}
        <div class="flex items-center">
            <Icon src={PlusCircle} solid class="h-8 w-8	text-pink-400" />
            <div
                on:click={agregarElementoALista}
                class="flex-1 input-elemento-lista text-xl ml-2 text-amber-950"
            >
                Elemento de la lista
            </div>
        </div>
        <ListarEtiquetas etiquetas={lista.etiquetas} />
    </div>
</div>

<style lang="postcss">
    .input-elemento-lista,
    .input-elemento-lista:focus {
        border: none;
        outline: none;
        box-shadow: none;
    }
    [contenteditable="true"],
    [contenteditable="true"]:focus {
        border: none;
        box-shadow: none;
        outline: none;
    }
</style>
