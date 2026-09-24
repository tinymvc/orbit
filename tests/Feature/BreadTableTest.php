<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Services\Bread\ResourceController;
use Tests\DatabaseTestCase;
use Tests\Fixtures\FilteredCategoryResource;

final class BreadTableTest extends DatabaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->signIn();
        ResourceController::routes(FilteredCategoryResource::class)->prefix('admin')->middleware('auth');
        foreach (['Zulu', 'Alpha', 'Beta'] as $name) Category::create(['name' => $name, 'slug' => strtolower($name)]);
    }

    public function test_sorting_runs_before_pagination_and_only_allows_declared_columns(): void
    {
        $this->get('/admin/filtered-categories?sort=name&direction=asc&per_page=1&page=2')
            ->assertOk()->assertJsonPath('props.paginated.data.0.name', 'Beta')->assertJsonPath('props.paginated.total', 3);
        $this->get('/admin/filtered-categories?sort=name&direction=desc')
            ->assertOk()->assertJsonPath('props.paginated.data.0.name', 'Zulu');
        $this->get('/admin/filtered-categories?sort=name&direction=asc&per_page=1&page=999')->assertJsonPath('props.paginated.data.0.name', 'Zulu')->assertJsonPath('props.paginated.page', 3);
        foreach (['sort=password', 'direction=invalid', 'per_page=501', 'per_page=-2', 'search[]=bad'] as $query) {
            $this->getJson('/admin/filtered-categories?' . $query)->assertUnprocessable();
        }
    }

    public function test_multi_and_exclude_filters_and_editor_schema(): void
    {
        $this->get('/admin/filtered-categories?names[0]=Alpha&names[1]=Beta&exclude_slugs[0]=beta')
            ->assertOk()->assertJsonPath('props.paginated.total', 1)->assertJsonPath('props.paginated.data.0.name', 'Alpha')
            ->assertJsonPath('props.resource.editor.style', 'modal')->assertJsonPath('props.resource.editor.width', '3xl')
            ->assertJsonPath('props.resource.filters.0.queryKey', 'names')->assertJsonPath('props.resource.filters.0.multiple', true)
            ->assertJsonPath('props.resource.filters.1.variant', 'exclude')->assertJsonPath('props.resource.serverSorting', true);
        $this->getJson('/admin/filtered-categories?names[0][bad]=x')->assertUnprocessable();
    }

    public function test_advanced_any_groups_remain_inside_other_filters_and_support_compact_links(): void
    {
        $filter = ['match' => 'any', 'groups' => [
            ['match' => 'all', 'rules' => [['field' => 'name', 'operator' => 'equals', 'value' => 'Alpha']]],
            ['match' => 'any', 'rules' => [['field' => 'id', 'operator' => 'between', 'value' => '1', 'secondValue' => '1']]],
        ]];
        $this->get('/admin/filtered-categories?exclude_slugs[0]=zulu&advanced_filter=' . urlencode(json_encode($filter)))
            ->assertOk()->assertJsonPath('props.paginated.total', 1)->assertJsonPath('props.paginated.data.0.name', 'Alpha');
        $compact = '1.' . rtrim(strtr(base64_encode(json_encode([0, [[0, [['name', 'contains', 'et']]]]])), '+/', '-_'), '=');
        $this->get('/admin/filtered-categories?af=' . $compact)->assertOk()
            ->assertJsonPath('props.paginated.total', 1)->assertJsonPath('props.paginated.data.0.name', 'Beta');
    }

    public function test_date_filters_match_timestamp_days_and_empty_text_matches_null_or_blank(): void
    {
        Category::where('name', 'Alpha')->update(['created_at' => '2026-01-02 18:30:00', 'description' => '']);
        Category::where('name', 'Beta')->update(['created_at' => '2026-01-02 10:00:00', 'description' => 'Present']);
        $filter = ['match' => 'all', 'groups' => [['match' => 'all', 'rules' => [
            ['field' => 'created_at', 'operator' => 'equals', 'value' => '2026-01-02'],
            ['field' => 'description', 'operator' => 'is_empty'],
        ]]]];
        $this->get('/admin/filtered-categories?af=' . urlencode(json_encode($filter)))
            ->assertOk()->assertJsonPath('props.paginated.total', 1)->assertJsonPath('props.paginated.data.0.name', 'Alpha');
        $filter['groups'][0]['rules'][0]['value'] = '2026-02-30';
        $this->getJson('/admin/filtered-categories?af=' . urlencode(json_encode($filter)))->assertUnprocessable();
    }

    public function test_advanced_filters_reject_unknown_fields_operators_and_malformed_input(): void
    {
        foreach ([['password', 'equals', 'x'], ['name', 'sql', 'x'], ['id', 'gt', 'not-a-number'], ['name', 'equals', ['nested']]] as [$field, $operator, $value]) {
            $filter = ['match' => 'all', 'groups' => [['match' => 'all', 'rules' => [compact('field', 'operator', 'value')]]]];
            $this->getJson('/admin/filtered-categories?af=' . urlencode(json_encode($filter)))->assertUnprocessable();
        }
        foreach (['not-json', '1.broken', '[]'] as $raw) $this->getJson('/admin/filtered-categories?af=' . $raw)->assertUnprocessable();
    }
}
