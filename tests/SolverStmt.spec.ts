import {testInterpret} from "./utils";
import Interpreter, {ExecutionController} from "../src/Interpreter";

describe('LogMor', () => {

    describe('solver statements', () => {

        test('interpreting a solver statement successfully', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver S apply R
                `);
            expect(res.messages.length).toBe(0);
        });

        test('fail with custom error if malformed rule name in apply', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                solver S "s"
                solver S apply -
                `);
            expect(res.messages.length).toBe(2);
            expect(res.messages[1].message).toMatch(`Missing or malformed rule variable name in 'solver' declaration`);
        });

        test('fail with custom error if no rule name in apply', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                solver S "s"
                solver S apply
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`Missing or malformed rule variable name in 'solver' declaration`);
        });

        test('fail with custom error if rule in apply is a hyp', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                solver S "s"
                solver S apply H
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`is not a rule`);
        });

        test('fail with custom error if rule in apply is a solver', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                solver S "s"
                solver T "t"
                solver S apply T
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`is not a rule`);
        });

        test('fail with custom error if malformed rule name in omit', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                solver S "s"
                solver S omit -
                `);
            expect(res.messages.length).toBe(2);
            expect(res.messages[1].message).toMatch(`Missing or malformed rule variable name in 'solver' declaration`);
        });

        test('fail with custom error if no rule name in omit', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                solver S "s"
                solver S omit
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`Missing or malformed rule variable name in 'solver' declaration`);
        });

        test('fail with custom error if rule in omit is a hyp', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                solver S "s"
                solver S omit H
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`is not a rule`);
        });

        test('fail with custom error if rule in omit is a solver', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                solver S "s"
                solver T "t"
                solver S omit T
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`is not a rule`);
        });

        test('fail with custom error if run is used before applying rules', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver S run
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`has no applied rules`);
        });

        test('fail with custom error if trying to run twice', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver S apply R
                solver S run
                solver S run
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`has already been run`);
        });

        test('fail with custom error if run is aborted', () => {
            const int = new Interpreter();
            const ec = new ExecutionController();
            ec.aborted = true;
            const res = int.interpret(
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver S apply R
                solver S run
                `, ec);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`Execution of solver aborted`);
        });

    });

});
