import mysql from 'mysql2/promise';

import Configuration from './Configuration.js';
import Migration from "../lib/Migration.js";

let instance = null

export default class {
    static async getInstance() {
        if (instance === null) {
            const config = await Configuration.getConfiguration();
            const databaseConfig = config.database;

            instance = mysql.createConnection(databaseConfig);
        }

        return instance;
    }

    static async executeQuery(query) {
        const connection = await this.getInstance();
        const [results] = await connection.execute(query); // Use the promise-based execute
        return results;
    }

    static async end() {
        if (instance !== null) {
            const connection = await this.getInstance();
            await connection.end(); // This should work with promise-based connections
        }
    }

    /**
     * @param { Migration } migration
     */
    static async executeMigrationUp(migration) {
        migration.up();

        await this.#executeMigration(migration);
    }

    /**
     * @param { Migration } migration
     */
    static async executeMigrationDown(migration) {
        migration.down();

        await this.#executeMigration(migration);
    }

    /**
     * @param { Migration } migration
     */
    static async #executeMigration(migration) {
        const queryCount = migration.getQueries().length;

        console.log(`Executing migration ${migration.getVersion()} - ${queryCount} ${queryCount > 1 ? 'queries' : 'query'}.`);
        const start = Date.now();

        for (let query of migration.getQueries()) {
            await this.executeQuery(query);
        }

        const end = Date.now();
        const milliseconds = end - start;

        console.log(`Migrated in ${milliseconds} ms.\n`);
    }
}
