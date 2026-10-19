import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../../resources/app/lib/date-time.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
});
const api = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

for (const timezone of ["UTC", "Asia/Dhaka", "America/New_York", "Pacific/Auckland"]) {
  test(`UTC instants and calendar dates round-trip in ${timezone}`, () => {
    const previous = process.env.TZ;
    process.env.TZ = timezone;
    try {
      const instant = api.parseDate("2026-10-19T08:30:00Z");
      assert.equal(api.parseDate("2026-10-19 08:30:00").getTime(), instant.getTime());
      assert.equal(api.parseDate("2026-10-19T14:30:00+06:00").getTime(), instant.getTime());
      assert.equal(api.parseDate("2026-10-19 08:30:00.123456").toISOString(), "2026-10-19T08:30:00.123Z");
      const localTime = `${String(instant.getHours()).padStart(2, "0")}:${String(instant.getMinutes()).padStart(2, "0")}`;
      assert.equal(api.localDateTimeToUtc(instant, localTime), "2026-10-19T08:30:00.000Z");
      assert.equal(api.toDateInput(api.parseDate("2026-10-19")), "2026-10-19");
      assert.equal(api.formatDate("2026-10-19", true), api.formatDate("2026-10-19"));
      assert.equal(api.formatDate("2026-10-19T08:30:00Z", true), new Intl.DateTimeFormat(undefined, {
        year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      }).format(instant));
    } finally {
      if (previous === undefined) delete process.env.TZ;
      else process.env.TZ = previous;
    }
  });
}

test("invalid and cleared input never throws or submits a timestamp", () => {
  for (const value of [null, undefined, "", "invalid", "2026-02-30", "2026-02-30T12:00:00Z", new Date(NaN)]) {
    assert.equal(api.parseDate(value), null);
    assert.equal(api.formatDate(value), "—");
  }
  for (const time of ["", "24:00", "12:60", "bad"]) {
    assert.equal(api.localDateTimeToUtc(new Date(), time), null);
  }
});

test("DST gaps are rejected and surrounding local times use their actual offsets", () => {
  const previous = process.env.TZ;
  process.env.TZ = "America/New_York";
  try {
    const spring = api.parseDate("2026-03-08");
    assert.equal(api.localDateTimeToUtc(spring, "02:30"), null);
    assert.equal(api.localDateTimeToUtc(spring, "01:30"), "2026-03-08T06:30:00.000Z");
    assert.equal(api.localDateTimeToUtc(spring, "03:30"), "2026-03-08T07:30:00.000Z");
    assert.equal(api.localDateTimeToUtc(api.parseDate("2026-11-01"), "03:30"), "2026-11-01T08:30:00.000Z");
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});
