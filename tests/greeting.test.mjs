import assert from "node:assert/strict";
import test from "node:test";
import { GET } from "../app/api/greeting/route.js";

test("GET /api/greeting returns both Vietnamese card messages", async () => {
  const response = await GET();
  const greeting = await response.json();

  assert.equal(response.status, 200);
  assert.equal(greeting.occasion, "Ngày Phụ nữ Việt Nam");
  assert.equal(greeting.cards.length, 2);
  assert.equal(greeting.cards[0].date, "20 · 10");
  assert.ok(greeting.cards[1].body.length > 40);
});
