import * as React from "react";
import { Filter, Plus, Trash2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export type AdvancedFilterFieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "multiselect"
  | "boolean";

export interface AdvancedFilterField {
  key: string;
  label: string;
  type: AdvancedFilterFieldType;
  group?: string;
  options?: { value: string; label: string }[];
}

export interface AdvancedFilterRule {
  id: string;
  field: string;
  operator: string;
  value?: string | string[];
  secondValue?: string;
}

export interface AdvancedFilterGroup {
  id: string;
  match: "all" | "any";
  rules: AdvancedFilterRule[];
}

export interface AdvancedFilterValue {
  match: "all" | "any";
  groups: AdvancedFilterGroup[];
}

const emptyValue = (): AdvancedFilterValue => ({
  match: "all",
  groups: [{ id: crypto.randomUUID(), match: "all", rules: [] }],
});

const operatorOptions = (
  type: AdvancedFilterFieldType,
): Array<[string, string]> => {
  if (type === "number") {
    return [
      ["equals", "Equals"],
      ["not_equals", "Does not equal"],
      ["gt", "Greater than"],
      ["gte", "Greater than or equal"],
      ["lt", "Less than"],
      ["lte", "Less than or equal"],
      ["between", "Between"],
      ["is_empty", "Is empty"],
      ["is_not_empty", "Is not empty"],
    ];
  }
  if (type === "date") {
    return [
      ["equals", "On"],
      ["before", "Before"],
      ["after", "After"],
      ["between", "Between"],
      ["is_empty", "Is empty"],
      ["is_not_empty", "Is not empty"],
    ];
  }
  if (type === "select" || type === "multiselect" || type === "boolean") {
    return [
      ["in", "Is any of"],
      ["not_in", "Is none of"],
      ["is_empty", "Is empty"],
      ["is_not_empty", "Is not empty"],
    ];
  }
  return [
    ["contains", "Contains"],
    ["not_contains", "Does not contain"],
    ["equals", "Equals"],
    ["not_equals", "Does not equal"],
    ["starts_with", "Starts with"],
    ["ends_with", "Ends with"],
    ["is_empty", "Is empty"],
    ["is_not_empty", "Is not empty"],
  ];
};

const requiresValue = (operator: string) =>
  !["is_empty", "is_not_empty"].includes(operator);

const cloneValue = (value?: AdvancedFilterValue): AdvancedFilterValue =>
  value ? JSON.parse(JSON.stringify(value)) : emptyValue();

export default function AdvancedFilterBuilder({
  fields,
  value,
  onChange,
  title = "Advanced filters",
  description = "Build a precise segment across standard and custom fields. Filtering runs on the server against the full result set.",
}: {
  fields: AdvancedFilterField[];
  value?: AdvancedFilterValue;
  onChange: (value?: AdvancedFilterValue) => void;
  title?: string;
  description?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<AdvancedFilterValue>(() =>
    cloneValue(value),
  );

  const ruleCount =
    value?.groups.reduce((count, group) => count + group.rules.length, 0) ?? 0;

  React.useEffect(() => {
    if (open) setDraft(cloneValue(value));
  }, [open, value]);

  const addRule = (groupId: string) => {
    const firstField = fields[0];
    if (!firstField) return;
    const operator = operatorOptions(firstField.type)[0]?.[0] ?? "equals";
    setDraft((current) => ({
      ...current,
      groups: current.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              rules: [
                ...group.rules,
                {
                  id: crypto.randomUUID(),
                  field: firstField.key,
                  operator,
                  value: firstField.type === "multiselect" ? [] : "",
                },
              ],
            }
          : group,
      ),
    }));
  };

  const updateRule = (
    groupId: string,
    ruleId: string,
    patch: Partial<AdvancedFilterRule>,
  ) => {
    setDraft((current) => ({
      ...current,
      groups: current.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              rules: group.rules.map((rule) =>
                rule.id === ruleId ? { ...rule, ...patch } : rule,
              ),
            }
          : group,
      ),
    }));
  };

  const removeRule = (groupId: string, ruleId: string) => {
    setDraft((current) => ({
      ...current,
      groups: current.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              rules: group.rules.filter((rule) => rule.id !== ruleId),
            }
          : group,
      ),
    }));
  };

  const apply = () => {
    const groups = draft.groups
      .map((group) => ({
        ...group,
        rules: group.rules.filter((rule) => {
          if (!requiresValue(rule.operator)) return true;
          return Array.isArray(rule.value)
            ? rule.value.length > 0
            : String(rule.value ?? "").trim() !== "";
        }),
      }))
      .filter((group) => group.rules.length > 0);

    onChange(groups.length ? { ...draft, groups } : undefined);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="shrink-0">
          <Filter className="size-4" />
          <span className="hidden lg:inline">Advanced</span>
          {ruleCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 rounded-full px-1.5 py-0"
            >
              {ruleCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
            <div>
              <p className="text-sm font-medium">
                {draft.groups.reduce(
                  (count, group) => count + group.rules.length,
                  0,
                )}{" "}
                conditions in {draft.groups.length}{" "}
                {draft.groups.length === 1 ? "group" : "groups"}
              </p>
              <p className="text-xs text-muted-foreground">
                Results update only when you apply this filter.
              </p>
            </div>
            <Select
              value={draft.match}
              onValueChange={(match: "all" | "any") =>
                setDraft((current) => ({ ...current, match }))
              }
            >
              <SelectTrigger className="h-8! w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">all groups</SelectItem>
                <SelectItem value="any">any group</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {draft.groups.map((group, groupIndex) => (
            <div key={group.id} className="rounded-xl border bg-card">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    Group {groupIndex + 1}
                  </span>
                  <Select
                    value={group.match}
                    onValueChange={(match: "all" | "any") =>
                      setDraft((current) => ({
                        ...current,
                        groups: current.groups.map((item) =>
                          item.id === group.id ? { ...item, match } : item,
                        ),
                      }))
                    }
                  >
                    <SelectTrigger className="h-7.5! w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Match all</SelectItem>
                      <SelectItem value="any">Match any</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {draft.groups.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        groups: current.groups.filter(
                          (item) => item.id !== group.id,
                        ),
                      }))
                    }
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-3 p-4">
                {group.rules.map((rule) => {
                  const field = fields.find((item) => item.key === rule.field);
                  if (!field) return null;
                  const operators = operatorOptions(field.type);
                  const options =
                    field.type === "boolean"
                      ? [
                          { value: "1", label: "Yes" },
                          { value: "0", label: "No" },
                        ]
                      : (field.options ?? []);

                  return (
                    <div
                      key={rule.id}
                      className="grid gap-2 rounded-lg border bg-muted/15 p-3 md:grid-cols-[1.2fr_1fr_1.2fr_auto]"
                    >
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">
                          Field
                        </Label>
                        <Combobox
                          value={rule.field}
                          onChange={(next) => {
                            const nextField = fields.find(
                              (item) => item.key === next,
                            );
                            if (!nextField || Array.isArray(next)) return;
                            updateRule(group.id, rule.id, {
                              field: next,
                              operator:
                                operatorOptions(nextField.type)[0]?.[0] ??
                                "equals",
                              value: nextField.type === "multiselect" ? [] : "",
                              secondValue: "",
                            });
                          }}
                          options={fields.map((item) => ({
                            value: item.key,
                            label: item.group
                              ? `${item.group} · ${item.label}`
                              : item.label,
                          }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">
                          Operator
                        </Label>
                        <Select
                          value={rule.operator}
                          onValueChange={(operator) =>
                            updateRule(group.id, rule.id, { operator })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map(([operator, label]) => (
                              <SelectItem key={operator} value={operator}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">
                          Value
                        </Label>
                        {!requiresValue(rule.operator) ? (
                          <div className="flex h-9 items-center text-xs text-muted-foreground">
                            No value needed
                          </div>
                        ) : options.length > 0 ? (
                          <Combobox
                            multiple
                            value={
                              Array.isArray(rule.value)
                                ? rule.value
                                : rule.value
                                  ? [rule.value]
                                  : []
                            }
                            onChange={(next) =>
                              updateRule(group.id, rule.id, {
                                value: Array.isArray(next) ? next : [next],
                              })
                            }
                            options={options}
                          />
                        ) : (
                          <div className="flex gap-2">
                            <Input
                              type={
                                field.type === "date"
                                  ? "date"
                                  : field.type === "number"
                                    ? "number"
                                    : "text"
                              }
                              value={
                                Array.isArray(rule.value)
                                  ? rule.value.join(",")
                                  : (rule.value ?? "")
                              }
                              onChange={(event) =>
                                updateRule(group.id, rule.id, {
                                  value: event.target.value,
                                })
                              }
                            />
                            {rule.operator === "between" && (
                              <Input
                                type={field.type === "date" ? "date" : "number"}
                                value={rule.secondValue ?? ""}
                                onChange={(event) =>
                                  updateRule(group.id, rule.id, {
                                    secondValue: event.target.value,
                                  })
                                }
                              />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-end mb-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRule(group.id, rule.id)}
                          aria-label="Remove condition"
                          title="Remove condition"
                          className="group"
                        >
                          <Trash2 className="size-4 text-muted-foreground group-hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addRule(group.id)}
                >
                  <Plus className="size-4" /> Add condition
                </Button>
              </div>
            </div>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setDraft((current) => ({
                ...current,
                groups: [
                  ...current.groups,
                  { id: crypto.randomUUID(), match: "all", rules: [] },
                ],
              }))
            }
          >
            <Plus className="size-4" /> Add condition group
          </Button>
        </div>

        <SheetFooter className="border-t flex-row">
          <Button
            variant="outline"
            onClick={() => {
              setDraft(emptyValue());
              onChange(undefined);
              setOpen(false);
            }}
            className="w-6/12"
          >
            Clear filters
          </Button>
          <Button onClick={apply} className="w-6/12">
            Apply filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
