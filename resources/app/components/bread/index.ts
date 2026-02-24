/**
 * BREAD Resource Module
 *
 * A Filament PHP-like server-driven resource builder for admin CRUD tables.
 *
 * The PHP backend defines everything (model, fields, columns, filters,
 * permissions, bulk actions) in a Resource class. The generic ResourceController
 * sends the schema as Inertia props. The frontend auto-renders from that schema.
 *
 * Usage (generic table page):
 * ```tsx
 * import { useServerResource } from "@/components/bread/resource";
 * import Bread from "@/components/bread";
 *
 * const { config, columnsCallback, FormFields } = useServerResource(resource, dynamicOptions);
 * <Bread config={config} paginated={paginated} columnsCallback={columnsCallback} FormFields={FormFields} />
 * ```
 */

export {
  useServerResource,
  buildConfigFromSchema,
  buildColumnsFromSchema,
  buildFormFieldsFromSchema,
  type ServerResourceSchema,
  type ServerFieldSchema,
  type ServerColumnSchema,
  type ServerFilter,
  type ServerBulkAction,
  type DynamicOptions,
} from "./resource";

export {
  AutoFormFields,
  FieldRenderer,
  type FieldSchema,
  type FieldType,
  type FieldOption,
  type ColumnSchema,
  type ColumnType,
  resolveAccessor,
} from "./fields";
