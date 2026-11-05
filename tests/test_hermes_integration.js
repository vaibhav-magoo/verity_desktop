/**
 * Test Suite for Verity Hermes Gateway Client & Tool Affect Mapping
 */
const assert = require('assert');
const HermesGatewayClient = require('../src/hermes-gateway-client.js');

console.log('===============================================================');
console.log('VERITY // HERMES AGENT UNIFIED CLIENT INTEGRATION TESTS');
console.log('===============================================================\n');

const client = new HermesGatewayClient({
  gatewayUrl: 'http://127.0.0.1:8642/v1',
  model: 'nousresearch/hermes-3-llama-3.1-8b'
});

// Test 1: Tool Mapping to Verity 120 Animations & Expressions
console.log('[Test 1] Verifying Tool -> 3D Animation & Affect Mappings:');

const testCases = [
  { tool: 'execute_bash', expectedAnim: 'ANIM_032_TERMINAL_HACK_MODE', expectedExpr: 1 },
  { tool: 'run_terminal_command', expectedAnim: 'ANIM_032_TERMINAL_HACK_MODE', expectedExpr: 1 },
  { tool: 'read_workspace_file', expectedAnim: 'ANIM_024_DATA_SCAN_SWEEP', expectedExpr: 0 },
  { tool: 'edit_code_patch', expectedAnim: 'ANIM_023_DEEP_DEBUG_SQUINT', expectedExpr: 12 },
  { tool: 'web_search_query', expectedAnim: 'ANIM_074_EAGER_LEAN_IN', expectedExpr: 0 },
  { tool: 'synthesize_skill_memory', expectedAnim: 'ANIM_025_EUREKA_EPIPHANY', expectedExpr: 8 }
];

testCases.forEach(({ tool, expectedAnim, expectedExpr }) => {
  const mapping = client.mapToolToVerityState(tool);
  console.log(`  ✓ Tool "${tool}" -> Animation: ${mapping.animation}, Expression: ${mapping.expression}`);
  assert.strictEqual(mapping.animation, expectedAnim, `Wrong animation for tool ${tool}`);
  assert.strictEqual(mapping.expression, expectedExpr, `Wrong expression for tool ${tool}`);
});

// Test 2: Healthcheck handling when gateway is offline
console.log('\n[Test 2] Testing Graceful Healthcheck with offline Gateway:');
client.checkHealth().then(status => {
  console.log(`  Gateway Status: Online=${status.online}, URL=${status.gatewayUrl}, Error=${status.error || 'none'}`);
  assert(typeof status.online === 'boolean');
  console.log('  ✓ Client gracefully handled offline Hermes Gateway without throwing uncaught exceptions.\n');

  console.log('===============================================================');
  console.log('HERMES CLIENT INTEGRATION TESTS PASSED SUCCESSFULLY!');
  console.log('===============================================================');
}).catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
