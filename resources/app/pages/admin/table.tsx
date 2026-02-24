import Bread, { type PaginatedData } from "@/components/bread";
import {
  useServerResource,
  type ServerResourceSchema,
  type DynamicOptions,
} from "@/components/bread/resource";

// ─── Props sent from PHP ResourceController::index() ────────────────────────

interface TablePageProps {
  resource: ServerResourceSchema;
  paginated: PaginatedData;
  dynamicOptions?: DynamicOptions;
}

// ─── Generic Table Page ─────────────────────────────────────────────────────

/**
 * A single generic page that renders ANY BREAD resource.
 *
 * The PHP backend sends:
 *   - `resource`       → the full schema (fields, columns, filters, permissions…)
 *   - `paginated`      → paginated model data
 *   - `dynamicOptions` → runtime option lists (e.g. authors for a select field)
 *
 * This page converts the JSON schema into BreadConfig + columns + FormFields
 * via `useServerResource()` and passes them straight to <Bread />.
 *
 * No per-model page component is needed — just create a PHP Resource class
 * and register it with `ResourceController::routes(YourResource::class)`.
 */
export default function TablePage({
  resource,
  paginated,
  dynamicOptions = {},
}: TablePageProps) {
  const { config, columnsCallback, FormFields } = useServerResource(
    resource,
    dynamicOptions,
  );

  return (
    <Bread
      config={config}
      paginated={paginated}
      columnsCallback={columnsCallback}
      FormFields={FormFields}
    />
  );
}
