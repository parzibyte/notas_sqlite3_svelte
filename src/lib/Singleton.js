import { writable } from 'svelte/store';
import * as Comlink from "comlink";

//const MyClass = Comlink.wrap((await import("../BD.js?worker")).default());
const worker = new Worker(new URL("../BD.js", import.meta.url), { type: "module" });
const EnvolturaDeBaseDeDatos = Comlink.wrap(worker);
const envoltura = await new EnvolturaDeBaseDeDatos();
await envoltura.iniciar();
export const singleton = writable(envoltura);
