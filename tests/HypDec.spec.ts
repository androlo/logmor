import {createHypVar, createRuleVar, createSolverVar, HypVariable, ruleFromVar, Variable} from "../src/Variable";
import {testInterpret} from "./utils";
import Interpreter from "../src/Interpreter";

describe('LogMor', () => {

    describe('hyp declarations', () => {

        test('interpreting a hypothetical successfully', () => {
            const int = new Interpreter();
            testInterpret(int, `hyp H "p" "n"`);
            const v = int.getVariable('H');
            expect(v).toBeDefined();
            const vDef = v as Variable;
            expect(vDef.id).toBe('H');
            expect(vDef.type).toBe('hyp');
            const vDefHyp = vDef as HypVariable;
            expect(vDefHyp.meta[0]).toBe('p');
            expect(vDefHyp.meta[1]).toBe('n');
        });

        test('fail with custom error if malformed name', () => {
            const int = new Interpreter();
            const res = testInterpret(int,`hyp -`);
            expect(res.messages.length).toBe(2);
            expect(res.messages[1].message).toMatch(`Missing or malformed variable name in 'hyp' declaration`);
        });

        test('fail with custom error if only hyp keyword and nothing else', () => {
            const int = new Interpreter();
            const res = testInterpret(int,`hyp`);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`Missing or malformed variable name in 'hyp' declaration`);
        });

        test('fail with custom error if malformed first quoted string', () => {
            const int = new Interpreter();
            const res = testInterpret(int,`hyp X -`);
            expect(res.messages.length).toBe(2);
            expect(res.messages[1].message).toMatch(`Missing or malformed first quoted string parameter`);
        });

        test('fail with custom error if only hyp and var name and nothing else', () => {
            const int = new Interpreter();
            const res = testInterpret(int,`hyp X`);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`Missing or malformed first quoted string parameter`);
        });

        test('fail with custom error if malformed second quoted string', () => {
            const int = new Interpreter();
            const res = testInterpret(int,`hyp X "a" -`);
            expect(res.messages.length).toBe(2);
            expect(res.messages[1].message).toMatch(`Missing or malformed second quoted string parameter`);
        });

        test('fail with custom error if missing second quoted string', () => {
            const int = new Interpreter();
            const res = testInterpret(int,`hyp X "p"`);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`Missing or malformed second quoted string parameter`);
        });

        test('fail with custom error if first quoted string is empty', () => {
            const int = new Interpreter();
            const res = testInterpret(int,`hyp X "" "n"`);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`The quoted strings in 'hyp' declarations must not be empty.`);
        });

        test('fail with custom error if second quoted string is empty', () => {
            const int = new Interpreter();
            const res = testInterpret(int,`hyp X "p" ""`);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`The quoted strings in 'hyp' declarations must not be empty.`);
        });

    });

});
