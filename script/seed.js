"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
const schema_1 = require("../src/db/schema");
const rawg_schema_1 = require("../src/games/dto/rawg.schema");
dotenv.config();
const PAGE_SIZE = 40;
const TARGET_COUNT = 1000;
const DELAY_MS = 300;
async function insertGames(db, rawgGames) {
    const values = rawgGames.map((g) => ({
        externalId: g.id,
        title: g.name,
        coverUrl: g.background_image,
        releaseYear: g.released ? new Date(g.released).getFullYear() : null,
        platform: g.platforms?.[0]?.platform.name ?? null,
        metacriticRating: g.metacritic,
        popularity: g.added,
        genres: g.genres.map((genre) => genre.name),
    }));
    await db
        .insert(schema_1.games)
        .values(values)
        .onConflictDoNothing({ target: schema_1.games.externalId });
}
async function importTopGames() {
    const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
    const db = (0, node_postgres_1.drizzle)(pool);
    const apiKey = process.env.RAWG_API_KEY;
    if (!apiKey) {
        console.error('RAWG_API_KEY manquant dans .env');
        process.exit(1);
    }
    let imported = 0;
    let page = 1;
    console.log(`Démarrage import RAWG (cible : ${TARGET_COUNT} jeux)...`);
    while (imported < TARGET_COUNT) {
        const url = `https://api.rawg.io/api/games?key=${apiKey}&ordering=-added&page_size=${PAGE_SIZE}&page=${page}`;
        const response = await fetch(url);
        const rawData = await response.json();
        const parsed = rawg_schema_1.rawgResponseSchema.safeParse(rawData);
        if (!parsed.success) {
            console.error("Réponse RAWG invalide, arrêt de l'import:", parsed.error.format());
            break;
        }
        await insertGames(db, parsed.data.results);
        imported += parsed.data.results.length;
        console.log(`Page ${page} traitée — ${imported} jeux importés jusqu'ici`);
        if (!parsed.data.next) {
            console.log('Plus de pages disponibles côté RAWG.');
            break;
        }
        page++;
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
    console.log(`Import terminé : ${imported} jeux traités.`);
    await pool.end();
}
importTopGames().catch((err) => {
    console.error("Erreur pendant l'import:", err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map