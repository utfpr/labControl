# Comprehensive Booking Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the test suite for `ConflitoReservasService` and `HistoricoReservasService` to ensure 100% logic coverage of conflict detection and status transitions.

**Architecture:** We will use Jest unit tests with mocked TypeORM repositories. The focus is on exhaustive boundary testing for the `ConflitoReservasService` and verifying the integrity of the `HistoricoReservasService` state transitions.

**Tech Stack:** NestJS, Jest, TypeORM.

---

### Task 1: Exhaustive Boundary Testing for `ConflitoReservasService`

**Files:**
- Modify: `api/test/conflito-reservas.service.test.ts`

- [ ] **Step 1: Add test for "Exact Match" overlap**
    - Create a test where the new reservation exactly matches the start and end time of an existing reservation.
    - Expected: Conflict detected.

- [ ] **Step 2: Add test for "Touch" boundaries (no overlap)**
    - Create a test where the new reservation starts exactly when the existing one ends (and vice versa).
    - Expected: No conflict (null).

- [ ] **Step 3: Add test for "Encompassing" overlap**
    - Create a test where the new reservation completely surrounds an existing reservation.
    - Expected: Conflict detected.

- [ ] **Step 4: Add test for "Inside" overlap**
    - Create a test where the new reservation is completely inside an existing reservation.
    - Expected: Conflict detected.

- [ ] **Step 5: Add test for "Month/Year rollover" in aula conflict**
    - Create a test with an `Aula` that spans from December to January.
    - Verify that a reservation in January correctly detects the conflict.

- [ ] **Step 6: Run tests to verify all new cases pass**
    - Run: `npm run test` (or the specific jest command)
    - Expected: All tests pass.

- [ ] **Step 7: Commit**
    - `git add api/test/conflito-reservas.service.test.ts`
    - `git commit -m "test: add exhaustive boundary tests for booking conflicts"`

### Task 2: HistoricoReservasService Robustness & Edge Cases

**Files:**
- Modify: `api/test/historico-reservas.service.test.ts`

- [ ] **Step 1: Add test for empty history retrieval**
    - Mock `historicoRepo.find` to return an empty array.
    - Verify `getHistoricoPorReserva` returns `[]`.

- [ ] **Step 2: Add test for `criarRegistro` with extremely long observations**
    - Verify that the service handles large strings without crashing.

- [ ] **Step 3: Add test for `validarTransicao` with null/undefined status**
    - Verify that the service throws a clear error when an invalid status is passed.

- [ ] **Step 4: Run tests to verify pass**
    - Run: `npm run test`
    - Expected: All tests pass.

- [ ] **Step 5: Commit**
    - `git add api/test/historico-reservas.service.test.ts`
    - `git commit -m "test: add edge cases for booking history service"`

### Task 3: Final Verification and Linting

**Files:**
- All modified files

- [ ] **Step 1: Run global lint check**
    - Run: `yarn lint` in `api` directory.
    - Fix any newly introduced lint errors.

- [ ] **Step 2: Run all tests in the suite**
    - Run: `npm run test`
    - Verify 100% pass rate.

- [ ] **Step 3: Final Commit**
    - `git add .`
    - `git commit -m "test: complete comprehensive booking test suite"`
