import path from 'path';
import dotenv from "dotenv";

const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: envFile });

const configPath = path.join(process.cwd(), "vortexconfig.js");

export default class {
    static getMainFolderLocation() {
        return process.cwd();
    }

    static getDefaultConfig() {
        return {
            "database": {
                "port": 3306,
                "host": "localhost",
                "user": "root",
                "password": "root",
                "database": "main_dev"
            },
            "migrationsLocation": "./migrations",
            "migrationsHistorySavingStrategy": "database"
        };
    }

    static async getConfiguration() {
        const { vortexConfig } = await import(configPath);
        const config = JSON.parse(JSON.stringify(vortexConfig))
        this.validateConfiguration(config);
        return config;
    }

    static validateConfiguration(config) {
        if (config.hasOwnProperty('database') === false) {
            throw new Error('Missing database configuration object in vortexconfig.js.');
        }

        const databaseConfig = config.database;

        if (databaseConfig.hasOwnProperty('host') === false) {
            throw new Error('Missing configuration value: database.host');
        }
        if (databaseConfig.hasOwnProperty('port') === false) {
            throw new Error('Missing configuration value: database.port');
        }
        if (databaseConfig.hasOwnProperty('user') === false) {
            throw new Error('Missing configuration value: database.user');
        }
        if (databaseConfig.hasOwnProperty('password') === false) {
            throw new Error('Missing configuration value: database.password');
        }
        if (databaseConfig.hasOwnProperty('database') === false) {
            throw new Error('Missing configuration value: database.database');
        }

        if (config.hasOwnProperty('migrationsLocation') === false) {
            config['migrationsLocation'] = 'migrations';
        }

        if (config.hasOwnProperty('migrationsHistorySavingStrategy') === false) {
            config['migrationsHistorySavingStrategy'] = 'filesystem';
        } else {
            if (['filesystem', 'database'].includes(config.migrationsHistorySavingStrategy) === false) {
                throw new Error('Invalid value for migrations history strategy, authorized values are: database, filesystem.');
            }
        }
    }
}
