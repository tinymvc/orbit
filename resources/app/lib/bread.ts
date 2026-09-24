import type { BreadFilter } from "@/components/bread";
import type { AdvancedFilterValue } from "@/components/advanced-filter-builder";

export type FilterValue = string | string[];

export function parseAdvancedFilter(
  rawValue: string | null,
): AdvancedFilterValue | undefined {
  if (!rawValue || rawValue.length > 32768) return undefined;

  try {
    if (rawValue.startsWith("1.")) {
      const encoded = rawValue.slice(2).replace(/-/g, "+").replace(/_/g, "/");
      const padded = encoded.padEnd(
        encoded.length + ((4 - (encoded.length % 4)) % 4),
        "=",
      );
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, (character) =>
        character.charCodeAt(0),
      );
      const compact = JSON.parse(new TextDecoder().decode(bytes)) as [
        0 | 1,
        Array<
          [
            0 | 1,
            Array<[string, string, string | string[] | undefined, string?]>,
          ]
        >,
      ];

      if (!Array.isArray(compact) || !Array.isArray(compact[1])) {
        return undefined;
      }

      return normalizeAdvancedFilter({
        match: compact[0] === 1 ? "any" : "all",
        groups: compact[1].map((group, groupIndex) => ({
          id: `group-${groupIndex}`,
          match: group[0] === 1 ? "any" : "all",
          rules: (group[1] || []).map((rule, ruleIndex) => ({
            id: `rule-${groupIndex}-${ruleIndex}`,
            field: rule[0],
            operator: rule[1],
            value: rule[2],
            ...(rule[3] ? { secondValue: rule[3] } : {}),
          })),
        })),
      });
    }

    const parsed = JSON.parse(rawValue) as AdvancedFilterValue;
    return normalizeAdvancedFilter(parsed);
  } catch {
    return undefined;
  }
}

function normalizeAdvancedFilter(
  value: AdvancedFilterValue,
): AdvancedFilterValue | undefined {
  if (
    !value ||
    !["all", "any"].includes(value.match) ||
    !Array.isArray(value.groups) ||
    value.groups.length > 10
  )
    return undefined;
  let ruleCount = 0;
  for (const group of value.groups) {
    if (
      !group ||
      !["all", "any"].includes(group.match) ||
      !Array.isArray(group.rules)
    )
      return undefined;
    for (const rule of group.rules) {
      if (
        ++ruleCount > 50 ||
        !rule ||
        typeof rule.field !== "string" ||
        typeof rule.operator !== "string"
      )
        return undefined;
      if (
        rule.value != null &&
        typeof rule.value !== "string" &&
        !(
          Array.isArray(rule.value) &&
          rule.value.every((item) => typeof item === "string")
        )
      )
        return undefined;
      if (rule.secondValue != null && typeof rule.secondValue !== "string")
        return undefined;
    }
  }
  return {
    ...value,
    groups: value.groups.map((group, groupIndex) => ({
      ...group,
      id: `group-${groupIndex}`,
      rules: group.rules.map((rule, index) => ({
        ...rule,
        id: `rule-${groupIndex}-${index}`,
      })),
    })),
  };
}

export function encodeAdvancedFilter(value: AdvancedFilterValue): string {
  const compact = [
    value.match === "any" ? 1 : 0,
    value.groups.map((group) => [
      group.match === "any" ? 1 : 0,
      group.rules.map((rule) => [
        rule.field,
        rule.operator,
        rule.value,
        rule.secondValue || undefined,
      ]),
    ]),
  ];
  const bytes = new TextEncoder().encode(JSON.stringify(compact));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return `1.${btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")}`;
}

export function isActiveFilterValue(value: FilterValue | undefined) {
  return Array.isArray(value) ? value.length > 0 : Boolean(value);
}

export function getFilterUrlValues(params: URLSearchParams, key: string) {
  const values = params
    .getAll(key)
    .concat(
      Array.from(params.entries())
        .filter(([name]) => name.startsWith(`${key}[`))
        .map(([, value]) => value),
    )
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  return Array.from(new Set(values));
}

export function readFilterValueFromUrl(
  params: URLSearchParams,
  key: string,
  multiple?: boolean,
) {
  const values = getFilterUrlValues(params, key);

  if (multiple) {
    return values.length > 0 ? values : undefined;
  }

  return values[0];
}

export function getFilterOptionLabels(
  filter: BreadFilter | undefined,
  value: FilterValue,
) {
  const values = Array.isArray(value) ? value : [value];

  return values.map(
    (item) =>
      filter?.options.find((option) => option.value.toString() === item)
        ?.label ?? item,
  );
}

type PaginationJumpItem =
  | { type: "page"; page: number }
  | { type: "ellipsis"; key: string };

export function buildPaginationJumpItems(
  totalPages: number,
  currentPage: number,
): PaginationJumpItem[] {
  const clampedTotal = Math.max(1, totalPages);
  const clampedCurrent = Math.min(Math.max(1, currentPage), clampedTotal);

  if (clampedTotal <= 15) {
    return Array.from({ length: clampedTotal }, (_, idx) => ({
      type: "page" as const,
      page: idx + 1,
    }));
  }

  const keepFirst = 3;
  const keepLast = 3;
  const aroundCurrent = 5;
  const pages = new Set<number>();

  for (let page = 1; page <= keepFirst; page += 1) {
    pages.add(page);
  }

  for (
    let page = Math.max(1, clampedCurrent - aroundCurrent);
    page <= Math.min(clampedTotal, clampedCurrent + aroundCurrent);
    page += 1
  ) {
    pages.add(page);
  }

  for (
    let page = Math.max(1, clampedTotal - keepLast + 1);
    page <= clampedTotal;
    page += 1
  ) {
    pages.add(page);
  }

  const sortedPages = Array.from(pages).sort((a, b) => a - b);
  const items: PaginationJumpItem[] = [];

  sortedPages.forEach((page, index) => {
    items.push({ type: "page", page });

    const nextPage = sortedPages[index + 1];
    if (nextPage && nextPage - page > 1) {
      items.push({
        type: "ellipsis",
        key: `ellipsis-${page}-${nextPage}`,
      });
    }
  });

  return items;
}

/** Restrict each action to its valid lifecycle state, including mixed selections. */
export function breadActionIds(
  records: Record<string, unknown>[],
  action: string,
  deletedColumn?: string,
): number[] {
  const needsTrash = action === "restore" || action === "force-delete";
  if (needsTrash && !deletedColumn) return [];

  return records
    .filter(
      (record) =>
        !deletedColumn || Boolean(record[deletedColumn]) === needsTrash,
    )
    .map((record) => Number(record.id));
}

export function breadActionPermission(
  action: string,
): "delete" | "restore" | "forceDelete" | "edit" {
  if (action === "delete" || action === "restore") return action;
  return action === "force-delete" ? "forceDelete" : "edit";
}
