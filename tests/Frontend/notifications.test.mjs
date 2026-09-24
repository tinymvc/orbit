import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(
  new URL("../../resources/app/lib/notifications.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
  },
});
const api = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

test("older pages use a cursor, JSON headers, same-origin cookies and cancellation", async (t) => {
  const controller = new AbortController();
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "/admin/notifications/feed?before=42");
    assert.equal(options.signal, controller.signal);
    assert.equal(options.credentials, "same-origin");
    assert.equal(options.headers.Accept, "application/json");
    assert.equal(options.headers["X-Requested-With"], "XMLHttpRequest");
    return Response.json({ items: [], nextCursor: null, unreadCount: 7 });
  });
  assert.equal(
    (await api.loadNotifications(42, controller.signal)).unreadCount,
    7,
  );
});

test("read actions send the CSRF cookie and integer ID", async (t) => {
  globalThis.document = {
    cookie: "theme=dark; XSRF-TOKEN=encrypted%2Btoken%3D",
  };
  t.after(() => {
    delete globalThis.document;
  });
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "/admin/notifications");
    assert.equal(options.method, "POST");
    assert.equal(options.headers["X-XSRF-TOKEN"], "encrypted+token=");
    assert.deepEqual(JSON.parse(options.body), { action: "mark-read", id: 8 });
    return Response.json({ unreadCount: 0, readAt: "2026-09-24 10:00:00" });
  });
  assert.equal((await api.updateNotification("mark-read", 8)).unreadCount, 0);
});

test("expired sessions and failed requests reject without pretending to succeed", async (t) => {
  const fetch = t.mock.method(
    globalThis,
    "fetch",
    async () => new Response("", { status: 419 }),
  );
  await assert.rejects(
    api.loadNotifications(null, new AbortController().signal),
    /session has expired/,
  );
  fetch.mock.mockImplementation(async () => new Response("", { status: 500 }));
  await assert.rejects(
    api.loadNotifications(null, new AbortController().signal),
    /try again/,
  );
});

test("append preserves order and does not duplicate already loaded notifications", () => {
  assert.deepEqual(
    api.appendNotifications([{ id: 5 }, { id: 4 }], [{ id: 4 }, { id: 3 }]),
    [{ id: 5 }, { id: 4 }, { id: 3 }],
  );
});

test("View waits for the read action before navigating", async () => {
  const events = [];
  let finishRead;
  const promise = api.openNotification(
    { slug: "/admin/profile", read_at: null },
    () => {
      events.push("mark-read");
      return new Promise((resolve) => {
        finishRead = resolve;
      });
    },
    (url) => events.push(url),
  );
  assert.deepEqual(events, ["mark-read"]);
  finishRead(true);
  await promise;
  assert.deepEqual(events, ["mark-read", "/admin/profile"]);
});

test("View stays in the drawer when marking read fails", async () => {
  const events = [];
  await api.openNotification(
    { slug: "/admin/profile", read_at: null },
    async () => false,
    (url) => events.push(url),
  );
  assert.deepEqual(events, []);
});

test("already-read notifications navigate without another write", async () => {
  const events = [];
  await api.openNotification(
    { slug: "/admin/profile", read_at: "2026-09-24" },
    async () => assert.fail("Unexpected write"),
    (url) => events.push(url),
  );
  assert.deepEqual(events, ["/admin/profile"]);
});

test("notifications without a link do not navigate", async () => {
  await api.openNotification(
    { slug: null, read_at: null },
    async () => assert.fail("Unexpected write"),
    () => assert.fail("Unexpected navigation"),
  );
});
