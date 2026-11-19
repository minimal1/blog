import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseDocument } from "yaml";

const root = new URL("../", import.meta.url);
const ruleset = JSON.parse(await readFile(new URL(".github/rulesets/main-required-checks.json", root), "utf8"));
const workflows = await Promise.all(["content-check", "performance"].map(async (name) => {
  const document = parseDocument(await readFile(new URL(`.github/workflows/${name}.yaml`, root), "utf8"));
  assert.deepEqual(document.errors, []);
  return document.toJS();
}));

test("every required check runs on PRs without file filters or silent failure", () => {
  const available = new Map();
  for (const workflow of workflows) {
    assert.ok(Object.hasOwn(workflow.on, "pull_request"), workflow.name);
    const trigger = workflow.on.pull_request ?? {};
    for (const filter of ["paths", "paths-ignore", "branches", "branches-ignore", "types"]) {
      assert.equal(trigger[filter], undefined, `${workflow.name}: ${filter} can leave a required check pending`);
    }
    for (const [id, job] of Object.entries(workflow.jobs)) {
      assert.equal(job.if, undefined, `${id}: required checks must execute`);
      assert.ok(!job["continue-on-error"], `${id}: failures must propagate`);
      for (const step of job.steps) assert.ok(!step["continue-on-error"], `${id}: step failures must propagate`);
      const context = job.name ?? id;
      assert.ok(!available.has(context), `Ambiguous check name: ${context}`);
      available.set(context, job);
    }
  }
  const checks = ruleset.rules.find((rule) => rule.type === "required_status_checks").parameters.required_status_checks;
  for (const check of checks) assert.ok(available.has(check.context), `Missing check: ${check.context}`);
  assert.equal(checks.length, available.size, "Both CI jobs must be required");
});

test("the importable rule targets main and requires current GitHub Actions checks without bypasses", () => {
  assert.equal(ruleset.target, "branch");
  assert.equal(ruleset.enforcement, "active");
  assert.deepEqual(ruleset.conditions.ref_name, { include: ["refs/heads/main"], exclude: [] });
  assert.deepEqual(ruleset.bypass_actors, []);
  const parameters = ruleset.rules.find((rule) => rule.type === "required_status_checks").parameters;
  assert.equal(parameters.strict_required_status_checks_policy, true);
  assert.deepEqual(parameters.required_status_checks.map((check) => check.context).sort(), ["content", "lighthouse"]);
  assert.ok(parameters.required_status_checks.every((check) => check.integration_id === 15368));
});
