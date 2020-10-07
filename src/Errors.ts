import {defaultParserErrorProvider, IToken, TokenType} from 'chevrotain';

export type IErrorType =
    'TypeError'
    | 'UnsupportedError'
    | 'OperatorError'
    | 'EvalError'
    | 'ContextError'
    | 'AssignmentError'
    | 'DefinitionError'
    | 'MutabilityError'
    | 'ArithmeticError'
    | 'AssertionError'
    | 'HypothesisError'
    | 'RangeError'
    | 'ArrayError';

export interface IErrorData {
    type: IErrorType;
    token: IToken;
}

type NotAllInputParsedOpts = {
    firstRedundant: IToken;
    ruleName: string;
};

type BuildMismatchTokenOpts = {
    expected: TokenType;
    actual: IToken;
    previous: IToken;
    ruleName: string;
};

type NoViableAltOpts = {
    expectedPathsPerAlt: TokenType[][][]
    actual: IToken[]
    previous: IToken
    customUserDescription: string
    ruleName: string
};

type EarlyExitOpts = {
    expectedIterationPaths: TokenType[][]
    actual: IToken[]
    previous: IToken
    customUserDescription: string
    ruleName: string
};

export class InterpreterJSError extends Error {

    public static create(msg: string, type: IErrorType, token: IToken): InterpreterJSError {
        return new InterpreterJSError(msg, {type, token: token});
    }

    // Assignment, definition and evaluation

    public static createVarDoesNotExist(id: string, token: IToken): InterpreterJSError {
        return new InterpreterJSError(`A variable with id '${id}' does not exist.`, {
            type: 'DefinitionError',
            token: token
        });
    }

    public static createVarAlreadyExists(id: string, token: IToken): InterpreterJSError {
        return new InterpreterJSError(`A variable with id '${id}' already exists.`, {
            type: 'DefinitionError',
            token: token
        });
    }

    public static createReservedName(id: string, token: IToken): InterpreterJSError {
        return new InterpreterJSError(`'${id}' is a reserved name.`, {type: 'DefinitionError', token: token});
    }

    // General

    public static createOpNotRecognized(op: string, symbs: string, token: IToken): InterpreterJSError {
        return new InterpreterJSError(`(BUG) '${op}' operation not recognized: ${symbs}.`, {
            type: 'OperatorError',
            token: token
        });
    }

    public static createOpNotSupportedForType(op: string, type: string, token: IToken): InterpreterJSError {
        return new InterpreterJSError(`'${op}' operation is not supported for type: ${type}.`, {
            type: 'OperatorError',
            token: token
        });
    }

    public readonly data: IErrorData;

    constructor(msg: string, data: IErrorData) {
        super(msg);
        this.data = data;
    }
}

// Need to clean this up.
export const LMParserErrorProvider = {

    buildMismatchTokenMessage: function (options: BuildMismatchTokenOpts) {
        switch (options.expected.name) {
        case 'ID':
            if (options.ruleName === 'hypDeclaration') {
                return `Missing or malformed variable name in 'hyp' declaration on line '${options.previous.startLine}'.`;
            } else if (options.ruleName === 'ruleDeclaration') {
                return `Missing or malformed variable name in 'rule' declaration on line '${options.previous.startLine}'.`;
            } else if (options.ruleName === 'solverStatement') {
                if (options.previous.image === 'solver') {
                    // Solver statement is tested first, and they look the same up to the third token.
                    return `Missing or malformed solver variable name in 'solver' declaration on line '${options.previous.startLine}'.`;
                } else if (options.previous.image === 'apply' || options.previous.image === 'omit') {
                    // Solver statement is tested first, and they look the same up to the third token.
                    return `Missing or malformed rule variable name in 'solver' declaration on line '${options.previous.startLine}'.`;
                }
            } else if (options.ruleName === 'compareStatement') {
                if (options.previous.image === 'sim') {
                    // Solver statement is tested first, and they look the same up to the third token.
                    return `Missing or malformed solver variable name in 'compare' declaration on line '${options.previous.startLine}'.`;
                } else {
                    // Solver statement is tested first, and they look the same up to the third token.
                    return `Missing or malformed solver variable name in 'compare' declaration on line '${options.previous.startLine}'.`;
                }
            }
            break;
        case 'Def':
            return `Missing or malformed '=' in rule declaration on line '${options.previous.startLine}'. A rule must be on the form 'hyp X = ... ' where 'X' is the name, e.g. 'rule MyRule = ...'.`;
        case 'QUOTED_STRING':
            if (options.ruleName === 'hypDeclaration') {
                if (options.previous.tokenType.name === 'ID') {
                    return `Missing or malformed first quoted string parameter (positive statement) in 'hyp' statement on line ${options.previous.startLine}.`;
                } else {
                    return `Missing or malformed second quoted string parameter (negative statement) in 'hyp' statement on line ${options.previous.startLine}.`;
                }
            }
            break;
        case 'MoralLit':
            return `Missing 'good' or 'bad' in rule declaration on line '${options.previous.startLine}'.`;
        default:
        }
        return defaultParserErrorProvider.buildMismatchTokenMessage(options);
    },

    buildNotAllInputParsedMessage: function (options: NotAllInputParsedOpts) {
        switch (options.firstRedundant.image) {
        case 'hyp':
            return `unexpected 'hyp'. Rule declarations must be between hyp declarations and solver declarations.`;
        case 'rule':
            return `unexpected 'rule'. Rule declarations must be between hyp declarations and solver declarations.`;
        case 'solver':
            return `unexpected 'solver'. Solver statements must be between rule declarations and comparisons, and solver declarations must come before solver statements.`;
        case 'compare':
            return `unexpected 'solver'. Solver statements must be between rule declarations and comparisons, and solver declarations must come before solver statements.`;
        default:
        }

        return defaultParserErrorProvider.buildNotAllInputParsedMessage(options);
    },

    buildNoViableAltMessage: function (options: NoViableAltOpts) {
        if (options.previous) {
            switch (options.previous.tokenType.name) {
            case 'Def':
                return `Error in rule declaration on line '${options.previous.startLine}'. Rule declarations must be on the form 'rule <name> = <logic>' where logic is a formula.`;
            case 'ID':
                if (options.ruleName === 'solverStatement') {
                    return `Error in solver declaration on line '${options.previous.startLine}'. Solver statements must be on the form 'solver <name>' followed by a quoted string (in declarations) or a solver operation. Additionally, solver declarations must come before solver statements.`;
                }
                break;
            case 'Compare':
                return `Error in comparison statement on line '${options.previous.startLine}'. 'compare' must be followed with a comparison keyword (e.g. 'sim').`;
            default:
            }
        }
        return defaultParserErrorProvider.buildNoViableAltMessage(options);
    },

    buildEarlyExitMessage: function (options: EarlyExitOpts) {
        return defaultParserErrorProvider.buildEarlyExitMessage(options);
    }

};
