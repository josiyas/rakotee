/*
  Seed an admin user into Supabase Postgres `admins` table.
  Usage:
    Set environment variables:
      PG_CONNECTION  - Postgres connection string (SUPABASE DB) e.g. postgres://user:pass@host:5432/db
      ADMIN_EMAIL    - admin email (default: rakoteeholdings@gmail.com)
      ADMIN_PASSWORD - admin password (default: 2006Josiyas21!)
      ADMIN_ROLE     - admin role (default: superadmin)
    Then run:
      node scripts/seed_admin_pg.js

  This script uses bcrypt to hash the password before inserting.
*/

require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function main() {
  const pgConn = process.env.PG_CONNECTION;
  if (!pgConn) {
    console.error('Error: set PG_CONNECTION environment variable');
    process.exit(1);
  }
  const email = process.env.ADMIN_EMAIL || 'rakoteeholdings@gmail.com';
  const password = process.env.ADMIN_PASSWORD || '2006Josiyas21!';
  const role = process.env.ADMIN_ROLE || 'superadmin';

  const client = new Client({ connectionString: pgConn });
  await client.connect();

  // Check for existing admin
  const { rows } = await client.query('select id from admins where lower(email)=lower($1) limit 1', [email]);
  if (rows.length > 0) {
    console.log('Admin already exists with email:', email);
    await client.end();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const now = new Date().toISOString();
  const insert = `insert into admins (email, password_hash, role, created_at, updated_at) values ($1,$2,$3,$4,$5) returning id`;
  const res = await client.query(insert, [email, hash, role, now, now]);
  console.log('Created admin id:', res.rows[0].id);
  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
