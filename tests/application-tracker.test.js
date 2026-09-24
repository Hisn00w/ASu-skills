import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('../assets/application-tracker.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const storageKey = 'offer-skills-application-tracker-v1';

// Run the real page script and its event handlers without adding browser dependencies.
function createTracker(initial = [], { generatedIds = [], confirm = true, failStorage = false } = {}) {
  let saved = JSON.stringify(initial);
  let sequence = 0;
  const elements = new Map();
  const alerts = [];
  const element = (selector) => {
    if (!elements.has(selector)) elements.set(selector, {
      value: selector === '#sortSelect' ? 'date-desc' : '',
      innerHTML: '', textContent: '', style: {}, listeners: {},
      classList: { add() {}, remove() {}, contains() { return false; } },
      addEventListener(event, handler) { this.listeners[event] = handler; },
      insertAdjacentHTML(_position, value) { this.innerHTML += value; },
      focus() {}, reset() {},
    });
    return elements.get(selector);
  };
  vm.runInNewContext(script, {
    document: { querySelector: element, addEventListener() {}, activeElement: { tagName: 'BODY' } },
    localStorage: {
      getItem(key) { assert.equal(key, storageKey); return saved; },
      setItem(key, value) {
        assert.equal(key, storageKey);
        if (failStorage) throw new Error('Storage is full');
        saved = value;
      },
    },
    window: { crypto: { randomUUID: () => generatedIds[sequence++] ?? `generated-${sequence}` } },
    FileReader: class {
      readAsText(file) { this.result = file.content; this.onload(); }
    },
    alert: (message) => alerts.push(message), confirm: () => confirm, setTimeout() {},
  }, { filename: 'application-tracker.html' });
  return {
    element, alerts,
    records: () => JSON.parse(saved),
    importRecords(value, mode = 'merge') {
      element(mode === 'merge' ? '#mergeImportInput' : '#importInput').listeners.change({
        target: { files: [{ content: JSON.stringify(value) }], value: '' },
      });
    },
    clickRecord(id, action) {
      element('#recordBody').listeners.click({ target: {
        closest: (selector) => selector === `[data-${action}]` ? { dataset: { [action]: id } } : null,
      } });
    },
    saveRecord() { element('#recordForm').listeners.submit({ preventDefault() {} }); },
  };
}

const record = (overrides = {}) => ({
  id: 'existing-id', date: '2026-09-15', time: '09:00', company: '示例公司甲',
  position: '开发工程师', status: '已投递', next: '', note: '',
  updatedAt: '2026-09-15T09:00:00.000Z', ...overrides,
});

test('merged records with colliding IDs can be edited and deleted independently', () => {
  const original = record();
  const tracker = createTracker([original]);
  tracker.importRecords([record({ company: '示例公司乙' })]);
  const merged = tracker.records();
  assert.equal(merged.length, 2);
  assert.equal(new Set(merged.map((item) => item.id)).size, 2);
  assert.deepEqual(merged[0], original);
  const incomingId = merged[1].id;
  assert.match(tracker.element('#recordBody').innerHTML, new RegExp(`data-edit="${incomingId}"`));

  tracker.clickRecord(incomingId, 'edit');
  assert.equal(tracker.element('#companyInput').value, '示例公司乙');
  tracker.element('#noteInput').value = '仅更新这条记录';
  tracker.saveRecord();
  assert.deepEqual(tracker.records()[0], original);
  assert.equal(tracker.records()[1].note, '仅更新这条记录');

  tracker.clickRecord(incomingId, 'delete');
  assert.deepEqual(tracker.records(), [original]);
});

test('merging distinct IDs preserves both records and their IDs', () => {
  const original = record();
  const incoming = record({ id: 'incoming-id', company: '示例公司乙' });
  const tracker = createTracker([original]);
  tracker.importRecords([incoming]);
  assert.deepEqual(tracker.records(), [original, incoming]);
  assert.match(tracker.alerts.at(-1), /新增 1 条，更新 0 条/);
});

test('business-key matches preserve the local ID and accept only newer data', () => {
  const original = record();
  const tracker = createTracker([original]);
  tracker.importRecords([record({
    id: 'another-backup-id', company: ' 示例公司甲 ', status: 'Offer',
    updatedAt: '2026-09-15T10:00:00.000Z',
  })]);
  const updated = { ...original, status: 'Offer', updatedAt: '2026-09-15T10:00:00.000Z' };
  assert.deepEqual(tracker.records(), [updated]);
  assert.match(tracker.alerts.at(-1), /新增 0 条，更新 1 条/);
  tracker.importRecords([original]);
  assert.deepEqual(tracker.records(), [updated]);
  assert.match(tracker.alerts.at(-1), /新增 0 条，更新 0 条/);
});

test('replacement IDs avoid existing and earlier incoming records, retrying collisions', () => {
  const originals = [record(), record({ id: 'other-existing-id', company: '示例公司乙' })];
  const tracker = createTracker(originals, {
    generatedIds: ['existing-id', 'other-existing-id', 'new-id', 'new-id', 'last-id'],
  });
  tracker.importRecords([
    record({ company: '示例公司丙' }),
    record({ id: 'new-id', company: '示例公司丁' }),
  ]);
  const merged = tracker.records();
  assert.equal(merged.length, 4);
  assert.equal(new Set(merged.map((item) => item.id)).size, 4);
  assert.deepEqual(merged.slice(0, 2), originals);
  assert.deepEqual(merged.slice(2).map((item) => item.company), ['示例公司丙', '示例公司丁']);
});

test('reimporting a colliding backup keeps the assigned ID across reload and backup restore', () => {
  const tracker = createTracker([record()]);
  const incoming = record({ company: '示例公司乙' });
  tracker.importRecords([incoming]);
  const assignedId = tracker.records()[1].id;
  assert.notEqual(assignedId, incoming.id);

  const reloaded = createTracker(tracker.records());
  reloaded.importRecords([{ ...incoming, status: '一面', updatedAt: '2026-09-15T11:00:00.000Z' }]);
  assert.equal(reloaded.records().length, 2);
  assert.equal(reloaded.records()[1].id, assignedId);
  assert.equal(reloaded.records()[1].status, '一面');

  const restored = createTracker();
  restored.importRecords(reloaded.records(), 'replace');
  assert.deepEqual(restored.records(), reloaded.records());
  restored.clickRecord(assignedId, 'delete');
  assert.deepEqual(restored.records(), [record()]);
});

test('duplicate IDs inside a single backup are still reported and skipped', () => {
  const tracker = createTracker();
  tracker.importRecords([record(), record({ company: '示例公司乙' })]);
  assert.deepEqual(tracker.records(), [record()]);
  assert.match(tracker.alerts.at(-1), /跳过 1 条异常记录/);
  assert.match(tracker.alerts.at(-1), /ID 重复/);
});

test('invalid backups leave the existing records intact', () => {
  for (const invalid of [[], {}, [null], [record({ status: 'unknown' })]]) {
    const original = record();
    const tracker = createTracker([original]);
    const previousRows = tracker.element('#recordBody').innerHTML;
    tracker.importRecords(invalid);
    assert.deepEqual(tracker.records(), [original]);
    assert.equal(tracker.element('#recordBody').innerHTML, previousRows);
    assert.match(tracker.alerts.at(-1), /导入失败/);
  }
});

test('cancelling a replacement import preserves the existing records', () => {
  const original = record();
  const tracker = createTracker([original], { confirm: false });
  tracker.importRecords([record({ company: '示例公司乙' })], 'replace');
  assert.deepEqual(tracker.records(), [original]);
  assert.deepEqual(tracker.alerts, []);
});

test('a failed storage write during collision handling preserves storage and rendered rows', () => {
  const original = record();
  const tracker = createTracker([original], { failStorage: true });
  const previousRows = tracker.element('#recordBody').innerHTML;
  tracker.importRecords([record({ company: '示例公司乙' })]);
  assert.deepEqual(tracker.records(), [original]);
  assert.equal(tracker.element('#recordBody').innerHTML, previousRows);
  assert.match(tracker.alerts.at(-1), /无法写入浏览器存储/);
});
