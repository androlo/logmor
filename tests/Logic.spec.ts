import {testInterpret} from "./utils";
import Interpreter from "../src/Interpreter";
import Logic from 'logic-solver';

const getRandInt = (max: number) => {
    return Math.floor(Math.random() * (max + 0.9999));
};

const getRandomOP = () => {
    const num = getRandInt(4);
    if (num === 0) {
        return 'and';
    } else if (num === 1) {
        return 'or';
    } else if (num === 2) {
        return 'xor';
    } else if (num === 3) {
        return 'impl';
    } else {
        return 'eq';
    }
}

const getRandomElem = (arr: any[]) => {
    const num = getRandInt(arr.length > 0 ? arr.length - 1 : 0);
    return arr[num];
};

const getPosOrNegOrEither = (n: string) => {
    const num = getRandInt(2);
    if (num === 0) {
        return n + '.pos';
    } else if (num === 1) {
        return n + '.neg';
    } else {
        return n + '.either';
    }
};

const getPosOrNeg = (n: string) => {
    if (getRandInt(1) === 0) {
        return n + '.pos';
    } else {
        return n + '.neg';
    }
};

const getRandLogicString = (hyps: string[]) => {

    let str = '';
    for (let i = 0; i < 100; i++) {
        const num = getRandInt(9) + 1;
        str += '(';
        for (let j = 0; j < num; j++) {
            str += `${getPosOrNegOrEither(getRandomElem(hyps))} ${getRandomOP()} `;
        }
        str += getRandomElem(hyps) + ') ' + getRandomOP() + ' ';
    }
    str += getRandomElem(hyps);
    return str;
}

const getRuleWithRandLogic = () => {
    const hyps = ['H0', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9'];
    let str = '';
    for (let i = 0; i < hyps.length; i++) {
        const hyp = hyps[i];
        str += `hyp ${hyp} "${hyp} pos" "${hyp} neg"\n`;
    }
    str += `rule R = ${getRandLogicString(hyps)}`;
    return str;
}

const TEST_LOGIC = `hyp H0 "H0 pos" "H0 neg" 
    hyp H1 "H1 pos" "H1 neg"
    hyp H2 "H2 pos" "H2 neg"
    hyp H3 "H3 pos" "H3 neg"
    hyp H4 "H4 pos" "H4 neg"
    hyp H5 "H5 pos" "H5 neg"
    hyp H6 "H6 pos" "H6 neg"
    hyp H7 "H7 pos" "H7 neg"
    hyp H8 "H8 pos" "H8 neg"
    hyp H9 "H9 pos" "H9 neg"
    rule R = (H8.either and H6.neg or H7.neg xor H6.neg xor H3.neg or H8.neg xor H5.neg or H6.either impl H4.neg xor H9.pos eq H4) and (H4.pos or H3.neg xor H3.pos or H9.either xor H6.neg xor H0) and (H0.neg xor H3) eq (H5.either eq H4.pos xor H0.either or H8.neg or H7) xor (H9.neg xor H8.neg eq H7.pos and H2.pos and H0.either eq H5.neg and H0.pos or H2.either eq H6.pos or H9) eq (H0.pos impl H2.either or H8.pos xor H3.pos and H8) xor (H3.either impl H4.either impl H6.either and H9.neg eq H6.pos eq H5.either or H5) and (H8.pos impl H4.either and H2.neg and H5) or (H5.neg xor H9.pos impl H9.either or H8.pos eq H5.pos and H0) and (H3.neg xor H6.either xor H0.pos eq H1.either xor H9.neg and H9.either impl H0.either impl H9.either impl H6.pos xor H6) and (H3.pos xor H1.either impl H3.pos eq H9.either xor H7.neg eq H4) eq (H6.pos and H1.either or H1.pos eq H7.neg eq H1.neg and H4.neg eq H1.pos and H7.pos and H4.neg impl H6.neg or H3) eq (H5.pos xor H3.pos eq H9.pos or H8.neg or H5.either and H4) xor (H9.neg xor H4.either or H3.either and H9.pos impl H2.either and H3.either eq H1.neg xor H2) eq (H7.neg or H7.neg or H0.pos xor H3.neg eq H3) xor (H4.pos xor H8.either and H9.pos eq H8.pos and H0) impl (H0.pos or H6.pos and H3.neg impl H2.either impl H1.pos impl H5.either and H6.pos or H3.either or H0.neg or H0.either xor H6) impl (H5.neg and H6.pos or H3.pos eq H8) or (H9.pos impl H6) and (H6.neg xor H6.pos xor H2.either xor H5.neg or H9.pos xor H8.either impl H9.pos eq H8.neg impl H5.either impl H2) and (H7.neg impl H2.either eq H7) eq (H1.either xor H3.pos impl H2.pos eq H3.pos xor H5.neg xor H1.either impl H1.pos eq H9.neg or H3.neg impl H6.either or H9) xor (H1.neg xor H3.either or H1.either or H9.pos and H4.neg xor H0) xor (H9.neg xor H5.either impl H0.pos or H9) eq (H5.neg or H1.either eq H2.pos impl H0.neg eq H1.either impl H4.either and H9.either eq H5.neg xor H7.neg or H2.either impl H7) eq (H4.neg impl H1.either eq H6.either xor H9.pos impl H1.pos or H4.pos eq H0.neg and H1.either and H8.neg or H9.neg xor H3) xor (H2.pos eq H4.pos and H1.either impl H2.neg impl H0.neg and H3.pos xor H0.neg xor H9.pos xor H6.either and H9) xor (H5.neg or H5.either or H0.pos eq H6.pos eq H1.pos xor H8) impl (H4.either and H8.pos and H9.neg impl H7.pos eq H3.either and H0.pos impl H6.either impl H0.neg impl H3.neg eq H6.neg xor H9) xor (H2.either or H5.neg xor H9.either and H5.pos and H2.neg and H5.pos xor H6.either xor H9.pos eq H1.pos eq H0.pos eq H9) xor (H8.pos xor H8.pos eq H2.either eq H0.pos or H1.either impl H3.neg and H4.pos or H1.neg or H0.neg eq H4) impl (H0.pos or H5.pos impl H1.pos and H4.either and H6.neg eq H2.either impl H9.neg impl H9) and (H3.neg and H2.neg impl H1.pos impl H1.neg xor H3.either or H3.pos or H9.pos impl H2.pos impl H6.pos or H1.pos impl H1) eq (H3.pos and H2.neg eq H0.pos impl H4.neg xor H0.either and H7.either impl H4.pos or H1.either and H4.pos xor H8.neg xor H3) or (H1.either and H9) and (H0.either xor H5.pos eq H0.pos eq H2.neg and H8) or (H7.pos eq H9.pos eq H4.neg impl H9.neg or H8) impl (H8.neg eq H2.neg impl H6.neg xor H2.neg impl H7.either and H6.pos and H6.neg or H7.pos or H0.neg xor H8) and (H0.pos and H9.neg or H1.neg impl H5.pos and H0.either eq H8.neg impl H9.either or H1.pos impl H3.pos eq H4.either and H9) or (H9.neg eq H1.neg xor H1.either and H0.pos and H6.either impl H1.either impl H0) xor (H8.neg and H8) impl (H9.either and H0.either and H8.either eq H1.neg impl H6.pos impl H1.neg and H7) and (H9.either impl H2) eq (H6.neg xor H7.either eq H5.pos and H6.pos and H5) eq (H7.neg xor H0.pos impl H7.neg or H7.pos and H5.neg or H7.pos and H5.neg and H9) xor (H6.pos and H3.pos and H7.either and H0) and (H7.pos impl H4.pos xor H9.pos xor H4.either eq H6.neg impl H2) and (H4.neg or H8) xor (H7.neg eq H2.pos impl H0.pos and H9.neg impl H6.pos or H5.pos eq H8.pos or H3.pos xor H6.pos and H6.pos impl H4) or (H8.either xor H0.either eq H1.either and H1.neg and H9.pos or H5.either or H2.neg eq H4.pos xor H0.pos or H3.either impl H5) impl (H1.either xor H3.pos and H2.either or H7) impl (H3.pos or H4.pos impl H8.either impl H4) and (H3.pos xor H9.pos impl H5.neg impl H3.either impl H2.either impl H9.pos xor H4) impl (H8.pos eq H5) and (H9.neg eq H9.neg or H6.pos or H1.either and H2.neg xor H5) eq (H6.neg xor H3.either xor H6.either or H8.either impl H9.pos impl H6.neg and H3) or (H8.neg impl H0.neg impl H7) eq (H7.neg or H1.either impl H3.neg impl H7.either eq H7.either and H6.neg xor H7) or (H8.pos or H1) xor (H5.either impl H4.neg impl H0.pos xor H2.neg eq H2.either eq H6.neg eq H3.neg eq H8.neg xor H7.neg xor H6.either and H1) or (H2.pos and H9.neg and H1.pos xor H4.neg eq H3.pos or H2.pos impl H9) and (H7.neg xor H0.pos xor H1.either and H5.neg eq H0.pos xor H1) impl (H4.neg or H1.pos impl H8.pos or H6.either or H6.neg and H5.neg or H0.pos or H5.either xor H2.either and H7) xor (H7.neg or H4.either or H8) xor (H7.pos and H1.pos impl H5) xor (H9.either xor H8.either and H3.neg and H0.neg xor H1.pos eq H8.either impl H3.pos and H0.neg impl H0) and (H4.neg impl H0.neg eq H4.either impl H0.either and H7.neg impl H2.pos eq H9.neg xor H3.neg and H7.either and H7.neg impl H4) eq (H1.pos xor H3.neg eq H9.neg impl H8.neg or H1.neg or H7.pos and H3.neg xor H6.either or H1.neg eq H6) and (H7.neg eq H8.either xor H0.neg and H4.neg or H6.either or H6.pos impl H7.pos or H8) or (H8.pos or H4.pos xor H5.either impl H7.pos or H8) impl (H6.pos xor H2.pos or H4.neg impl H9.neg and H8.pos eq H4.neg impl H3.neg xor H8.either eq H9) xor (H4.either eq H9) impl (H4.neg or H6.pos or H9.neg eq H4.either and H8.neg eq H4.pos xor H0) impl (H9.neg xor H9.neg impl H6.neg and H2) and (H8.neg or H9.either xor H2) xor (H4.pos or H6.either impl H2.pos and H0.either and H4.either impl H5.either and H8.either xor H8) or (H1.neg xor H6.either eq H6.either xor H1.pos impl H8.pos impl H0.pos and H7.neg eq H9.pos eq H3) and (H4.either impl H9.pos xor H6.pos or H3) or (H9.pos impl H0.either or H3.neg or H2.pos impl H9.pos xor H2.either eq H2.pos and H4.pos impl H4.either eq H8) or (H9.either eq H8.neg xor H6.either or H5.either impl H4.either impl H6.either and H4.either or H7.pos xor H0.pos or H2.pos xor H1) and (H9.pos impl H7.either or H0.neg and H9.pos or H0.neg eq H1) impl (H9.pos eq H6.either eq H1.neg eq H4.either and H0.pos or H2.either eq H5.either or H1.either or H7.neg or H4.neg or H2) xor (H8.pos and H0.pos and H0.pos or H8.either xor H7.pos eq H4.pos eq H3) or (H1.neg or H3.either impl H3.pos xor H4.either or H8.either and H5.pos xor H5.either or H9.neg impl H5) xor (H7.neg xor H6.pos and H5.pos or H7.neg eq H8.neg or H4.neg xor H2.neg eq H4) impl (H4.either impl H0.pos and H4.either or H1.either eq H0) eq (H1.neg xor H3.pos impl H7.either eq H4.pos or H0) eq (H9.either eq H4.pos xor H7.either eq H3.either or H2) impl (H7.either impl H5.either and H0.either xor H7.neg and H3.neg impl H5.neg or H1.pos impl H8) and (H0.either impl H1.pos xor H7.either eq H3.pos eq H3.neg eq H1.pos impl H3.neg and H2.neg and H8.pos eq H5) or (H3.either and H2.neg and H5.neg impl H8.either xor H2.pos eq H1.either or H9) or (H0.pos and H6.neg xor H6.either impl H8.pos and H9.either and H5.either or H9.either and H2.either and H7.pos or H5) or (H3.pos or H9.neg xor H2.neg xor H1.either impl H6.neg impl H2.neg and H2) or (H9.either xor H2.pos and H9) eq (H2.neg xor H3) impl (H0.neg eq H5.neg xor H7.neg or H1.neg and H1.either or H2.neg and H7.pos impl H1.neg impl H6) or (H3.neg or H0.pos and H8.pos impl H3.pos and H4.neg and H7.pos and H6.pos impl H2.either xor H1) and (H6.pos or H7.either and H7.either and H9.neg or H4) and (H6.either or H2.pos and H8.neg xor H0.either impl H8.pos or H8.either or H8.neg impl H1.neg xor H6.either xor H2) eq (H7.neg or H4.either xor H9.neg xor H5) and H0`;

describe('LogMor', () => {

    describe('logic', () => {

        describe('script', () => {

            test('interpreting a long rule declaration successfully', () => {
                const int = new Interpreter();
                const res = testInterpret(int, TEST_LOGIC);
                expect(res.messages.length).toBe(0);
            });

        });

    });

});
