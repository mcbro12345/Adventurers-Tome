// Makes the test project a copy of the live site: every account (same IDs, so signing in on the test site is you)
// and every document in the database, sub-collections included.
//
// It only ever READS the live project. Only documents that differ are written, and documents that aren't on the live
// site are removed, so the copy stays inside the free plan's daily limits.
//
// The repository is public, so this prints counts only, never names, e-mail addresses or any other data.
//
// Needs two environment variables, each the full JSON of a service-account key:
//   PROD_SA  the live project (read only)
//   TEST_SA  the test project
const admin = require('firebase-admin');

const LIVE_ID = 'dnd-character-sheets-b30c7';
const prodKey = JSON.parse(process.env.PROD_SA || '{}'), testKey = JSON.parse(process.env.TEST_SA || '{}');
if (!prodKey.project_id || !testKey.project_id) { console.error('Both keys are needed (PROD_FIREBASE_READ and TEST_FIREBASE_SA).'); process.exit(1); }
if (prodKey.project_id !== LIVE_ID) { console.error('PROD_FIREBASE_READ is not the live project\'s key.'); process.exit(1); }
// never write to the live project, whatever the keys say
if (testKey.project_id === LIVE_ID) { console.error('TEST_FIREBASE_SA is the live project\'s key, not the test project\'s. Stopping.'); process.exit(1); }

const prod = admin.initializeApp({ credential: admin.credential.cert(prodKey), projectId: prodKey.project_id }, 'prod');
const test = admin.initializeApp({ credential: admin.credential.cert(testKey), projectId: testKey.project_id }, 'test');
const P = prod.firestore(), T = test.firestore();
const { DocumentReference, Timestamp, GeoPoint } = admin.firestore;

// a stable text form of a document, so the two copies can be compared exactly
const canon = v => {
  if (v === null || typeof v !== 'object') return JSON.stringify(v === undefined ? null : v);
  if (v instanceof Timestamp) return `{"$ts":[${v.seconds},${v.nanoseconds}]}`;
  if (v instanceof GeoPoint) return `{"$geo":[${v.latitude},${v.longitude}]}`;
  if (v instanceof DocumentReference) return `{"$ref":${JSON.stringify(v.path)}}`;
  if (Buffer.isBuffer(v) || v instanceof Uint8Array) return `{"$bytes":"${Buffer.from(v).toString('base64')}"}`;
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
};
// links to other documents point into the test project's database
const toTest = v => {
  if (v === null || typeof v !== 'object') return v;
  if (v instanceof DocumentReference) return T.doc(v.path);
  if (v instanceof Timestamp || v instanceof GeoPoint || Buffer.isBuffer(v) || v instanceof Uint8Array) return v;
  if (Array.isArray(v)) return v.map(toTest);
  const o = {}; for (const k of Object.keys(v)) o[k] = toTest(v[k]); return o;
};

// Every collection, read with one query per collection name (a "collection group" query finds that name at any depth),
// so the live site is charged one read per document and nothing more. The names are the ones the site uses; any new
// top-level collection is found by itself.
const NAMES = ['admins', 'audit', 'bugs', 'cards', 'chars', 'chat', 'config', 'creatures', 'desks', 'groups', 'hb', 'imgs', 'inbox', 'init', 'invcard', 'invites', 'items',
  'news', 'notes', 'notice', 'notices', 'part', 'parties', 'party', 'pub', 'pubviews', 'quiet', 'sessions', 'sheets', 'slugs', 'turn', 'users', 'welcome', 'whisper', 'x'];
// short-lived "who's here right now" records aren't worth copying
const SKIP = new Set(['presence', 'typing', 'live', 'relay']);
// the audit log (a top-level collection) only ever grows: just the entries newer than the newest one already copied are read
const GROWS = { audit: 'at' };
async function names(db) { const top = (await db.listCollections()).map(c => c.id); return [...new Set([...NAMES, ...top])].filter(n => !SKIP.has(n)); }
async function readGroup(db, name, after) {
  let q = after != null ? db.collection(name).where(GROWS[name], '>', after) : db.collectionGroup(name);
  const docs = new Map(); (await q.get()).docs.forEach(d => docs.set(d.ref.path, d.data())); return docs;
}
async function copyAccounts() {
  let token, n = 0, kept = 0, changed = 0, failed = 0; const liveIds = new Set();
  do {
    const page = await prod.auth().listUsers(1000, token); token = page.pageToken;
    const users = page.users.map(u => ({
      uid: u.uid, email: u.email, emailVerified: u.emailVerified, displayName: u.displayName, photoURL: u.photoURL, disabled: u.disabled,
      providerData: (u.providerData || []).filter(p => p.providerId !== 'password').map(p => ({ uid: p.uid, providerId: p.providerId, email: p.email, displayName: p.displayName, photoURL: p.photoURL })),
    }));
    users.forEach(u => liveIds.add(u.uid));
    // accounts already in the test project follow the live one: blocked, e-mail address and verified state
    const have = new Map(); for (let i = 0; i < users.length; i += 100) (await test.auth().getUsers(users.slice(i, i + 100).map(u => ({ uid: u.uid })))).users.forEach(u => have.set(u.uid, u));
    for (const u of users) { const t = have.get(u.uid); if (!t) continue; kept++;
      if (t.disabled !== !!u.disabled || (t.email || '') !== (u.email || '') || t.emailVerified !== !!u.emailVerified) {
        try { await test.auth().updateUser(u.uid, Object.assign({ disabled: !!u.disabled, emailVerified: !!u.emailVerified }, u.email ? { email: u.email } : {})); changed++; } catch (e) { failed++; } } }
    const add = users.filter(u => !have.has(u.uid));
    if (add.length) { const r = await test.auth().importUsers(add); n += add.length - r.failureCount; failed += r.failureCount; }
  } while (token);
  // accounts deleted on the live site are deleted here too
  let gone = []; token = undefined;
  do { const page = await test.auth().listUsers(1000, token); token = page.pageToken; page.users.forEach(u => { if (!liveIds.has(u.uid)) gone.push(u.uid); }); } while (token);
  let removed = 0; for (let i = 0; i < gone.length; i += 1000) { const r = await test.auth().deleteUsers(gone.slice(i, i + 1000)); removed += r.successCount; failed += r.failureCount; }
  console.log(`Accounts: ${n} copied, ${changed} updated, ${removed} removed, ${kept - changed} already the same${failed ? `, ${failed} couldn't be changed` : ''}`);
}

// Copying reads every live document (the audit log only its new entries), which counts against the live site's free
// 50,000 reads a day. It's counted first (about one read per 1,000 documents) and nothing is copied if it would use more
// than MAX_READS, so a copy can never leave the live site short for the rest of the day.
const MAX_READS = Number(process.env.MAX_READS) || 15000;
async function copyDatabase() {
  const all = await names(P); let reads = 0, wrote = 0, removed = 0, same = 0, failed = 0, est = 0;
  const after = {};
  for (const name of all) { if (GROWS[name]) { const top = await T.collection(name).orderBy(GROWS[name], 'desc').limit(1).get(); if (!top.empty) after[name] = top.docs[0].get(GROWS[name]); }
    const q = after[name] != null ? P.collection(name).where(GROWS[name], '>', after[name]) : P.collectionGroup(name); const c = (await q.count().get()).data().count; est += c + Math.ceil(c / 1000); }
  if (est > MAX_READS) { console.log(`Not copied: it would use about ${est} of the live site's daily reads (the limit set here is ${MAX_READS}).`); return; }
  const bw = T.bulkWriter(); bw.onWriteError(e => e.failedAttempts < 5);
  // (a write that still fails is counted, never printed: its details would show document paths in the public log)
  const ok = pr => pr.catch(() => { failed++; });
  for (const name of all) {
    const live = await readGroup(P, name, after[name]), cur = after[name] == null ? await readGroup(T, name) : new Map(); reads += live.size;
    for (const [path, data] of live) { if (cur.has(path) && canon(cur.get(path)) === canon(data)) { same++; continue; } ok(bw.set(T.doc(path), toTest(data))); wrote++; }
    if (after[name] == null) for (const path of cur.keys()) if (!live.has(path)) { ok(bw.delete(T.doc(path))); removed++; }
  }
  try { await bw.close(); } catch (e) { failed++; }
  console.log(`Database copied: ${reads} read from the live site, ${wrote - failed} written, ${removed} removed, ${same} already the same${failed ? `, ${failed} failed` : ''}`);
}

(async () => {
  const t0 = Date.now();
  await copyAccounts();
  await copyDatabase();
  console.log(`Done in ${Math.round((Date.now() - t0) / 1000)}s`);
})().catch(e => { console.error('The copy stopped' + (e && e.code ? ': ' + e.code : '.')); process.exit(1); });
// nothing unexpected is ever printed in full (the log is public)
process.on('unhandledRejection', e => { console.error('The copy stopped' + (e && e.code ? ': ' + e.code : '.')); process.exit(1); });
