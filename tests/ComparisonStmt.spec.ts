import {testInterpret} from "./utils";
import Interpreter from "../src/Interpreter";

describe('LogMor', () => {

    describe('comparison statements', () => {

        test('interpreting a comparison sim statement successfully', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver T "t"
                solver S apply R
                solver T apply R
                solver S run
                solver T run
                compare sim S T
                `);
            expect(res.messages.length).toBe(0);
        });

        test('fail with custom error if no keyword after compare', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver T "t"
                solver S apply R
                solver T apply R
                solver S run
                solver T run
                compare
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`Error in comparison statement`);
        });

        test('fail with custom error if malformed keyword after compare', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver T "t"
                solver S apply R
                solver T apply R
                solver S run
                solver T run
                compare -
                `);
            expect(res.messages.length).toBe(2);
            expect(res.messages[1].message).toMatch(`Error in comparison statement`);
        });

        test('fail with custom error if malformed solver var after sim', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver T "t"
                solver S apply R
                solver T apply R
                solver S run
                solver T run
                compare sim -
                `);
            expect(res.messages.length).toBe(2);
            expect(res.messages[1].message).toMatch(`Missing or malformed solver variable name in 'compare' declaration`);
        });

        test('fail with custom error if no solver var after sim', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver T "t"
                solver S apply R
                solver T apply R
                solver S run
                solver T run
                compare sim 
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`Missing or malformed solver variable name in 'compare' declaration`);
        });

        test('fail with custom error if malformed second solver var', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver T "t"
                solver S apply R
                solver T apply R
                solver S run
                solver T run
                compare sim S -
                `);
            expect(res.messages.length).toBe(2);
            expect(res.messages[1].message).toMatch(`Missing or malformed solver variable name in 'compare' declaration`);
        });

        test('fail with custom error if no second solver var', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver T "t"
                solver S apply R
                solver T apply R
                solver S run
                solver T run
                compare sim S
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`Missing or malformed solver variable name in 'compare' declaration`);
        });

        test('fail with custom error if first var is of type hyp', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver T "t"
                solver S apply R
                solver T apply R
                solver S run
                solver T run
                compare sim H S
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`is not a solver`);
        });

        test('fail with custom error if first var is of type rule', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver T "t"
                solver S apply R
                solver T apply R
                solver S run
                solver T run
                compare sim R S
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`is not a solver`);
        });

        test('fail with custom error if second var is of type hyp', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver T "t"
                solver S apply R
                solver T apply R
                solver S run
                solver T run
                compare sim S H
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`is not a solver`);
        });

        test('fail with custom error if second var is of type rule', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver T "t"
                solver S apply R
                solver T apply R
                solver S run
                solver T run
                compare sim S R
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`is not a solver`);
        });

        test('fail with custom error if first solver has not been run', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver T "t"
                solver T apply R
                solver T run
                compare sim S T
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`has no results`);
        });

        test('fail with custom error if second solver has not been run', () => {
            const int = new Interpreter();
            const res = testInterpret(int,
                `
                hyp H "p" "n"
                rule R = H
                solver S "s"
                solver T "t"
                solver S apply R
                solver S run
                compare sim S T
                `);
            expect(res.messages.length).toBe(1);
            expect(res.messages[0].message).toMatch(`has no results`);
        });

    });

});
