import {pgTable,uuid,text,timestamp,uniqueIndex,index,check,unique} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';
export const accounts=pgTable('accounts',{
 id:uuid('id').primaryKey().defaultRandom(),
 createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),
});
export const authIdentities=pgTable('auth_identities',{
 id:uuid('id').primaryKey().defaultRandom(),
 accountId:uuid('account_id').notNull().references(()=>accounts.id),
 provider:text('provider').notNull(),
 subject:text('subject').notNull(),
},table=>[uniqueIndex('identity_provider_subject').on(table.provider,table.subject)]);
export const cardDefinitions=pgTable('card_definitions',{
 id:uuid('id').primaryKey().defaultRandom(),category:text('category').notNull(),
},t=>[check('card_definitions_category_check',sql`${t.category} IN ('Hero','Spell','Trap')`)]);
export const inventoryItems=pgTable('inventory_items',{
 id:uuid('id').primaryKey().defaultRandom(),
 ownerAccountId:uuid('owner_account_id').notNull().references(()=>accounts.id),
 cardId:uuid('card_id').notNull().references(()=>cardDefinitions.id),
 state:text('state').notNull().default('available'),
 createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),
},t=>[index('inventory_owner').on(t.ownerAccountId),check('inventory_items_state_check',sql`${t.state} IN ('available','locked','consumed')`)]);
export const operations=pgTable('operations',{
 id:uuid('id').primaryKey().defaultRandom(),
 accountId:uuid('account_id').notNull().references(()=>accounts.id),
 operationKey:text('operation_key').notNull(),requestHash:text('request_hash').notNull(),
 createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),
},t=>[unique().on(t.accountId,t.operationKey),check('operations_operation_key_check',sql`length(${t.operationKey}) BETWEEN 1 AND 128`),check('operations_request_hash_check',sql`${t.requestHash} ~ '^[a-f0-9]{64}$'`)]);
