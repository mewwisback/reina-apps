import {pgTable,uuid,text,timestamp,uniqueIndex} from 'drizzle-orm/pg-core';
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
