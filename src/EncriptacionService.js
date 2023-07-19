const LONGITUD_SAL = 16,
    LONGITUD_VECTOR_INICIALIZACION = LONGITUD_SAL,
    ITERACIONES = 100000,
    LONGITUD_CLAVE = 256;
export const encriptacionService = {
    async encriptarLista(lista, contraseña) {
        for (const [indice,] of lista.elementos.entries()) {
            lista.elementos[indice].contenido = await encriptacionService.encriptar(contraseña, lista.elementos[indice].contenido);
        }
        return lista;
    },
    async desencriptarLista(lista, contraseña) {
        for (const [indice,] of lista.elementos.entries()) {
            lista.elementos[indice].contenido = await encriptacionService.desencriptar(contraseña, lista.elementos[indice].contenido);
        }
        return lista;
    },
    async encriptarNota(nota, contraseña) {
        nota.contenido = await encriptacionService.encriptar(contraseña, nota.contenido);
        return nota;
    },
    async desencriptarNota(nota, contraseña) {
        nota.contenido = await encriptacionService.desencriptar(contraseña, nota.contenido);
        return nota;
    },
    bufferABase64(buffer) {
        return btoa(String.fromCharCode(...new Uint8Array(buffer)));
    },
    base64ABuffer(cadenaEnBase64) {
        return Uint8Array.from(atob(cadenaEnBase64), c => c.charCodeAt(0))
    },
    async derivacionDeClaveBasadaEnContraseña(contraseña, sal, iteraciones, longitud, hash, algoritmo = 'AES-CBC') {
        const encoder = new TextEncoder();
        let keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(contraseña),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );
        return await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode(sal),
                iterations: iteraciones,
                hash
            },
            keyMaterial,
            { name: algoritmo, length: longitud },
            false,
            ['encrypt', 'decrypt']
        );
    },
    async desencriptar(contraseña, encriptadoEnBase64) {
        const decoder = new TextDecoder();
        const datosEncriptados = encriptacionService.base64ABuffer(encriptadoEnBase64);
        const sal = datosEncriptados.slice(0, LONGITUD_SAL);
        const vectorInicializacion = datosEncriptados.slice(0 + LONGITUD_SAL, LONGITUD_SAL + LONGITUD_VECTOR_INICIALIZACION);
        const clave = await encriptacionService.derivacionDeClaveBasadaEnContraseña(contraseña, sal, ITERACIONES, LONGITUD_CLAVE, 'SHA-256');
        const datosDesencriptadosComoBuffer = await window.crypto.subtle.decrypt(
            { name: "AES-CBC", iv: vectorInicializacion },
            clave,
            datosEncriptados.slice(LONGITUD_SAL + LONGITUD_VECTOR_INICIALIZACION)
        );
        return decoder.decode(datosDesencriptadosComoBuffer);
    },
    async encriptar(contraseña, textoPlano) {
        const encoder = new TextEncoder();
        const sal = window.crypto.getRandomValues(new Uint8Array(LONGITUD_SAL));
        const vectorInicializacion = window.crypto.getRandomValues(new Uint8Array(LONGITUD_VECTOR_INICIALIZACION));
        const bufferTextoPlano = encoder.encode(textoPlano);
        const clave = await encriptacionService.derivacionDeClaveBasadaEnContraseña(contraseña, sal, ITERACIONES, LONGITUD_CLAVE, 'SHA-256');
        const encriptado = await window.crypto.subtle.encrypt(
            { name: "AES-CBC", iv: vectorInicializacion },
            clave,
            bufferTextoPlano
        );
        return encriptacionService.bufferABase64([
            ...sal,
            ...vectorInicializacion,
            ...new Uint8Array(encriptado)
        ]);
    },
};
