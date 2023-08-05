<script>
    import {
        Icon,
        PlusCircle,
        Trash,
        Tag,
        ChevronLeft,
        XCircle,
    } from "svelte-hero-icons";
    import { onMount, tick } from "svelte";
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
    let contraseña = "";
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
    const milisegundosMostrarImagen = 300;
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
        if (estaEditando) {
            resultado = await notasService.actualizarLista(
                lista.titulo,
                ahora,
                lista.id
            );
        } else {
            resultado = await notasService.guardarLista(
                lista.titulo,
                ahora,
                esListaEncriptada(),
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
        await asegurarQueLaListaExisteEnLaBaseDeDatos();
        const ultimoElemento = lista.elementos[lista.elementos.length - 1];
        const deberiaAgregarElementoALista =
            lista.elementos.length <= 0 ||
            (ultimoElemento && ultimoElemento.contenido);
        if (deberiaAgregarElementoALista) {
            const elementoRecienInsertado =
                await notasService.agregarElementoDeLista(lista.id);
            lista.elementos = [...lista.elementos, elementoRecienInsertado];
        }
        await tick();
        await guardarLista();
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
    const onEstadoInputCambiado = async (event, elemento) => {
        const propioElemento = event.target;
        const nuevoEstado = !elemento.terminado;
        if (nuevoEstado) {
            mostrarImagen(propioElemento, imagen, -17, -22);
        }
        actualizarElemento(elemento.id, elemento.contenido, nuevoEstado);
    };
    const onTituloCambiado = debounce(async () => {
        await guardarLista();
    }, 500);

    const asegurarQueLaListaExisteEnLaBaseDeDatos = async () => {
        if (!lista.id) {
            await guardarLista();
        }
    };

    const actualizarElemento = async (id, contenido, terminado) => {
        await asegurarQueLaListaExisteEnLaBaseDeDatos();
        await notasService.actualizarElementoDeLista(
            id,
            contenido,
            terminado,
            esListaEncriptada(),
            contraseña
        );
        await guardarLista();
    };
    const modificarEtiquetasDeLista = () => {
        push("/etiquetas/lista/" + lista.id);
    };
    const eliminarElemento = async (elemento, indice) => {
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
    const onElementoCambiado = debounce((elemento) => {
        actualizarElemento(elemento.id, elemento.contenido, elemento.terminado);
    }, 500);
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
        style="background-image: url('{fondo}'); z-index: -1; height: 100%; position: absolute; top: 0; width: 100%; opacity: 0.1;background-repeat:repeat;"
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
        on:input={onTituloCambiado}
    >
        Aquí va el título
    </h1>
    <div class="space-y-3">
        {#each lista.elementos as elemento, indice}
            <div class="flex items-center">
                <input
                    type="checkbox"
                    on:change={(event) => {
                        onEstadoInputCambiado(event, elemento);
                    }}
                    bind:checked={elemento.terminado}
                    class="rounded border-gray-300 text-pink-400 focus:ring-pink-400 h-12 w-12"
                />
                <div
                    id={"elemento_" + indice}
                    class:tachado={elemento.terminado}
                    contenteditable="true"
                    on:keypress={onEnterPresionadoEnElemento}
                    on:input={() => {
                        onElementoCambiado(elemento);
                    }}
                    class="flex-1 input-elemento-lista text-xl ml-2 text-amber-950"
                    bind:innerText={elemento.contenido}
                />
                <button
                    transition:slide
                    on:click={() => {
                        eliminarElemento(elemento, indice);
                    }}
                    class="right-0 w-12 h-12 text-zinc-700"
                >
                    <Icon src={XCircle} solid />
                </button>
            </div>
        {/each}
        <div on:click={agregarElementoALista} class="flex items-center">
            <Icon src={PlusCircle} solid class="h-12 w-12 text-pink-400" />
            <div
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
