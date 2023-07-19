<script>
	import * as Comlink from "comlink";
	import { Icon, Tag, ArrowLeft, Plus } from "svelte-hero-icons";
	import { push } from "svelte-spa-router";
	import { debounce } from "../utiles";
	import { onMount } from "svelte";

	import { singleton } from "./Singleton.js";
	import { NotasService } from "../NotasService.js";
	import { EtiquetasService } from "../EtiquetasService.js";
	export let params;
	let busqueda = "";
	let etiquetas = [];
	let etiquetasDeListaONota = [];
	let etiquetasService = null;
	let notasService = null;
	const tipoLista = "lista";
	let estaEncriptada = false;

	onMount(async () => {
		singleton.subscribe(async (bd) => {
			etiquetasService = new EtiquetasService(bd);
			notasService = new NotasService(bd);
			const notaOLista = esLista()
				? await notasService.obtenerListaPorId(params.id)
				: await notasService.obtenerNotaPorId(params.id);
			estaEncriptada = notaOLista.encriptada;
			await obtenerEtiquetasDeListaONota();
			buscarEtiquetas();
		});
	});

	const esLista = () => tipoLista === params.tipo;

	const obtenerEtiquetasDeListaONota = async () => {
		if (esLista()) {
			etiquetasDeListaONota =
				await etiquetasService.obtenerEtiquetasDeLista(params.id);
		} else {
			etiquetasDeListaONota =
				await etiquetasService.obtenerEtiquetasDeNota(params.id);
		}
	};

	const volver = () => {
		let tipo = "normal";
		if (estaEncriptada) {
			tipo = "encriptada";
		}
		if (esLista()) {
			push(`/agregar-lista/${tipo}/${params.id}`);
		} else {
			push(`/agregar-nota/${tipo}/${params.id}`);
		}
	};
	const crearEtiquetaSegunBusqueda = async () => {
		const etiquetaRecienGuardada = await etiquetasService.guardarEtiqueta(
			busqueda
		);
		if (esLista()) {
			await etiquetasService.agregarEtiquetaALista(
				params.id,
				etiquetaRecienGuardada.id
			);
		} else {
			await etiquetasService.agregarEtiquetaANota(
				params.id,
				etiquetaRecienGuardada.id
			);
		}
		busqueda = "";
		await obtenerEtiquetasDeListaONota();
		await buscarEtiquetas();
	};
	const onBusqueda = debounce(async () => {
		buscarEtiquetas();
	}, 500);

	const buscarEtiquetas = async () => {
		const todasLasEtiquetas = await etiquetasService.buscarEtiquetas(
			busqueda
		);
		etiquetas = todasLasEtiquetas.map((etiqueta) => {
			const indice = etiquetasDeListaONota.findIndex(
				(etiquetaDeLista) => {
					if (etiquetaDeLista.id === etiqueta.id) {
						return true;
					}
				}
			);
			const existe = indice !== -1;
			etiqueta.marcada = existe;
			return etiqueta;
		});
	};
	const onEtiquetaSeleccionada = async (indice) => {
		const etiquetaSeleccionada = etiquetas[indice];
		let funcionAgregar = "agregarEtiquetaANota";
		let funcionEliminar = "quitarEtiquetaDeNota";
		if (esLista()) {
			funcionAgregar = "agregarEtiquetaALista";
			funcionEliminar = "quitarEtiquetaDeLista";
		}
		if (!etiquetaSeleccionada.marcada) {
			await etiquetasService[funcionAgregar](
				params.id,
				etiquetaSeleccionada.id
			);
		} else {
			await etiquetasService[funcionEliminar](
				params.id,
				etiquetaSeleccionada.id
			);
		}
		await obtenerEtiquetasDeListaONota();
		await buscarEtiquetas();
	};
</script>

<div class="p-2 flex justify-between">
	<div class="mr-2">
		<button on:click={volver} class="w-8 h-8 text-neutral-950">
			<Icon src={ArrowLeft} solid />
		</button>
	</div>
	<div class="w-full">
		<input
			on:input={onBusqueda}
			bind:value={busqueda}
			class="w-full border-none"
			type="text"
			placeholder="Ingresa el nombre de la etiqueta"
		/>
	</div>
</div>
{#if etiquetas.length <= 0 && busqueda}
	<div
		on:click={crearEtiquetaSegunBusqueda}
		class="flex flex-row items-center p-2"
	>
		<Icon class="w-8 h-8 mr-5" src={Plus} solid />
		<p class="flex-1 text-lg">Crear "{busqueda}"</p>
	</div>
{/if}
{#each etiquetas as etiqueta, indice}
	<div
		on:click={() => {
			onEtiquetaSeleccionada(indice);
		}}
		class="flex flex-row items-center p-2 pr-4"
	>
		<Icon class="w-8 h-8 mr-5" src={Tag} solid />
		<p class="flex-1 text-lg">{etiqueta.nombre}</p>
		<input
			readonly
			bind:checked={etiqueta.marcada}
			type="checkbox"
			class="rounded border-gray-300 text-violet-400 focus:ring-violet-400 h-8 w-8"
		/>
	</div>
{/each}

<style>
	input:focus {
		box-shadow: none;
	}
</style>
