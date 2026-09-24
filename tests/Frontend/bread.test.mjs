import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(
  new URL("../../resources/app/lib/bread.ts", import.meta.url),
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

test("advanced filter links round-trip unicode, groups and range values", () => {
  const value = {
    match: "any",
    groups: [
      {
        id: "group-0",
        match: "all",
        rules: [
          {
            id: "rule-0-0",
            field: "name",
            operator: "contains",
            value: "東京 বাংলা",
          },
          {
            id: "rule-0-1",
            field: "id",
            operator: "between",
            value: "1",
            secondValue: "50",
          },
        ],
      },
    ],
  };
  assert.deepEqual(
    api.parseAdvancedFilter(api.encodeAdvancedFilter(value)),
    value,
  );
  assert.deepEqual(api.parseAdvancedFilter(JSON.stringify(value)), value);
  assert.equal(api.parseAdvancedFilter("1.invalid"), undefined);
  assert.equal(api.parseAdvancedFilter("invalid"), undefined);
  assert.equal(
    api.parseAdvancedFilter('{"match":"all","groups":[null]}'),
    undefined,
  );
  assert.equal(
    api.parseAdvancedFilter(
      '{"match":"all","groups":[{"match":"any","rules":[{}]}]}',
    ),
    undefined,
  );
});

test("multi-select filters accept indexed Inertia arrays and reference query formats", () => {
  assert.deepEqual(
    api.readFilterValueFromUrl(
      new URLSearchParams("status[0]=draft&status[1]=published"),
      "status",
      true,
    ),
    ["draft", "published"],
  );
  assert.deepEqual(
    api.readFilterValueFromUrl(
      new URLSearchParams("status=draft,published&status=draft"),
      "status",
      true,
    ),
    ["draft", "published"],
  );
  assert.equal(
    api.readFilterValueFromUrl(new URLSearchParams("status=0"), "status"),
    "0",
  );
  assert.equal(api.isActiveFilterValue([]), false);
  assert.equal(api.isActiveFilterValue(["0"]), true);
});

test("filter badges resolve numeric option values without losing labels", () => {
  assert.deepEqual(
    api.getFilterOptionLabels({ options: [{ value: 1, label: "One" }] }, [
      "1",
      "2",
    ]),
    ["One", "2"],
  );
});

test("page jump menus keep boundaries and current page without rendering thousands of options", () => {
  assert.deepEqual(api.buildPaginationJumpItems(0, 1), [
    { type: "page", page: 1 },
  ]);
  assert.equal(api.buildPaginationJumpItems(10, 4).length, 10);
  const items = api.buildPaginationJumpItems(10000, 5000);
  assert.ok(items.length < 25);
  for (const page of [1, 5000, 10000])
    assert.ok(items.some((item) => item.page === page));
  assert.ok(items.some((item) => item.type === "ellipsis"));
});

test("trash actions target only eligible records in mixed selections", () => {
  const records = [
    { id: 1, deleted_at: null },
    { id: "2", deleted_at: "2026-09-24 12:00:00" },
  ];
  for (const action of ["delete", "published", "draft", "edit"]) {
    assert.deepEqual(api.breadActionIds(records, action, "deleted_at"), [1]);
  }
  for (const action of ["restore", "force-delete"]) {
    assert.deepEqual(api.breadActionIds(records, action, "deleted_at"), [2]);
    assert.deepEqual(api.breadActionIds(records, action), []);
  }
  assert.deepEqual(api.breadActionIds(records, "delete"), [1, 2]);
  assert.deepEqual(
    api.breadActionIds(
      [{ id: 3, removed_at: "yesterday" }],
      "restore",
      "removed_at",
    ),
    [3],
  );
  assert.deepEqual(api.breadActionIds([], "delete", "deleted_at"), []);
});

test("bulk action permissions distinguish trash, restore, purge and ordinary edits", () => {
  assert.equal(api.breadActionPermission("delete"), "delete");
  assert.equal(api.breadActionPermission("restore"), "restore");
  assert.equal(api.breadActionPermission("force-delete"), "forceDelete");
  assert.equal(api.breadActionPermission("published"), "edit");
});
