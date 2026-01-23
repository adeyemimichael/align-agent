module.exports = [
"[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/align/node_modules/@prisma/client)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client-1d59d6c8a5ab316c", () => require("@prisma/client-1d59d6c8a5ab316c"));

module.exports = mod;
}),
"[externals]/pg [external] (pg, esm_import, [project]/align/node_modules/pg)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("pg-8666ad3816cdb996");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
];