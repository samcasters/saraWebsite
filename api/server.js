'use strict';

const http = require('http');
const neo4j = require('neo4j-driver');
const { isIsoDate, isMonth, cleanGuestName, cleanNote } = require('./validate');

const port = Number(process.env.PORT || 3000);
const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;

if (!uri || !user || !password) {
  console.error('NEO4J_URI, NEO4J_USER and NEO4J_PASSWORD are required');
  process.exit(1);
}

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

function send(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(data),
  });
  res.end(data);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 8192) {
        reject(Object.assign(new Error('Body too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (chunks.length === 0) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(Object.assign(new Error('Expected JSON'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

async function withSession(fn) {
  const session = driver.session();
  try {
    return await fn(session);
  } finally {
    await session.close();
  }
}

function asNumber(value) {
  return neo4j.isInt(value) ? value.toNumber() : value;
}

async function health() {
  await withSession((session) => session.run('RETURN 1 AS ok'));
  return { ok: true };
}

async function house() {
  const result = await withSession((session) => session.run(`
    MATCH (h:House {id: 'sara'})
    OPTIONAL MATCH (h)-[:HAS_PHOTO]->(p:Photo)
    RETURN h.name AS name, h.summary AS summary, h.location AS location,
           collect({file: p.file, caption: p.caption, sort: p.sort}) AS photos
  `));
  const row = result.records[0];
  if (!row || row.get('name') == null) {
    throw Object.assign(new Error('House is not loaded yet'), { status: 404 });
  }
  const photos = row.get('photos')
    .filter((photo) => photo.file)
    .map((photo) => ({
      file: photo.file,
      url: `/photos/${photo.file}`,
      caption: photo.caption,
      sort: asNumber(photo.sort) ?? 0,
    }))
    .sort((a, b) => a.sort - b.sort);
  return {
    name: row.get('name'),
    summary: row.get('summary'),
    location: row.get('location'),
    photos,
  };
}

async function activities() {
  const result = await withSession((session) => session.run(`
    MATCH (:House {id: 'sara'})-[r:NEAR]->(a:Activity)
    RETURN a.name AS name, a.kind AS kind, a.summary AS summary, r.note AS note
    ORDER BY a.name
  `));
  return result.records.map((row) => ({
    name: row.get('name'),
    kind: row.get('kind'),
    summary: row.get('summary'),
    note: row.get('note'),
  }));
}

async function availability(month) {
  const result = await withSession((session) => session.run(`
    MATCH (:House {id: 'sara'})-[:OFFERS]->(d:Day)
    WHERE d.date STARTS WITH $month
    OPTIONAL MATCH (b:Booking)-[:ON]->(d)
    RETURN d.date AS date, count(b) > 0 AS taken
    ORDER BY d.date
  `, { month }));
  return {
    month,
    days: result.records.map((row) => ({
      date: row.get('date'),
      taken: Boolean(row.get('taken')),
    })),
  };
}

async function createBooking({ date, guestName, note }) {
  return withSession(async (session) => {
    const found = await session.executeRead((tx) => tx.run(`
      MATCH (:House {id: 'sara'})-[:OFFERS]->(d:Day {date: $date})
      OPTIONAL MATCH (b:Booking)-[:ON]->(d)
      RETURN count(b) AS bookings
    `, { date }));
    if (found.records.length === 0) {
      throw Object.assign(new Error('That date is not open for booking.'), { status: 404 });
    }
    if (asNumber(found.records[0].get('bookings')) > 0) {
      throw Object.assign(new Error('That date is already booked.'), { status: 409 });
    }
    const id = crypto.randomUUID();
    const created = await session.executeWrite((tx) => tx.run(`
      MATCH (h:House {id: 'sara'})-[:OFFERS]->(d:Day {date: $date})
      OPTIONAL MATCH (existing:Booking)-[:ON]->(d)
      WITH h, d, existing
      WHERE existing IS NULL
      CREATE (b:Booking {
        id: $id,
        guestName: $guestName,
        note: $note,
        createdAt: datetime()
      })
      CREATE (b)-[:ON]->(d)
      CREATE (b)-[:AT]->(h)
      RETURN b.id AS id
    `, { date, guestName, note, id }));
    if (created.records.length === 0) {
      throw Object.assign(new Error('That date is already booked.'), { status: 409 });
    }
    return { id, date, guestName };
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (req.method === 'GET' && url.pathname === '/api/health') {
      return send(res, 200, await health());
    }
    if (req.method === 'GET' && url.pathname === '/api/house') {
      return send(res, 200, await house());
    }
    if (req.method === 'GET' && url.pathname === '/api/activities') {
      return send(res, 200, await activities());
    }
    if (req.method === 'GET' && url.pathname === '/api/availability') {
      const month = url.searchParams.get('month');
      if (!isMonth(month)) return send(res, 400, { error: 'Use month=YYYY-MM.' });
      return send(res, 200, await availability(month));
    }
    if (req.method === 'POST' && url.pathname === '/api/bookings') {
      const body = await readBody(req);
      const guestName = cleanGuestName(body.guestName);
      const note = cleanNote(body.note);
      if (!isIsoDate(body.date) || !guestName || note == null) {
        return send(res, 400, { error: 'Send a date (YYYY-MM-DD), a name, and an optional note.' });
      }
      return send(res, 201, await createBooking({ date: body.date, guestName, note }));
    }
    return send(res, 404, { error: 'Not found' });
  } catch (error) {
    const status = error.status || 500;
    if (status === 500) console.error(error);
    if (res.headersSent || res.writableEnded) return;
    send(res, status, { error: status === 500 ? 'Something went wrong.' : error.message });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`api listening on ${port}`);
});

async function shutdown() {
  server.close();
  await driver.close();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
