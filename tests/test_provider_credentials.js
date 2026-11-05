const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const providers = require('../src/ai-providers');

const originalEnv = process.env.GROQ_API_KEY;
process.env.GROQ_API_KEY = 'example-environment-key';
try {
  const desktop = { provider: 'groq', credentials: {}, allowEnvironmentCredentials: false };
  assert.throws(() => providers.resolveConfig('groq', desktop), /Add your Groq API key/);
  assert.equal(providers.listProviders(desktop).find(p => p.id === 'groq').hasSavedKey, false);
  assert.equal(providers.resolveConfig('groq', {}).apiKey, 'example-environment-key');

  const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');
  const functions = source.slice(source.indexOf('function publicProviderSettings()'), source.indexOf('try { presenceSettings'));
  let disk, failWrite = false;
  const mockFs = {
    mkdirSync() {},
    writeFileSync(_file, data) { if (failWrite) throw new Error('disk unavailable'); disk = data; },
    readFileSync() { return disk; }
  };
  const context = vm.createContext({
    fs: mockFs, path, console, process,
    providerSettingsPath: path.join('local', 'settings.enc'),
    safeStorage: { isEncryptionAvailable: () => true, encryptString: s => s, decryptString: s => s },
    require: name => name === './ai-providers' ? providers : require(name)
  });
  vm.runInContext("let providerSettings = { provider: 'groq', model: '', baseUrl: '', credentials: {}, models: {}, baseUrls: {} };\n" + functions, context);
  vm.runInContext('migrateProviderKeys()', context);
  assert.equal(JSON.parse(disk).credentials.groq, 'example-environment-key');
  assert.equal(vm.runInContext('publicProviderSettings().hasApiKey', context), true);
  assert.equal(vm.runInContext("Object.hasOwn(publicProviderSettings(), 'apiKey')", context), false);
  vm.runInContext("saveProviderSettings({ provider: 'groq', apiKey: 'replacement' })", context);
  assert.equal(JSON.parse(disk).credentials.groq, 'replacement');
  vm.runInContext("saveProviderSettings({ provider: 'openai', apiKey: 'second-provider' })", context);
  vm.runInContext("saveProviderSettings({ provider: 'groq', apiKey: null })", context);
  vm.runInContext('migrateProviderKeys()', context);
  assert.equal(JSON.parse(disk).credentials.groq, undefined, 'forgotten keys must not be reimported');
  assert.equal(JSON.parse(disk).credentials.openai, 'second-provider');
  assert.equal(vm.runInContext('publicProviderSettings().hasApiKey', context), false);
  failWrite = true;
  assert.throws(() => vm.runInContext("saveProviderSettings({ provider: 'groq', apiKey: 'unsaved' })", context), /disk unavailable/);
  assert.equal(vm.runInContext('publicProviderSettings().hasApiKey', context), false, 'failed writes must not change active settings');
  vm.runInContext("providerSettings = { provider: 'groq', apiKey: 'legacy-secret', credentials: {}, models: {}, baseUrls: {} }", context);
  assert.equal(vm.runInContext("Object.hasOwn(publicProviderSettings(), 'apiKey')", context), false, 'legacy keys must not be returned to renderer');
  console.log('Provider migration, replacement, removal, isolation, and failed writes passed.');
} finally {
  if (originalEnv === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = originalEnv;
}
