
declare module 'logic-solver' {

    export type FormulaTypeID = 'and' | 'or' | 'xor' | 'not' | 'equiv' | 'implies' | 'exactlyOne' | 'atLeastOne';

    export type Term = string | number;
    export type Operand = Term | Formula;
    export type Operands = Operand | Operands[];
    export type BitsOrOperand = Operand | Bits;
    export type BitsOrOperands = BitsOrOperand | BitsOrOperands[];

    export interface Bits {
        new (): Bits;
        readonly bits: ReadonlyArray<Operand>;
    }

    export interface ANDFormula {
        readonly operands: Operands[];
        type: 'and';
    }

    export interface ORFormula {
        readonly operands: Operands[];
        type: 'or';
    }

    export interface XORFormula {
        readonly operands: Operands[];
        type: 'xor';
    }

    export interface NOTFormula {
        readonly operand: Operand;
        type: 'not';
    }

    export interface ImpliesFormula {
        readonly A: Term;
        readonly B: Term;
        type: 'implies';
    }

    export interface EquivFormula {
        readonly A: Term;
        readonly B: Term;
        type: 'equiv';
    }

    export interface ExactlyOneFormula {
        readonly operands: Term[];
        type: 'exactlyOne';
    }

    export interface AtLeastOneFormula {
        readonly operands: Term[];
        type: 'atLeastOne';
    }

    export type Formula = ANDFormula | ORFormula | XORFormula | NOTFormula | ImpliesFormula | EquivFormula | ExactlyOneFormula | AtLeastOneFormula;

    export interface Solution {
        getMap: () => Record<string, boolean>;
        getTrueVars: () => string[];
        evaluate: (op: Operand) => boolean;
        getFormula: () => Operand;
        getWeightedSum: (ops: Operand[], weights: number[]) => number;
        ignoreUnknownVariables: () => void;
    }

    export interface Solver {
        new (): Solver;
        require: (...ops: Operands[]) => void;
        forbid: (...ops: Operands[]) => void;
        solve: () => void;
        solveAssuming: (op: Operand) => void;
        disablingAssertions: (func: () => any) => void;
        toNameTerm: (t: Term) => string;
        toNumTerm: (t: Term, noCreate?: boolean) => number;
        minimizeWeightedSum: (s: Solution, ops: Operand[], weights: number[]) => Solution;
        maximizeWeightedSum: (s: Solution, ops: Operand[], weights: number[]) => Solution;
    }

    export interface LogicFace {
        readonly NAME_FALSE: '$F';
        readonly NAME_TRUE: '$T';
        readonly NUM_FALSE: 1;
        readonly NUM_TRUE: 2;

        readonly TRUE: '$F';
        readonly FALSE: '$T';

        isNumTerm: (obj: any) => boolean;
        isNameTerm: (obj: any) => boolean;
        isTerm: (obj: any) => boolean;
        isWholeNumber: (n: number) => boolean;
        isFormula: (obj: any) => boolean;

        not: (op: Operand) => NOTFormula;
        or: (...ops: Operands[]) => ORFormula;
        and: (...ops: Operands[]) => ANDFormula;
        xor: (...ops: Operands[]) => XORFormula;
        implies: (op1: Operand, op2: Operand) => ImpliesFormula;
        equiv: (op1: Operand, op2: Operand) => EquivFormula;
        exactlyOne: (...ops: Operands[]) => ExactlyOneFormula;
        atLeastOne: (...ops: Operands[]) => AtLeastOneFormula;

        isBits: (obj: any) => boolean;
        constantBits: (n: number) => Bits;
        variableBits: (name: string, n: number) => Bits;

        equalBits: (b1: Bits, b2: Bits) => Operand;
        lessThan: (b1: Bits, b2: Bits) => Operand;
        lessThanOrEqual: (b1: Bits, b2: Bits) => Operand;
        greaterThan: (b1: Bits, b2: Bits) => Operand;
        greaterThanOrEqual: (b1: Bits, b2: Bits) => Operand;
        sum: (...ops: BitsOrOperands[]) => Bits;
        weightedSum: (ops: Operand[], weights: number[]) => Bits;

        Solver: Solver;
        Bits: Bits;
    }
    const logic : LogicFace;
    export default logic;
}
