"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_kit_1 = require("drizzle-kit");
exports.default = (0, drizzle_kit_1.defineConfig)({
    dialect: 'postgresql',
    schema: './src/db/schema.ts',
    out: './drizzle',
    dbCredentials: {
        url: 'postgresql://gamelog:gamelog@localhost:5433/gamelog',
    },
});
//# sourceMappingURL=drizzle.config.js.map