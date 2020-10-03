import {formulaToString} from "../src/Interpreter";
import Logic from 'logic-solver';

describe('LogMor', () => {

    describe('formulaToString', () => {

        test('formulaToString for empty array', () => {
            const res = formulaToString([], 'and');
            expect(res).toBe('()');
        });

        test('formulaToString for one positive var', () => {
            const res = formulaToString(['A'], 'and');
            expect(res).toBe('(A)');
        });

        test('formulaToString for one negative var', () => {
            const res = formulaToString(['-A'], 'and');
            expect(res).toBe('(not A)');
        });

        test('formulaToString for double negative var', () => {
            const res = formulaToString(['--A'], 'and');
            expect(res).toBe('(A)');
        });

        test('formulaToString for septuple negative var', () => {
            const res = formulaToString(['-------A'], 'and');
            expect(res).toBe('(not A)');
        });

        test('formulaToString for single and', () => {
            const res = formulaToString(['A', 'B'], 'and');
            expect(res).toBe('(A and B)');
        });

        test('formulaToString for single and with both negative', () => {
            const res = formulaToString(['-A', '-B'], 'and');
            expect(res).toBe('(not A and not B)');
        });

        test('formulaToString for single or', () => {
            const res = formulaToString(['A', 'B'], 'or');
            expect(res).toBe('(A or B)');
        });

        test('formulaToString for single or with both negative', () => {
            const res = formulaToString(['-A', '-B'], 'or');
            expect(res).toBe('(not A or not B)');
        });

        test('formulaToString for single xor', () => {
            const res = formulaToString(['A', 'B'], 'xor');
            expect(res).toBe('(A xor B)');
        });

        test('formulaToString for single xor with both negative', () => {
            const res = formulaToString(['-A', '-B'], 'xor');
            expect(res).toBe('(not A xor not B)');
        });

        test('formulaToString for single implies', () => {
            const res = formulaToString(['A', 'B'], 'implies');
            expect(res).toBe('(A implies B)');
        });

        test('formulaToString for single implies with both negative', () => {
            const res = formulaToString(['-A', '-B'], 'implies');
            expect(res).toBe('(not A implies not B)');
        });

        test('formulaToString for many implies', () => {
            const res = formulaToString([Logic.implies(Logic.implies(Logic.implies('A', 'B'), 'C'), 'D')], 'implies');
            expect(res).toBe('(((A implies B) implies C) implies D)');
        });

        test('formulaToString for single equiv', () => {
            const res = formulaToString(['A', 'B'], 'equiv');
            expect(res).toBe('(A equiv B)');
        });

        test('formulaToString for single equiv with both negative', () => {
            const res = formulaToString(['-A', '-B'], 'equiv');
            expect(res).toBe('(not A equiv not B)');
        });

        test('formulaToString for many equiv', () => {
            const res = formulaToString([Logic.equiv('A', Logic.equiv(Logic.equiv('B', 'C'), 'D'))], 'equiv');
            expect(res).toBe('(A equiv ((B equiv C) equiv D))');
        });

        test('formulaToString for many mixed', () => {
            const res = formulaToString(['A', Logic.or(Logic.equiv('-B', 'C'), '-D'), Logic.xor('E', Logic.equiv('F', 'G'))], 'and');
            expect(res).toBe('(A and ((not B equiv C) or not D) and (E xor (F equiv G)))');
        });

    });

});
