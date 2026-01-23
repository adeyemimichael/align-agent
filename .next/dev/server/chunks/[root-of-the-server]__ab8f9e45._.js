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
"[project]/align/lib/gemini.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GeminiClient",
    ()=>GeminiClient,
    "getGeminiClient",
    ()=>getGeminiClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/align/node_modules/@google/generative-ai/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$opik$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/align/lib/opik.ts [app-route] (ecmascript)");
;
;
class GeminiClient {
    genAI;
    model;
    constructor(apiKey){
        const key = apiKey || process.env.GEMINI_API_KEY;
        if (!key) {
            throw new Error('GEMINI_API_KEY not configured');
        }
        this.genAI = new __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](key);
        this.model = this.genAI.getGenerativeModel({
            model: 'gemini-pro'
        });
    }
    /**
   * Generate an intelligent daily plan based on capacity and context
   */ async generateDailyPlan(context, startTime = new Date(), userId) {
        const prompt = this.buildPlanningPrompt(context, startTime);
        const startTimestamp = Date.now();
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const duration = Date.now() - startTimestamp;
            const planningResponse = this.parsePlanningResponse(text, context.tasks, startTime);
            // Track AI request in Opik (if userId provided)
            if (userId) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$opik$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAIRequest"])({
                    userId,
                    capacityScore: context.capacityScore,
                    mode: context.mode,
                    taskCount: context.tasks.length,
                    prompt,
                    response: text,
                    reasoning: planningResponse.overallReasoning,
                    duration,
                    timestamp: new Date()
                }).catch((err)=>console.error('Opik logging failed:', err));
                // Track reasoning quality
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$opik$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackReasoningQuality"])({
                    userId,
                    reasoning: planningResponse.overallReasoning,
                    taskCount: context.tasks.length
                }).catch((err)=>console.error('Opik reasoning tracking failed:', err));
            }
            return planningResponse;
        } catch (error) {
            console.error('Gemini AI error:', error);
            throw new Error(`Failed to generate plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
   * Build the prompt for daily planning
   */ buildPlanningPrompt(context, startTime) {
        const { capacityScore, mode, tasks, history, goals } = context;
        // Format history
        const historyText = history.map((h)=>`- ${h.date.toLocaleDateString()}: Capacity ${h.capacityScore.toFixed(0)}, Completed ${h.completedTasks}/${h.totalTasks} tasks`).join('\n');
        // Format tasks
        const tasksText = tasks.map((t)=>`- [${t.id}] ${t.title} (Priority: ${t.priority}, Est: ${t.estimatedMinutes}min${t.dueDate ? `, Due: ${t.dueDate.toLocaleDateString()}` : ''})`).join('\n');
        // Format goals
        const goalsText = goals ? goals.map((g)=>`- ${g.title} (${g.category})`).join('\n') : 'No goals set';
        const prompt = `You are an AI productivity assistant helping a user plan their day based on their current capacity and goals.

**Current Context:**
- Date: ${startTime.toLocaleDateString()}
- Time: ${startTime.toLocaleTimeString()}
- Capacity Score: ${capacityScore.toFixed(0)}/100
- Mode: ${mode.toUpperCase()}

**Mode Guidelines:**
- RECOVERY (score < 40): Prioritize rest, light tasks, and self-care. Limit work to 2-3 hours max.
- BALANCED (score 40-69): Mix of focused work and breaks. Standard 4-6 hour workday.
- DEEP_WORK (score ≥ 70): Tackle demanding tasks. Can handle 6-8 hours of focused work.

**Recent History (Last 7 Days):**
${historyText || 'No history available'}

**User's Goals:**
${goalsText}

**Available Tasks:**
${tasksText}

**Instructions:**
1. Analyze the user's capacity score and recent patterns
2. Consider their goals and how today's work contributes to them
3. Prioritize tasks based on:
   - Current capacity and mode
   - Task priority and due dates
   - Recent completion patterns
   - Goal alignment
4. Schedule tasks with realistic time blocks
5. Include breaks and recovery time based on capacity
6. Provide clear reasoning for your decisions

**Output Format (JSON):**
{
  "overallReasoning": "Brief explanation of your planning strategy for today",
  "modeRecommendation": "Any suggestions about the current mode or capacity",
  "tasks": [
    {
      "taskId": "task-id",
      "startTime": "HH:MM",
      "duration": minutes,
      "reasoning": "Why this task at this time"
    }
  ]
}

Generate the plan now:`;
        return prompt;
    }
    /**
   * Parse Gemini's response into structured format
   */ parsePlanningResponse(text, tasks, startTime) {
        try {
            // Extract JSON from response (Gemini sometimes wraps it in markdown)
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            const parsed = JSON.parse(jsonMatch[0]);
            // Convert to our format
            const orderedTasks = parsed.tasks.map((t)=>{
                const task = tasks.find((task)=>task.id === t.taskId);
                if (!task) {
                    throw new Error(`Task ${t.taskId} not found`);
                }
                // Parse start time
                const [hours, minutes] = t.startTime.split(':').map(Number);
                const scheduledStart = new Date(startTime);
                scheduledStart.setHours(hours, minutes, 0, 0);
                // Calculate end time
                const scheduledEnd = new Date(scheduledStart);
                scheduledEnd.setMinutes(scheduledEnd.getMinutes() + t.duration);
                return {
                    taskId: t.taskId,
                    scheduledStart,
                    scheduledEnd,
                    reasoning: t.reasoning
                };
            });
            return {
                orderedTasks,
                overallReasoning: parsed.overallReasoning,
                modeRecommendation: parsed.modeRecommendation
            };
        } catch (error) {
            console.error('Failed to parse Gemini response:', error);
            console.error('Raw response:', text);
            // Fallback: simple priority-based ordering
            return this.fallbackPlanning(tasks, startTime);
        }
    }
    /**
   * Fallback planning when AI fails
   */ fallbackPlanning(tasks, startTime) {
        console.warn('Using fallback planning due to AI parsing error');
        // Sort by priority and due date
        const sortedTasks = [
            ...tasks
        ].sort((a, b)=>{
            if (a.priority !== b.priority) {
                return a.priority - b.priority; // Lower number = higher priority
            }
            if (a.dueDate && b.dueDate) {
                return a.dueDate.getTime() - b.dueDate.getTime();
            }
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;
            return 0;
        });
        // Schedule tasks sequentially
        let currentTime = new Date(startTime);
        const orderedTasks = sortedTasks.map((task)=>{
            const scheduledStart = new Date(currentTime);
            const scheduledEnd = new Date(currentTime);
            scheduledEnd.setMinutes(scheduledEnd.getMinutes() + task.estimatedMinutes);
            currentTime = new Date(scheduledEnd);
            currentTime.setMinutes(currentTime.getMinutes() + 15); // 15 min break
            return {
                taskId: task.id,
                scheduledStart,
                scheduledEnd,
                reasoning: `Priority ${task.priority} task${task.dueDate ? ' with upcoming due date' : ''}`
            };
        });
        return {
            orderedTasks,
            overallReasoning: 'Using simple priority-based scheduling (AI planning temporarily unavailable)',
            modeRecommendation: undefined
        };
    }
    /**
   * Get AI suggestions for capacity adjustment
   */ async getCapacityInsights(currentScore, history) {
        const historyText = history.map((h)=>`${h.date.toLocaleDateString()}: ${h.capacityScore.toFixed(0)}`).join(', ');
        const prompt = `Analyze this user's capacity trend and provide brief insights:

Current capacity score: ${currentScore.toFixed(0)}/100
Recent history: ${historyText}

Provide 2-3 sentences of insight about their capacity trend and any recommendations.`;
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini insights error:', error);
            return 'Unable to generate insights at this time.';
        }
    }
}
/**
 * Singleton instance
 */ let geminiClient = null;
function getGeminiClient() {
    if (!geminiClient) {
        geminiClient = new GeminiClient();
    }
    return geminiClient;
}
}),
"[project]/align/lib/encryption.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decryptToken",
    ()=>decryptToken,
    "encryptToken",
    ()=>encryptToken
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
// Encryption key from environment (should be 32 bytes for AES-256)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || 'default-key-change-in-production';
const ALGORITHM = 'aes-256-cbc';
function encryptToken(token) {
    const key = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const iv = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(16);
    const cipher = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Return IV + encrypted data
    return iv.toString('hex') + ':' + encrypted;
}
function decryptToken(encryptedToken) {
    const key = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const parts = encryptedToken.split(':');
    if (parts.length !== 2) {
        throw new Error('Invalid encrypted token format');
    }
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
}),
"[project]/align/lib/google-calendar.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GoogleCalendarClient",
    ()=>GoogleCalendarClient,
    "refreshGoogleToken",
    ()=>refreshGoogleToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/align/lib/encryption.ts [app-route] (ecmascript)");
;
class GoogleCalendarClient {
    accessToken;
    refreshToken;
    baseUrl = 'https://www.googleapis.com/calendar/v3';
    constructor(encryptedAccessToken, encryptedRefreshToken){
        this.accessToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decryptToken"])(encryptedAccessToken);
        if (encryptedRefreshToken) {
            this.refreshToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decryptToken"])(encryptedRefreshToken);
        }
    }
    /**
   * Create a calendar event
   */ async createEvent(calendarId = 'primary', event) {
        const response = await fetch(`${this.baseUrl}/calendars/${calendarId}/events`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Google Calendar API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        return response.json();
    }
    /**
   * Update a calendar event
   */ async updateEvent(eventId, event, calendarId = 'primary') {
        const response = await fetch(`${this.baseUrl}/calendars/${calendarId}/events/${eventId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Google Calendar API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        return response.json();
    }
    /**
   * Delete a calendar event
   */ async deleteEvent(eventId, calendarId = 'primary') {
        const response = await fetch(`${this.baseUrl}/calendars/${calendarId}/events/${eventId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${this.accessToken}`
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Google Calendar API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
    }
    /**
   * List events in a time range
   */ async listEvents(timeMin, timeMax, calendarId = 'primary') {
        const url = new URL(`${this.baseUrl}/calendars/${calendarId}/events`);
        url.searchParams.set('timeMin', timeMin.toISOString());
        url.searchParams.set('timeMax', timeMax.toISOString());
        url.searchParams.set('singleEvents', 'true');
        url.searchParams.set('orderBy', 'startTime');
        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${this.accessToken}`
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Google Calendar API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();
        return data.items || [];
    }
    /**
   * Check for scheduling conflicts
   */ async hasConflict(startTime, endTime, calendarId = 'primary') {
        const events = await this.listEvents(startTime, endTime, calendarId);
        return events.length > 0;
    }
}
async function refreshGoogleToken(refreshToken) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error('Google OAuth credentials not configured');
    }
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        })
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
    }
    return response.json();
}
}),
"[project]/align/lib/calendar-sync.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "deleteCalendarEvent",
    ()=>deleteCalendarEvent,
    "syncPlanToCalendar",
    ()=>syncPlanToCalendar,
    "updateCalendarEvent",
    ()=>updateCalendarEvent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/align/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$google$2d$calendar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/align/lib/google-calendar.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/align/lib/encryption.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function syncPlanToCalendar(userId, tasks, timeZone = 'UTC') {
    const errors = [];
    let createdEvents = 0;
    try {
        // Get Google Calendar integration
        const integration = await __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].integration.findUnique({
            where: {
                userId_platform: {
                    userId,
                    platform: 'google_calendar'
                }
            }
        });
        if (!integration) {
            return {
                success: false,
                createdEvents: 0,
                errors: [
                    'Google Calendar not connected'
                ]
            };
        }
        // Check if token needs refresh
        let accessToken = integration.accessToken;
        if (integration.expiresAt && integration.expiresAt < new Date()) {
            if (!integration.refreshToken) {
                return {
                    success: false,
                    createdEvents: 0,
                    errors: [
                        'Token expired and no refresh token available'
                    ]
                };
            }
            // Refresh the token
            const tokenData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$google$2d$calendar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["refreshGoogleToken"])(integration.refreshToken);
            accessToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encryptToken"])(tokenData.access_token);
            // Update the integration with new token
            await __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].integration.update({
                where: {
                    id: integration.id
                },
                data: {
                    accessToken,
                    expiresAt: new Date(Date.now() + tokenData.expires_in * 1000)
                }
            });
        }
        // Create calendar client
        const client = new __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$google$2d$calendar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleCalendarClient"](accessToken);
        // Create events for each task
        for (const task of tasks){
            try {
                // Check for conflicts
                const hasConflict = await client.hasConflict(task.startTime, task.endTime);
                if (hasConflict) {
                    errors.push(`Conflict detected for task "${task.title}" at ${task.startTime.toISOString()}`);
                    continue;
                }
                // Create the event
                const event = await client.createEvent('primary', {
                    summary: task.title,
                    description: task.description,
                    start: {
                        dateTime: task.startTime.toISOString(),
                        timeZone
                    },
                    end: {
                        dateTime: task.endTime.toISOString(),
                        timeZone
                    },
                    colorId: getPriorityColor(task.priority)
                });
                // Update the task with the calendar event ID
                await __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].planTask.update({
                    where: {
                        id: task.taskId
                    },
                    data: {
                        externalId: event.id
                    }
                });
                createdEvents++;
            } catch (error) {
                console.error(`Error creating event for task ${task.taskId}:`, error);
                errors.push(`Failed to create event for task "${task.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        return {
            success: errors.length === 0,
            createdEvents,
            errors
        };
    } catch (error) {
        console.error('Calendar sync error:', error);
        return {
            success: false,
            createdEvents,
            errors: [
                `Calendar sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            ]
        };
    }
}
async function updateCalendarEvent(userId, taskId, newStartTime, newEndTime, timeZone = 'UTC') {
    try {
        // Get the task with its calendar event ID
        const task = await __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].planTask.findUnique({
            where: {
                id: taskId
            }
        });
        if (!task || !task.externalId) {
            return {
                success: false,
                error: 'Task not found or not synced to calendar'
            };
        }
        // Get Google Calendar integration
        const integration = await __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].integration.findUnique({
            where: {
                userId_platform: {
                    userId,
                    platform: 'google_calendar'
                }
            }
        });
        if (!integration) {
            return {
                success: false,
                error: 'Google Calendar not connected'
            };
        }
        // Check if token needs refresh
        let accessToken = integration.accessToken;
        if (integration.expiresAt && integration.expiresAt < new Date()) {
            if (!integration.refreshToken) {
                return {
                    success: false,
                    error: 'Token expired and no refresh token available'
                };
            }
            // Refresh the token
            const tokenData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$google$2d$calendar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["refreshGoogleToken"])(integration.refreshToken);
            accessToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encryptToken"])(tokenData.access_token);
            // Update the integration with new token
            await __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].integration.update({
                where: {
                    id: integration.id
                },
                data: {
                    accessToken,
                    expiresAt: new Date(Date.now() + tokenData.expires_in * 1000)
                }
            });
        }
        // Create calendar client
        const client = new __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$google$2d$calendar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleCalendarClient"](accessToken);
        // Update the event
        await client.updateEvent(task.externalId, {
            summary: task.title,
            description: task.description || undefined,
            start: {
                dateTime: newStartTime.toISOString(),
                timeZone
            },
            end: {
                dateTime: newEndTime.toISOString(),
                timeZone
            },
            colorId: getPriorityColor(task.priority)
        });
        // Update the task's scheduled times
        await __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].planTask.update({
            where: {
                id: taskId
            },
            data: {
                scheduledStart: newStartTime,
                scheduledEnd: newEndTime
            }
        });
        return {
            success: true
        };
    } catch (error) {
        console.error('Calendar event update error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update calendar event'
        };
    }
}
async function deleteCalendarEvent(userId, taskId) {
    try {
        // Get the task with its calendar event ID
        const task = await __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].planTask.findUnique({
            where: {
                id: taskId
            }
        });
        if (!task || !task.externalId) {
            return {
                success: true
            };
        }
        // Get Google Calendar integration
        const integration = await __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].integration.findUnique({
            where: {
                userId_platform: {
                    userId,
                    platform: 'google_calendar'
                }
            }
        });
        if (!integration) {
            return {
                success: false,
                error: 'Google Calendar not connected'
            };
        }
        // Check if token needs refresh
        let accessToken = integration.accessToken;
        if (integration.expiresAt && integration.expiresAt < new Date()) {
            if (!integration.refreshToken) {
                return {
                    success: false,
                    error: 'Token expired and no refresh token available'
                };
            }
            // Refresh the token
            const tokenData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$google$2d$calendar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["refreshGoogleToken"])(integration.refreshToken);
            accessToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encryptToken"])(tokenData.access_token);
            // Update the integration with new token
            await __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].integration.update({
                where: {
                    id: integration.id
                },
                data: {
                    accessToken,
                    expiresAt: new Date(Date.now() + tokenData.expires_in * 1000)
                }
            });
        }
        // Create calendar client
        const client = new __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$google$2d$calendar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleCalendarClient"](accessToken);
        // Delete the event
        await client.deleteEvent(task.externalId);
        // Clear the external ID from the task
        await __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].planTask.update({
            where: {
                id: taskId
            },
            data: {
                externalId: null
            }
        });
        return {
            success: true
        };
    } catch (error) {
        console.error('Calendar event deletion error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete calendar event'
        };
    }
}
/**
 * Get Google Calendar color ID based on task priority
 * Priority 1 (highest) = Red (11)
 * Priority 2 = Orange (6)
 * Priority 3 = Yellow (5)
 * Priority 4 (lowest) = Blue (9)
 */ function getPriorityColor(priority) {
    const colorMap = {
        1: '11',
        2: '6',
        3: '5',
        4: '9'
    };
    return colorMap[priority] || '9'; // Default to blue
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/align/app/api/plan/generate/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/align/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/align/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/align/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$gemini$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/align/lib/gemini.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$calendar$2d$sync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/align/lib/calendar-sync.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$calendar$2d$sync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$calendar$2d$sync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
async function POST(request) {
    try {
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auth"])();
        if (!session || !session.user?.email) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const body = await request.json();
        const { date, syncToCalendar = false } = body;
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
        // Get today's check-in
        const planDate = date ? new Date(date) : new Date();
        planDate.setHours(0, 0, 0, 0);
        const checkIn = await __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].checkIn.findFirst({
            where: {
                userId: user.id,
                date: {
                    gte: planDate,
                    lt: new Date(planDate.getTime() + 24 * 60 * 60 * 1000)
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
        if (!checkIn) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'No check-in found for today. Please complete your check-in first.'
            }, {
                status: 400
            });
        }
        // Get 7-day history
        const sevenDaysAgo = new Date(planDate);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const history = await __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].checkIn.findMany({
            where: {
                userId: user.id,
                date: {
                    gte: sevenDaysAgo,
                    lt: planDate
                }
            },
            orderBy: {
                date: 'desc'
            },
            take: 7
        });
        // Get user's goals
        const goals = await __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].goal.findMany({
            where: {
                userId: user.id
            },
            select: {
                title: true,
                category: true
            }
        });
        // Get tasks from Todoist integration
        const todoistIntegration = await __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].integration.findUnique({
            where: {
                userId_platform: {
                    userId: user.id,
                    platform: 'todoist'
                }
            }
        });
        let tasks = [];
        if (todoistIntegration) {
            // Fetch tasks from Todoist
            const todoistResponse = await fetch(`${request.nextUrl.origin}/api/integrations/todoist/tasks`, {
                headers: {
                    Cookie: request.headers.get('cookie') || ''
                }
            });
            if (todoistResponse.ok) {
                const todoistTasks = await todoistResponse.json();
                tasks = todoistTasks.tasks.map((t)=>({
                        id: t.id,
                        title: t.content,
                        description: t.description,
                        priority: t.priority,
                        estimatedMinutes: t.estimatedMinutes || 45,
                        dueDate: t.due?.date ? new Date(t.due.date) : undefined,
                        project: t.project_id
                    }));
            }
        }
        // If no tasks from integrations, check for existing plan tasks
        if (tasks.length === 0) {
            const existingPlan = await __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].dailyPlan.findFirst({
                where: {
                    userId: user.id,
                    date: planDate
                },
                include: {
                    tasks: true
                }
            });
            if (existingPlan) {
                tasks = existingPlan.tasks.map((t)=>({
                        id: t.id,
                        title: t.title,
                        description: t.description || undefined,
                        priority: t.priority,
                        estimatedMinutes: t.estimatedMinutes
                    }));
            }
        }
        // If still no tasks, return error
        if (tasks.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'No tasks available. Please connect Todoist or add tasks manually.'
            }, {
                status: 400
            });
        }
        // Build planning context
        const context = {
            capacityScore: checkIn.capacityScore,
            mode: checkIn.mode,
            tasks,
            history: history.map((h)=>({
                    date: h.date,
                    capacityScore: h.capacityScore,
                    completedTasks: 0,
                    totalTasks: 0
                })),
            goals: goals.length > 0 ? goals : undefined
        };
        // Generate plan using Gemini AI
        const gemini = (0, __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$gemini$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getGeminiClient"])();
        const planningResponse = await gemini.generateDailyPlan(context, new Date(), user.id);
        // Save plan to database
        const plan = await __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].dailyPlan.create({
            data: {
                userId: user.id,
                date: planDate,
                capacityScore: checkIn.capacityScore,
                mode: checkIn.mode,
                geminiReasoning: planningResponse.overallReasoning,
                tasks: {
                    create: planningResponse.orderedTasks.map((t)=>{
                        const task = tasks.find((task)=>task.id === t.taskId);
                        return {
                            externalId: t.taskId,
                            title: task?.title || 'Unknown Task',
                            description: task?.description,
                            priority: task?.priority || 3,
                            estimatedMinutes: task?.estimatedMinutes || 45,
                            scheduledStart: t.scheduledStart,
                            scheduledEnd: t.scheduledEnd
                        };
                    })
                }
            },
            include: {
                tasks: true
            }
        });
        // Sync to Google Calendar if requested
        let calendarSyncResult;
        if (syncToCalendar) {
            const taskSchedules = plan.tasks.map((t)=>({
                    taskId: t.id,
                    title: t.title,
                    description: t.description || undefined,
                    startTime: t.scheduledStart,
                    endTime: t.scheduledEnd,
                    priority: t.priority
                }));
            calendarSyncResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$lib$2f$calendar$2d$sync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncPlanToCalendar"])(user.id, taskSchedules, Intl.DateTimeFormat().resolvedOptions().timeZone);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: 'Daily plan generated successfully',
            plan: {
                id: plan.id,
                date: plan.date,
                capacityScore: plan.capacityScore,
                mode: plan.mode,
                reasoning: plan.geminiReasoning,
                modeRecommendation: planningResponse.modeRecommendation,
                tasks: plan.tasks.map((t)=>({
                        id: t.id,
                        title: t.title,
                        description: t.description,
                        priority: t.priority,
                        estimatedMinutes: t.estimatedMinutes,
                        scheduledStart: t.scheduledStart,
                        scheduledEnd: t.scheduledEnd,
                        completed: t.completed
                    }))
            },
            calendarSync: calendarSyncResult
        }, {
            status: 201
        });
    } catch (error) {
        console.error('Plan generation error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$align$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to generate plan',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ab8f9e45._.js.map