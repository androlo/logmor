import {
    CstParser,
    ILexingError,
    IRecognitionException,
    Lexer
} from 'chevrotain';

import {
    allTokens,
    TAnd, TDef, TEq, TID, TImpl, TLParen,
    TOr, TQUOTED_STRING, TRParen, TRule, TRun,
    TSolver, TXor, TSim, TCompare, TDot, TBoolLit,
    TIs, TMoralLit, THyp, TSolverRuleOP, TPrint, TNot, TPrimary
} from './Tokens';
import {LMParserErrorProvider} from "./Errors";

export interface ParserResult {
    cst: any;
    lexErrors: ILexingError[];
    parseErrors: IRecognitionException[];
}

const LLexer = new Lexer(allTokens);

export class Parser extends CstParser {
    public static createParser(): Parser {
        const parser = new Parser();
        parser.performSelfAnalysis();
        return parser;
    }

    private constructor() {
        super(allTokens, {
            errorMessageProvider: LMParserErrorProvider
        });
    }

    private readonly parenthesizedExpression = this.RULE('parenthesizedExpression', () => {
        this.CONSUME(TLParen);
        this.SUBRULE(this.logicalEQExpression);
        this.CONSUME(TRParen);
    });

    private readonly primaryExpression = this.RULE('primaryExpression', () => {
        this.OR([
            {ALT: () => this.CONSUME(TID)},
            {ALT: () => this.SUBRULE(this.parenthesizedExpression)}
        ]);
        this.OPTION(() => {
            this.CONSUME(TDot);
            this.CONSUME(TBoolLit);
        });
    });

    private readonly logicalNOTExpression = this.RULE('logicalNOTExpression', () => {
        this.OR([
            {ALT: () => {
                this.CONSUME(TNot);
                this.SUBRULE(this.logicalEQExpression);
            }},
            {ALT: () => this.SUBRULE(this.primaryExpression)}
        ]);
    });

    private readonly logicalANDExpression = this.RULE('logicalANDExpression', () => {
        this.SUBRULE(this.logicalNOTExpression);
        this.MANY(() => {
            this.CONSUME(TAnd);
            this.SUBRULE2(this.logicalNOTExpression);
        });
    });

    private readonly logicalXORExpression = this.RULE('logicalXORExpression', () => {
        this.SUBRULE(this.logicalANDExpression);
        this.MANY(() => {
            this.CONSUME(TXor);
            this.SUBRULE2(this.logicalANDExpression);
        });
    });

    private readonly logicalORExpression = this.RULE('logicalORExpression', () => {
        this.SUBRULE(this.logicalXORExpression);
        this.MANY(() => {
            this.CONSUME(TOr);
            this.SUBRULE2(this.logicalXORExpression);
        });
    });

    private readonly logicalImplExpression = this.RULE('logicalImplExpression', () => {
        this.SUBRULE(this.logicalORExpression);
        this.MANY(() => {
            this.CONSUME(TImpl);
            this.SUBRULE2(this.logicalORExpression);
        });
    });

    private readonly logicalEQExpression = this.RULE('logicalEQExpression', () => {
        this.SUBRULE(this.logicalImplExpression);
        this.MANY(() => {
            this.CONSUME(TEq);
            this.SUBRULE2(this.logicalImplExpression);
        });
    });

    private readonly hypDeclaration = this.RULE('hypDeclaration', () => {
        this.CONSUME(THyp);
        this.CONSUME(TID);
        this.CONSUME(TQUOTED_STRING);
        this.CONSUME2(TQUOTED_STRING);
    });

    private readonly ruleDeclaration = this.RULE('ruleDeclaration', () => {
        this.CONSUME(TRule);
        this.CONSUME(TID);
        this.CONSUME(TDef);
        this.SUBRULE(this.logicalEQExpression);
        this.OPTION(() => {
            this.CONSUME(TIs);
            this.CONSUME(TMoralLit);
        });
    });

    private readonly solverDeclaration = this.RULE('solverDeclaration', () => {
        this.CONSUME(TSolver);
        this.CONSUME(TID);
        this.CONSUME(TQUOTED_STRING);
    });

    private readonly solverStatement = this.RULE('solverStatement', () => {
        this.CONSUME(TSolver);
        this.CONSUME(TID);
        this.OR([
            {
                ALT: () => {
                    this.CONSUME(TSolverRuleOP);
                    this.CONSUME2(TID);
                }
            },
            {
                ALT: () => {
                    this.CONSUME(TRun);
                }
            },
            {
                ALT: () => {
                    this.CONSUME(TPrint);
                }
            },
            {
                ALT: () => {
                    this.CONSUME(TPrimary);
                    this.CONSUME3(TID);
                }
            }
        ]);

    });

    private readonly compareStatement = this.RULE('compareStatement', () => {
        this.CONSUME(TCompare);
        this.OR([
            {ALT: () => this.CONSUME(TSim)}
        ]);
        this.CONSUME(TID);
        this.CONSUME2(TID);
    });

    private readonly program = this.RULE('program', () => {

        this.MANY(() => {
            this.SUBRULE(this.hypDeclaration);
        });

        this.MANY2(() => {
            this.SUBRULE(this.ruleDeclaration);
        });

        this.MANY3(() => {
            this.SUBRULE(this.solverDeclaration);
        });

        this.MANY4(() => {
            this.SUBRULE(this.solverStatement);
        });

        this.MANY5(() => {
            this.SUBRULE(this.compareStatement);
        });

    });

    parse(script: string): ParserResult {
        const lexResult = LLexer.tokenize(script);

        // setting a new input will RESET the parser instance's state.
        this.input = lexResult.tokens;

        // any top level rule may be used as an entry point
        const cst = this.program();

        return {
            cst: cst,
            lexErrors: lexResult.errors,
            parseErrors: parser.errors
        };
    }
}

export const parser = Parser.createParser();
