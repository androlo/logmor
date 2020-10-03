import {createHypVar, createRuleVar, createSolverVar, HypVariable, ruleFromVar, Variable} from "../src/Variable";
import {testInterpret} from "./utils";
import Interpreter from "../src/Interpreter";


const TEST_VAR_ID = 'TestID';
const TEST_META_POS = '"TestPOS"';
const TEST_META_NEG = '"TestNEG"';
const TEST_META: [string, string] = [TEST_META_POS, TEST_META_NEG];

describe('LogMor', () => {

    describe('Variable objects', () => {

        test('createHypVar', () => {
            const v = createHypVar(TEST_VAR_ID, TEST_META);
            expect(v.type).toBe('hyp');
            expect(v.id).toBe(TEST_VAR_ID);
            expect(v.meta[0]).toBe(TEST_META_POS);
            expect(v.meta[1]).toBe(TEST_META_NEG);
        });

        test('createRuleVar', () => {
            const v = createRuleVar(TEST_VAR_ID, TEST_META_POS);
            expect(v.type).toBe('rule');
            expect(v.id).toBe(TEST_VAR_ID);
            expect(v.data).toBe(TEST_META_POS);
        });

        test('createSolverVar', () => {
            const v = createSolverVar(TEST_VAR_ID, TEST_META_POS);
            expect(v.type).toBe('solver');
            expect(v.id).toBe(TEST_VAR_ID);
            expect(v.meta).toBe(TEST_META_POS);
            expect(v.solverResult).not.toBeDefined();
            expect(v.rules.length).toBe(0);
            expect(v.pruned.length).toBe(0);
        });

        test('ruleFromVar with hypothetical', () => {
            const v = createHypVar(TEST_VAR_ID, TEST_META);
            const rule = ruleFromVar(v);
            expect(rule).toBe(TEST_VAR_ID);
        });

        test('ruleFromVar with rule', () => {
            const v = createHypVar(TEST_VAR_ID, TEST_META);
            const rule = ruleFromVar(v);
            expect(rule).toBe(TEST_VAR_ID);
        });

        test('ruleFromVar with solver (throws)', () => {
            const v = createSolverVar(TEST_VAR_ID, TEST_META_POS);
            const thrower = () => ruleFromVar(v);
            expect(thrower).toThrow();
        });

    });

});
