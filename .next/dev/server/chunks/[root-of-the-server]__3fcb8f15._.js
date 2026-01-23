module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[project]/align/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$align$2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/align/node_modules/@prisma/client)");
var __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f40$prisma$2f$adapter$2d$pg$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/align/node_modules/@prisma/adapter-pg/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$align$2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/align/node_modules/pg)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f40$prisma$2f$adapter$2d$pg$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$align$2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f40$prisma$2f$adapter$2d$pg$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$align$2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const globalForPrisma = globalThis;
function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not set');
    }
    const pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$align$2f$node_modules$2f$pg$29$__["default"].Pool({
        connectionString
    });
    const adapter = new __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f40$prisma$2f$adapter$2d$pg$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PrismaPg"](pool);
    return new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$align$2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
        adapter
    });
}
const prisma = globalForPrisma.prisma ?? createPrismaClient();
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/align/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "auth",
    ()=>auth,
    "handlers",
    ()=>handlers,
    "signIn",
    ()=>signIn,
    "signOut",
    ()=>signOut
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/align/node_modules/next-auth/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f$next$2d$auth$2f$providers$2f$google$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/align/node_modules/next-auth/providers/google.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f40$auth$2f$core$2f$providers$2f$google$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/align/node_modules/@auth/core/providers/google.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f40$auth$2f$prisma$2d$adapter$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/align/node_modules/@auth/prisma-adapter/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/align/lib/prisma.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const { handlers, signIn, signOut, auth } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])({
    adapter: (0, __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f40$auth$2f$prisma$2d$adapter$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PrismaAdapter"])(__TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"]),
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f40$auth$2f$core$2f$providers$2f$google$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        })
    ],
    session: {
        strategy: "database"
    },
    pages: {
        signIn: "/login",
        error: "/login"
    },
    callbacks: {
        async session ({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
            }
            return session;
        }
    },
    debug: ("TURBOPACK compile-time value", "development") === "development"
});
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/node:process [external] (node:process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:process", () => require("node:process"));

module.exports = mod;
}),
"[externals]/node:os [external] (node:os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:os", () => require("node:os"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/domain [external] (domain, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("domain", () => require("domain"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/async_hooks [external] (async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("async_hooks", () => require("async_hooks"));

module.exports = mod;
}),
"[externals]/node:tty [external] (node:tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:tty", () => require("node:tty"));

module.exports = mod;
}),
"[project]/align/lib/opik.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "exportOpikData",
    ()=>exportOpikData,
    "getOpikClient",
    ()=>getOpikClient,
    "getOpikDashboardUrl",
    ()=>getOpikDashboardUrl,
    "logAIRequest",
    ()=>logAIRequest,
    "trackCapacityAccuracy",
    ()=>trackCapacityAccuracy,
    "trackReasoningQuality",
    ()=>trackReasoningQuality
]);
/**
 * Opik Tracking Integration
 * Tracks AI model performance and decisions for demo purposes
 * Requirements: 13.1, 13.2, 13.3
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f$opik$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/align/node_modules/opik/dist/index.js [app-route] (ecmascript) <locals>");
;
let opikClient = null;
function getOpikClient() {
    // Only initialize if API key is provided
    if (!process.env.OPIK_API_KEY) {
        console.warn('OPIK_API_KEY not set - tracking disabled');
        return null;
    }
    if (!opikClient) {
        try {
            opikClient = new __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f$opik$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Opik"]({
                apiKey: process.env.OPIK_API_KEY,
                projectName: process.env.OPIK_PROJECT_NAME || 'adaptive-productivity-agent'
            });
            console.log('Opik client initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Opik client:', error);
            return null;
        }
    }
    return opikClient;
}
async function logAIRequest(data) {
    const client = getOpikClient();
    if (!client) return;
    try {
        await client.log({
            projectName: 'adaptive-productivity-agent',
            name: 'gemini_plan_generation',
            input: {
                userId: data.userId,
                capacityScore: data.capacityScore,
                mode: data.mode,
                taskCount: data.taskCount,
                prompt: data.prompt
            },
            output: {
                response: data.response,
                reasoning: data.reasoning
            },
            metadata: {
                model: 'gemini-1.5-flash',
                duration_ms: data.duration,
                timestamp: data.timestamp.toISOString()
            },
            tags: [
                'ai-planning',
                'gemini',
                data.mode
            ]
        });
        console.log('AI request logged to Opik');
    } catch (error) {
        console.error('Failed to log AI request to Opik:', error);
    }
}
async function trackCapacityAccuracy(data) {
    const client = getOpikClient();
    if (!client) return;
    try {
        // Calculate accuracy score (how well capacity predicted completion)
        const expectedCompletion = data.predictedCapacity;
        const actualCompletion = data.actualCompletionRate;
        const accuracyScore = 100 - Math.abs(expectedCompletion - actualCompletion);
        await client.log({
            projectName: 'adaptive-productivity-agent',
            name: 'capacity_accuracy',
            input: {
                userId: data.userId,
                predictedCapacity: data.predictedCapacity,
                mode: data.mode,
                date: data.date.toISOString()
            },
            output: {
                actualCompletionRate: data.actualCompletionRate,
                accuracyScore
            },
            metadata: {
                error: Math.abs(expectedCompletion - actualCompletion),
                timestamp: new Date().toISOString()
            },
            tags: [
                'capacity-tracking',
                data.mode
            ],
            feedbackScores: [
                {
                    name: 'accuracy',
                    value: accuracyScore / 100,
                    reason: `Predicted ${expectedCompletion}%, actual ${actualCompletion}%`
                }
            ]
        });
        console.log('Capacity accuracy tracked in Opik');
    } catch (error) {
        console.error('Failed to track capacity accuracy in Opik:', error);
    }
}
async function trackReasoningQuality(data) {
    const client = getOpikClient();
    if (!client) return;
    try {
        const qualityScore = calculateReasoningQuality(data.reasoning);
        await client.log({
            projectName: 'adaptive-productivity-agent',
            name: 'reasoning_quality',
            input: {
                userId: data.userId,
                taskCount: data.taskCount,
                reasoningLength: data.reasoning.length
            },
            output: {
                reasoning: data.reasoning,
                qualityScore
            },
            metadata: {
                userFeedback: data.userFeedback,
                completionRate: data.completionRate,
                timestamp: new Date().toISOString()
            },
            tags: [
                'reasoning-quality',
                'gemini'
            ],
            feedbackScores: data.userFeedback ? [
                {
                    name: 'user_satisfaction',
                    value: data.userFeedback === 'helpful' ? 1 : 0
                }
            ] : undefined
        });
        console.log('Reasoning quality tracked in Opik');
    } catch (error) {
        console.error('Failed to track reasoning quality in Opik:', error);
    }
}
/**
 * Calculate reasoning quality score based on heuristics
 */ function calculateReasoningQuality(reasoning) {
    let score = 50; // Base score
    // Check for key elements of good reasoning
    if (reasoning.includes('capacity')) score += 10;
    if (reasoning.includes('priority') || reasoning.includes('prioritize')) score += 10;
    if (reasoning.includes('energy') || reasoning.includes('focus')) score += 10;
    if (reasoning.includes('balance') || reasoning.includes('recovery')) score += 10;
    if (reasoning.length > 100) score += 10; // Detailed explanation
    return Math.min(100, score);
}
function getOpikDashboardUrl() {
    const projectName = process.env.OPIK_PROJECT_NAME || 'adaptive-productivity-agent';
    return `https://www.comet.com/opik/projects/${projectName}`;
}
async function exportOpikData(userId, startDate, endDate) {
    const client = getOpikClient();
    if (!client) {
        console.warn('Opik client not available for export');
        return [];
    }
    try {
        // In a real implementation, this would query Opik's API
        // For now, return a placeholder
        console.log('Exporting Opik data for user:', userId);
        return [];
    } catch (error) {
        console.error('Failed to export Opik data:', error);
        return [];
    }
}
}),
"[project]/align/app/api/opik/stats/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/align/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/align/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/align/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$opik$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/align/lib/opik.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function GET(request) {
    try {
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auth"])();
        if (!session || !session.user?.email) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        // Get user from database
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
            where: {
                email: session.user.email
            }
        });
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'User not found'
            }, {
                status: 404
            });
        }
        // Get statistics from database
        const totalPlans = await __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].dailyPlan.count({
            where: {
                userId: user.id
            }
        });
        const plansWithTasks = await __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].dailyPlan.findMany({
            where: {
                userId: user.id
            },
            include: {
                tasks: true
            },
            orderBy: {
                date: 'desc'
            },
            take: 30
        });
        // Calculate statistics
        const totalTasks = plansWithTasks.reduce((sum, plan)=>sum + plan.tasks.length, 0);
        const completedTasks = plansWithTasks.reduce((sum, plan)=>sum + plan.tasks.filter((t)=>t.completed).length, 0);
        const avgCompletionRate = totalTasks > 0 ? completedTasks / totalTasks * 100 : 0;
        const avgCapacity = plansWithTasks.length > 0 ? plansWithTasks.reduce((sum, plan)=>sum + plan.capacityScore, 0) / plansWithTasks.length : 0;
        // Mode distribution
        const modeDistribution = plansWithTasks.reduce((acc, plan)=>{
            acc[plan.mode] = (acc[plan.mode] || 0) + 1;
            return acc;
        }, {});
        // Get Opik dashboard URL
        const opikDashboardUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$opik$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOpikDashboardUrl"])();
        return __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            stats: {
                totalPlans,
                totalTasks,
                completedTasks,
                avgCompletionRate: Math.round(avgCompletionRate),
                avgCapacity: Math.round(avgCapacity),
                modeDistribution
            },
            opikDashboardUrl,
            opikEnabled: !!process.env.OPIK_API_KEY
        });
    } catch (error) {
        console.error('Opik stats error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to get Opik statistics',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3fcb8f15._.js.map