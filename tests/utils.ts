import Interpreter, {ExecutionController} from "../src/Interpreter";
import Logic, {ANDFormula, EquivFormula, Formula, ImpliesFormula, ORFormula, XORFormula} from "logic-solver";
import exp from "constants";

export const testInterpret = (int: Interpreter, script: string) => {
    return int.interpret(script, new ExecutionController());
}

export const testANDFormula = (data: any): ANDFormula => {
    expect(Logic.isFormula(data)).toBe(true);
    const frm = data as Formula;
    expect(frm.type).toBe('and');
    return frm as ANDFormula;
};

export const testORFormula = (data: any): ORFormula => {
    expect(Logic.isFormula(data)).toBe(true);
    const frm = data as Formula;
    expect(frm.type).toBe('or');
    return frm as ORFormula;
};

export const testXORFormula = (data: any): XORFormula => {
    expect(Logic.isFormula(data)).toBe(true);
    const frm = data as Formula;
    expect(frm.type).toBe('xor');
    return frm as XORFormula;
};

export const testImpliesFormula = (data: any): ImpliesFormula => {
    expect(Logic.isFormula(data)).toBe(true);
    const frm = data as Formula;
    expect(frm.type).toBe('implies');
    return frm as ImpliesFormula;
};

export const testEquivFormula = (data: any): EquivFormula => {
    expect(Logic.isFormula(data)).toBe(true);
    const frm = data as Formula;
    expect(frm.type).toBe('equiv');
    return frm as EquivFormula;
};

export const compArrs = (arr1: string[][], arr2: string[][]): void => {
    expect(arr1.length).toBe(arr2.length);
    for (let i = 0; i < arr1.length; i++) {
        compArr(arr1[i], arr2[i]);
    }
}

export const compArr = (a1: string[], a2: string[]): void => {
    expect(a1.length).toBe(a2.length);
    for (let i = 0; i < a1.length; i++) {
        expect(a1[i]).toBe(a2[i]);
    }
};
