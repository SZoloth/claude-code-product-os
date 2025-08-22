/**
 * SQL export functionality
 * Generates SQL DDL, DML, and migration scripts
 */

import type { DataDictionary, DataDictionaryEvent, EventProperty } from '../schema/dataDictionary'

export interface SqlExportOptions {
  dialect?: 'postgresql' | 'mysql' | 'sqlite' | 'mssql' | 'bigquery'
  includeIndexes?: boolean
  includeConstraints?: boolean
  includeComments?: boolean
  generateMigrations?: boolean
  tablePrefix?: string
  schemaName?: string
}

export interface SqlExportResult {
  ddl: string
  dml?: string
  migrations?: string[]
  filename: string
  tableCount: number
  indexCount: number
  constraintCount: number
}

export class SqlExporter {
  /**
   * Export data dictionary as SQL DDL
   */
  static exportToSql(
    dictionary: DataDictionary,
    options: SqlExportOptions = {}
  ): SqlExportResult {
    const {
      dialect = 'postgresql',
      includeIndexes = true,
      includeConstraints = true,
      includeComments = true,
      generateMigrations = false,
      tablePrefix = '',
      schemaName = 'analytics'
    } = options

    let ddl = ''
    let tableCount = 0
    let indexCount = 0
    let constraintCount = 0
    const migrations: string[] = []

    // Schema creation
    ddl += this.createSchemaStatement(schemaName, dialect)
    ddl += '\n\n'

    // Events table
    const eventsTable = this.createEventsTable(tablePrefix, schemaName, dialect, includeComments)
    ddl += eventsTable.ddl
    tableCount++
    if (includeConstraints) {
      constraintCount += eventsTable.constraints
    }

    // Event properties table
    const propertiesTable = this.createEventPropertiesTable(tablePrefix, schemaName, dialect, includeComments)
    ddl += propertiesTable.ddl
    tableCount++
    if (includeConstraints) {
      constraintCount += propertiesTable.constraints
    }

    // Event instances table (for tracking actual event occurrences)
    const instancesTable = this.createEventInstancesTable(tablePrefix, schemaName, dialect, includeComments)
    ddl += instancesTable.ddl
    tableCount++
    if (includeConstraints) {
      constraintCount += instancesTable.constraints
    }

    // Indexes
    if (includeIndexes) {
      const indexes = this.createIndexes(tablePrefix, schemaName, dialect)
      ddl += indexes.ddl
      indexCount = indexes.count
    }

    // Views
    const views = this.createViews(tablePrefix, schemaName, dialect)
    ddl += views

    // Insert data
    const dml = this.createInsertStatements(dictionary, tablePrefix, schemaName, dialect)

    // Migrations
    if (generateMigrations) {
      migrations.push(...this.createMigrations(dictionary, options))
    }

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `analytics-schema-${dialect}-${timestamp}.sql`

    return {
      ddl,
      dml,
      migrations,
      filename,
      tableCount,
      indexCount,
      constraintCount
    }
  }

  /**
   * Generate BigQuery schema
   */
  static exportToBigQuery(
    dictionary: DataDictionary,
    options: Omit<SqlExportOptions, 'dialect'> = {}
  ): SqlExportResult {
    return this.exportToSql(dictionary, { ...options, dialect: 'bigquery' })
  }

  /**
   * Generate data warehouse schema
   */
  static exportToDataWarehouse(
    dictionary: DataDictionary,
    warehouseType: 'snowflake' | 'redshift' | 'bigquery',
    options: SqlExportOptions = {}
  ): SqlExportResult {
    const dialectMap = {
      snowflake: 'postgresql', // Similar syntax
      redshift: 'postgresql',  // PostgreSQL-based
      bigquery: 'bigquery'
    }

    return this.exportToSql(dictionary, {
      ...options,
      dialect: dialectMap[warehouseType] as any,
      schemaName: options.schemaName || 'analytics_events'
    })
  }

  private static createSchemaStatement(schemaName: string, dialect: string): string {
    switch (dialect) {
      case 'mysql':
        return `CREATE DATABASE IF NOT EXISTS \`${schemaName}\`;\nUSE \`${schemaName}\`;`
      case 'sqlite':
        return `-- SQLite does not require explicit schema creation`
      case 'bigquery':
        return `-- BigQuery dataset: ${schemaName}`
      default: // postgresql, mssql
        return `CREATE SCHEMA IF NOT EXISTS ${schemaName};`
    }
  }

  private static createEventsTable(
    prefix: string,
    schema: string,
    dialect: string,
    includeComments: boolean
  ): { ddl: string; constraints: number } {
    const tableName = `${prefix}events`
    const fullTableName = dialect === 'sqlite' ? tableName : `${schema}.${tableName}`
    
    let ddl = `CREATE TABLE ${fullTableName} (\n`
    
    // Columns based on dialect
    switch (dialect) {
      case 'bigquery':
        ddl += `  event_id STRING NOT NULL,\n`
        ddl += `  event_name STRING NOT NULL,\n`
        ddl += `  event_type STRING NOT NULL,\n`
        ddl += `  event_action_type STRING NOT NULL,\n`
        ddl += `  event_purpose STRING,\n`
        ddl += `  when_to_fire STRING,\n`
        ddl += `  actor STRING,\n`
        ddl += `  object STRING,\n`
        ddl += `  context_surface STRING,\n`
        ddl += `  lifecycle_status STRING NOT NULL,\n`
        ddl += `  datadog_api STRING,\n`
        ddl += `  error_code STRING,\n`
        ddl += `  error_message STRING,\n`
        ddl += `  notes STRING,\n`
        ddl += `  context_keys ARRAY<STRING>,\n`
        ddl += `  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),\n`
        ddl += `  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP()\n`
        break
      
      case 'postgresql':
        ddl += `  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`
        ddl += `  event_name VARCHAR(255) NOT NULL UNIQUE,\n`
        ddl += `  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('intent', 'success', 'failure')),\n`
        ddl += `  event_action_type VARCHAR(50) NOT NULL CHECK (event_action_type IN ('action', 'view', 'error')),\n`
        ddl += `  event_purpose TEXT,\n`
        ddl += `  when_to_fire TEXT,\n`
        ddl += `  actor VARCHAR(255),\n`
        ddl += `  object VARCHAR(255),\n`
        ddl += `  context_surface VARCHAR(255),\n`
        ddl += `  lifecycle_status VARCHAR(50) NOT NULL CHECK (lifecycle_status IN ('proposed', 'approved', 'implemented', 'deprecated')),\n`
        ddl += `  datadog_api VARCHAR(255),\n`
        ddl += `  error_code VARCHAR(255),\n`
        ddl += `  error_message TEXT,\n`
        ddl += `  notes TEXT,\n`
        ddl += `  context_keys TEXT[],\n`
        ddl += `  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),\n`
        ddl += `  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()\n`
        break
      
      case 'mysql':
        ddl += `  event_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),\n`
        ddl += `  event_name VARCHAR(255) NOT NULL UNIQUE,\n`
        ddl += `  event_type ENUM('intent', 'success', 'failure') NOT NULL,\n`
        ddl += `  event_action_type ENUM('action', 'view', 'error') NOT NULL,\n`
        ddl += `  event_purpose TEXT,\n`
        ddl += `  when_to_fire TEXT,\n`
        ddl += `  actor VARCHAR(255),\n`
        ddl += `  object VARCHAR(255),\n`
        ddl += `  context_surface VARCHAR(255),\n`
        ddl += `  lifecycle_status ENUM('proposed', 'approved', 'implemented', 'deprecated') NOT NULL,\n`
        ddl += `  datadog_api VARCHAR(255),\n`
        ddl += `  error_code VARCHAR(255),\n`
        ddl += `  error_message TEXT,\n`
        ddl += `  notes TEXT,\n`
        ddl += `  context_keys JSON,\n`
        ddl += `  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,\n`
        ddl += `  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n`
        break
      
      default: // sqlite
        ddl += `  event_id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),\n`
        ddl += `  event_name TEXT NOT NULL UNIQUE,\n`
        ddl += `  event_type TEXT NOT NULL CHECK (event_type IN ('intent', 'success', 'failure')),\n`
        ddl += `  event_action_type TEXT NOT NULL CHECK (event_action_type IN ('action', 'view', 'error')),\n`
        ddl += `  event_purpose TEXT,\n`
        ddl += `  when_to_fire TEXT,\n`
        ddl += `  actor TEXT,\n`
        ddl += `  object TEXT,\n`
        ddl += `  context_surface TEXT,\n`
        ddl += `  lifecycle_status TEXT NOT NULL CHECK (lifecycle_status IN ('proposed', 'approved', 'implemented', 'deprecated')),\n`
        ddl += `  datadog_api TEXT,\n`
        ddl += `  error_code TEXT,\n`
        ddl += `  error_message TEXT,\n`
        ddl += `  notes TEXT,\n`
        ddl += `  context_keys TEXT,\n`
        ddl += `  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n`
        ddl += `  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP\n`
    }
    
    ddl += `);\n\n`

    if (includeComments && dialect !== 'sqlite') {
      ddl += `COMMENT ON TABLE ${fullTableName} IS 'Analytics events definition table';\n`
      ddl += `COMMENT ON COLUMN ${fullTableName}.event_name IS 'Unique identifier for the event';\n`
      ddl += `COMMENT ON COLUMN ${fullTableName}.event_type IS 'Type of event: intent, success, or failure';\n`
      ddl += `COMMENT ON COLUMN ${fullTableName}.lifecycle_status IS 'Current implementation status';\n\n`
    }

    return { ddl, constraints: dialect === 'postgresql' ? 4 : (dialect === 'mysql' ? 0 : 4) }
  }

  private static createEventPropertiesTable(
    prefix: string,
    schema: string,
    dialect: string,
    includeComments: boolean
  ): { ddl: string; constraints: number } {
    const tableName = `${prefix}event_properties`
    const eventsTableName = `${prefix}events`
    const fullTableName = dialect === 'sqlite' ? tableName : `${schema}.${tableName}`
    const fullEventsTableName = dialect === 'sqlite' ? eventsTableName : `${schema}.${eventsTableName}`
    
    let ddl = `CREATE TABLE ${fullTableName} (\n`
    
    switch (dialect) {
      case 'bigquery':
        ddl += `  property_id STRING NOT NULL,\n`
        ddl += `  event_id STRING NOT NULL,\n`
        ddl += `  property_name STRING NOT NULL,\n`
        ddl += `  property_type STRING NOT NULL,\n`
        ddl += `  is_required BOOL NOT NULL DEFAULT FALSE,\n`
        ddl += `  example_value STRING,\n`
        ddl += `  description STRING,\n`
        ddl += `  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP()\n`
        break
      
      case 'postgresql':
        ddl += `  property_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`
        ddl += `  event_id UUID NOT NULL REFERENCES ${fullEventsTableName}(event_id) ON DELETE CASCADE,\n`
        ddl += `  property_name VARCHAR(255) NOT NULL,\n`
        ddl += `  property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('string', 'number', 'boolean', 'array', 'object')),\n`
        ddl += `  is_required BOOLEAN NOT NULL DEFAULT FALSE,\n`
        ddl += `  example_value TEXT,\n`
        ddl += `  description TEXT,\n`
        ddl += `  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),\n`
        ddl += `  UNIQUE(event_id, property_name)\n`
        break
      
      case 'mysql':
        ddl += `  property_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),\n`
        ddl += `  event_id CHAR(36) NOT NULL,\n`
        ddl += `  property_name VARCHAR(255) NOT NULL,\n`
        ddl += `  property_type ENUM('string', 'number', 'boolean', 'array', 'object') NOT NULL,\n`
        ddl += `  is_required BOOLEAN NOT NULL DEFAULT FALSE,\n`
        ddl += `  example_value TEXT,\n`
        ddl += `  description TEXT,\n`
        ddl += `  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,\n`
        ddl += `  UNIQUE KEY unique_event_property (event_id, property_name),\n`
        ddl += `  FOREIGN KEY (event_id) REFERENCES ${fullEventsTableName}(event_id) ON DELETE CASCADE\n`
        break
      
      default: // sqlite
        ddl += `  property_id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),\n`
        ddl += `  event_id TEXT NOT NULL REFERENCES ${fullEventsTableName}(event_id) ON DELETE CASCADE,\n`
        ddl += `  property_name TEXT NOT NULL,\n`
        ddl += `  property_type TEXT NOT NULL CHECK (property_type IN ('string', 'number', 'boolean', 'array', 'object')),\n`
        ddl += `  is_required INTEGER NOT NULL DEFAULT 0,\n`
        ddl += `  example_value TEXT,\n`
        ddl += `  description TEXT,\n`
        ddl += `  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n`
        ddl += `  UNIQUE(event_id, property_name)\n`
    }
    
    ddl += `);\n\n`

    if (includeComments && dialect !== 'sqlite') {
      ddl += `COMMENT ON TABLE ${fullTableName} IS 'Properties defined for each analytics event';\n\n`
    }

    return { ddl, constraints: 2 }
  }

  private static createEventInstancesTable(
    prefix: string,
    schema: string,
    dialect: string,
    includeComments: boolean
  ): { ddl: string; constraints: number } {
    const tableName = `${prefix}event_instances`
    const fullTableName = dialect === 'sqlite' ? tableName : `${schema}.${tableName}`
    
    let ddl = `CREATE TABLE ${fullTableName} (\n`
    
    switch (dialect) {
      case 'bigquery':
        ddl += `  instance_id STRING NOT NULL,\n`
        ddl += `  event_name STRING NOT NULL,\n`
        ddl += `  user_id STRING,\n`
        ddl += `  session_id STRING,\n`
        ddl += `  timestamp TIMESTAMP NOT NULL,\n`
        ddl += `  properties JSON,\n`
        ddl += `  source STRING,\n`
        ddl += `  environment STRING,\n`
        ddl += `  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP()\n`
        break
      
      case 'postgresql':
        ddl += `  instance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`
        ddl += `  event_name VARCHAR(255) NOT NULL,\n`
        ddl += `  user_id VARCHAR(255),\n`
        ddl += `  session_id VARCHAR(255),\n`
        ddl += `  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,\n`
        ddl += `  properties JSONB,\n`
        ddl += `  source VARCHAR(255),\n`
        ddl += `  environment VARCHAR(50),\n`
        ddl += `  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()\n`
        break
      
      case 'mysql':
        ddl += `  instance_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),\n`
        ddl += `  event_name VARCHAR(255) NOT NULL,\n`
        ddl += `  user_id VARCHAR(255),\n`
        ddl += `  session_id VARCHAR(255),\n`
        ddl += `  timestamp TIMESTAMP NOT NULL,\n`
        ddl += `  properties JSON,\n`
        ddl += `  source VARCHAR(255),\n`
        ddl += `  environment VARCHAR(50),\n`
        ddl += `  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP\n`
        break
      
      default: // sqlite
        ddl += `  instance_id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),\n`
        ddl += `  event_name TEXT NOT NULL,\n`
        ddl += `  user_id TEXT,\n`
        ddl += `  session_id TEXT,\n`
        ddl += `  timestamp DATETIME NOT NULL,\n`
        ddl += `  properties TEXT,\n`
        ddl += `  source TEXT,\n`
        ddl += `  environment TEXT,\n`
        ddl += `  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP\n`
    }
    
    ddl += `);\n\n`

    if (includeComments && dialect !== 'sqlite') {
      ddl += `COMMENT ON TABLE ${fullTableName} IS 'Actual analytics event instances/occurrences';\n\n`
    }

    return { ddl, constraints: 0 }
  }

  private static createIndexes(
    prefix: string,
    schema: string,
    dialect: string
  ): { ddl: string; count: number } {
    const eventsTable = dialect === 'sqlite' ? `${prefix}events` : `${schema}.${prefix}events`
    const propertiesTable = dialect === 'sqlite' ? `${prefix}event_properties` : `${schema}.${prefix}event_properties`
    const instancesTable = dialect === 'sqlite' ? `${prefix}event_instances` : `${schema}.${prefix}event_instances`
    
    let ddl = `-- Indexes for performance\n`
    let count = 0

    // Events table indexes
    ddl += `CREATE INDEX idx_${prefix}events_type ON ${eventsTable}(event_type);\n`
    ddl += `CREATE INDEX idx_${prefix}events_status ON ${eventsTable}(lifecycle_status);\n`
    ddl += `CREATE INDEX idx_${prefix}events_name ON ${eventsTable}(event_name);\n`
    count += 3

    // Properties table indexes
    ddl += `CREATE INDEX idx_${prefix}properties_event_id ON ${propertiesTable}(event_id);\n`
    ddl += `CREATE INDEX idx_${prefix}properties_name ON ${propertiesTable}(property_name);\n`
    count += 2

    // Instances table indexes
    ddl += `CREATE INDEX idx_${prefix}instances_event_name ON ${instancesTable}(event_name);\n`
    ddl += `CREATE INDEX idx_${prefix}instances_timestamp ON ${instancesTable}(timestamp);\n`
    ddl += `CREATE INDEX idx_${prefix}instances_user_id ON ${instancesTable}(user_id);\n`
    ddl += `CREATE INDEX idx_${prefix}instances_session_id ON ${instancesTable}(session_id);\n`
    
    if (dialect === 'postgresql') {
      ddl += `CREATE INDEX idx_${prefix}instances_properties ON ${instancesTable} USING GIN (properties);\n`
    }
    
    count += dialect === 'postgresql' ? 5 : 4
    ddl += `\n`

    return { ddl, count }
  }

  private static createViews(prefix: string, schema: string, dialect: string): string {
    const eventsTable = dialect === 'sqlite' ? `${prefix}events` : `${schema}.${prefix}events`
    const propertiesTable = dialect === 'sqlite' ? `${prefix}event_properties` : `${schema}.${prefix}event_properties`
    const instancesTable = dialect === 'sqlite' ? `${prefix}event_instances` : `${schema}.${prefix}event_instances`
    const viewName = dialect === 'sqlite' ? `${prefix}events_with_properties` : `${schema}.${prefix}events_with_properties`
    
    let ddl = `-- Views for common queries\n`
    
    ddl += `CREATE VIEW ${viewName} AS\n`
    ddl += `SELECT \n`
    ddl += `  e.event_id,\n`
    ddl += `  e.event_name,\n`
    ddl += `  e.event_type,\n`
    ddl += `  e.event_action_type,\n`
    ddl += `  e.lifecycle_status,\n`
    ddl += `  COUNT(p.property_id) as property_count,\n`
    ddl += `  COUNT(CASE WHEN p.is_required THEN 1 END) as required_properties\n`
    ddl += `FROM ${eventsTable} e\n`
    ddl += `LEFT JOIN ${propertiesTable} p ON e.event_id = p.event_id\n`
    ddl += `GROUP BY e.event_id, e.event_name, e.event_type, e.event_action_type, e.lifecycle_status;\n\n`

    return ddl
  }

  private static createInsertStatements(
    dictionary: DataDictionary,
    prefix: string,
    schema: string,
    dialect: string
  ): string {
    const eventsTable = dialect === 'sqlite' ? `${prefix}events` : `${schema}.${prefix}events`
    const propertiesTable = dialect === 'sqlite' ? `${prefix}event_properties` : `${schema}.${prefix}event_properties`
    
    let dml = `-- Insert event definitions\n`
    
    for (const event of dictionary.events) {
      // Insert event
      dml += `INSERT INTO ${eventsTable} (\n`
      dml += `  event_name, event_type, event_action_type, event_purpose,\n`
      dml += `  when_to_fire, actor, object, context_surface, lifecycle_status,\n`
      dml += `  datadog_api, error_code, error_message, notes\n`
      dml += `) VALUES (\n`
      dml += `  ${this.sqlString(event.event_name)},\n`
      dml += `  ${this.sqlString(event.event_type)},\n`
      dml += `  ${this.sqlString(event.event_action_type)},\n`
      dml += `  ${this.sqlString(event.event_purpose)},\n`
      dml += `  ${this.sqlString(event.when_to_fire)},\n`
      dml += `  ${this.sqlString(event.actor)},\n`
      dml += `  ${this.sqlString(event.object)},\n`
      dml += `  ${this.sqlString(event.context_surface)},\n`
      dml += `  ${this.sqlString(event.lifecycle_status)},\n`
      dml += `  ${this.sqlString(event.datadog_api)},\n`
      dml += `  ${this.sqlString(event.error_code)},\n`
      dml += `  ${this.sqlString(event.error_message)},\n`
      dml += `  ${this.sqlString(event.notes)}\n`
      dml += `);\n\n`

      // Insert properties
      for (const property of event.properties) {
        dml += `INSERT INTO ${propertiesTable} (\n`
        dml += `  event_id, property_name, property_type, is_required,\n`
        dml += `  example_value, description\n`
        dml += `) VALUES (\n`
        dml += `  (SELECT event_id FROM ${eventsTable} WHERE event_name = ${this.sqlString(event.event_name)}),\n`
        dml += `  ${this.sqlString(property.name)},\n`
        dml += `  ${this.sqlString(property.type)},\n`
        dml += `  ${property.required ? 'TRUE' : 'FALSE'},\n`
        dml += `  ${this.sqlString(property.example)},\n`
        dml += `  ${this.sqlString(property.description)}\n`
        dml += `);\n\n`
      }
    }

    return dml
  }

  private static createMigrations(dictionary: DataDictionary, options: SqlExportOptions): string[] {
    const migrations = []
    
    // Initial schema migration
    migrations.push(`-- Migration: Create analytics events schema
${this.exportToSql(dictionary, { ...options, generateMigrations: false }).ddl}`)

    // Add additional migrations as needed
    migrations.push(`-- Migration: Add indexes for performance
-- This migration would contain index creation statements`)

    return migrations
  }

  private static sqlString(value: string | number | boolean | undefined | null): string {
    if (value === undefined || value === null || value === '') {
      return 'NULL'
    }
    const stringValue = String(value)
    return `'${stringValue.replace(/'/g, "''")}'`
  }
}