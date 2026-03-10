#!/bin/bash

# Exit on error
set -e

CUR_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to display usage
show_usage() {
    echo "Usage: $0 [command] [options]"
    echo "Commands:"
    echo "  init [project_name]                 Initialize a new NestJS project"
    echo "  generate [module_name]              Generate a new NestJS module"
    echo "  get-jwt-key                         Generate JWT private keys"
    echo "  backup-database                     Backup the database"
    echo "  restore-database                    Restore the database"
    echo "  migration create:structure [name]   Create structure migration"
    echo "  migration create:data [name]        Create data migration"
    echo "  migration run                       Run migrations"
    echo "  migration revert                    Revert migrations"
}

initNestProject() {
    local name=$1
    if [ -z "$name" ]; then
        echo "Error: Project name is required"
        show_usage
        exit 1
    fi

    npm i -g @nestjs/cli
    nest new --strict "$name"
}

initNestGraphQL() {
    npm i @apollo/server graphql @nestjs/apollo @nestjs/graphql
}

generateNestModule() {
    local name=$1
    if [ -z "$name" ]; then
        echo "Error: Module name is required"
        show_usage
        exit 1
    fi

    nest generate module "$name" modules
    nest generate resolver "$name" modules
    nest generate service "$name" modules

    touch "$CUR_DIR/src/modules/$name/$name.repository.ts"
    mkdir -p "$CUR_DIR/src/modules/$name/inputs"
    touch "$CUR_DIR/src/modules/$name/inputs/create-$name.input.ts"
    touch "$CUR_DIR/src/modules/$name/inputs/update-$name.input.ts"
    mkdir -p "$CUR_DIR/src/modules/$name/entities"
    touch "$CUR_DIR/src/modules/$name/entities/$name.entity.ts"
}

generateJwtPrivateKey() {
    openssl genpkey -algorithm RSA -out refresh-token.private.key
    openssl genpkey -algorithm RSA -out access-token.private_key.pem
    openssl rsa -pubout -in access-token.private_key.pem -out access-token.public_key.pem
}

backupDatabase() {
    if [ -z "$PGPASSWORD" ]; then
        export PGPASSWORD="phandangluu.07061993"
    fi

    pg_dump -h localhost -p 5432 -U admin -d photocopy -n public -F c -f ./src/database/backup_database/database_backup.dump
}

restoreDatabase() {
    if [ -z "$PGPASSWORD" ]; then
        export PGPASSWORD="phandangluu.07061993"
    fi

    pg_restore -h localhost -p 5432 -U admin -d photocopy -n public --clean --create ./backup_database/database_backup.dump
}

createStructureMigration() {
    local name=$1
    if [ -z "$name" ]; then
        echo "Error: Migration name is required"
        show_usage
        exit 1
    fi

    FILE_NAME="$name" npm run migration:create
}

createDataMigration() {
    local name=$1
    if [ -z "$name" ]; then
        echo "Error: Migration name is required"
        show_usage
        exit 1
    fi

    FILE_NAME="$name" npm run migration:create:data
}

runMigration() {
    npm run migration:run
}

revertMigration() {
    npm run migration:revert
}

startDependencies() {
    docker compose -f "$CUR_DIR/database/docker-compose.yml" up -d
    docker compose -f "$CUR_DIR/kafka/docker-compose.yml" up -d
}

# Main script logic
if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

case "$1" in
    init)
        initNestProject "$2"
        ;;
    generate)
        generateNestModule "$2"
        ;;
    get-jwt-key)
        generateJwtPrivateKey
        ;;
    database)
        case "$2" in
            backup)
                backupDatabase
                ;;
            restore)
                restoreDatabase
                ;;
            *)
                echo "Error: Unknown database command"
                show_usage
                exit 1
                ;;
        esac
        ;;
    start-dependencies)
        startDependencies
        ;;
    migration)
        case "$2" in
            create:structure)
                createStructureMigration "$3"
                ;;
            create:data)
                createDataMigration "$3"
                ;;
            run)
                runMigration
                ;;
            revert)
                revertMigration
                ;;
            *)
                echo "Error: Unknown migration command"
                show_usage
                exit 1
                ;;
        esac
        ;;
    *)
        echo "Error: Unknown command"
        show_usage
        exit 1
        ;;
esac

# https://github.com/Ho-s/NestJS-GraphQL-TypeORM-PostgresQL/tree/main