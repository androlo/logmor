# Documentation

This is the official documentation for the LogMor web application.

- [Commands](#commands)
  * [hyp declarations](#hyp-declarations)
  * [rule declarations](#rule-declarations)
  * [solver declarations](#solver-declarations)
  * [solver operations](#solver-operations)
    + [apply](#apply)
    + [omit](#omit)
    + [run](#run)
    + [print](#print)
  * [compare operations](#compare-operations)
    + [sim](#sim)
- [Formulas](#formulas)
  * [Logical operators](#logical-operators)
  * [Dot-expressions](#dot-expressions)
  * [Operator precedence](#operator-precedence)
      - [examples](#examples-3)
- [Advice](#advice)
  * [Learn to use AND, and OR/XOR correctly](#learn-to-use-and--and-or-xor-correctly)
    + [examples](#examples-4)
  * [Include every hypothetical in every rule](#include-every-hypothetical-in-every-rule)
- [Finding and fixing errors](#finding-and-fixing-errors)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>

## Basic language features

### Quoted strings

When regular text is required by a command, it is added in the form of a single-line quoted string:

`"Hello I am a quoted string, and I am considered valid."`.

Text arguments are required when declaring hypotheticals, for example.

Quoted strings can't span multiple lines, meaning you can't write it like this:

```
"Hello I am a quoted string, 
but I am not considered valid."
```

If a line break is found in a quoted string the interpreter will throw an error.

### Comments

Comments are sections of script that are ignored by the interpreter. They are normally used for adding notes about what the script is actually doing. 

#### Single-line comments

A single-line comment starts with the sequence `//`, as in the following examples:

```
// I am a comment.
hyp H "something" "something else"  // I am a comment too.
```

```
// If both gets an IPAD, Gerge should be happy.
rule BothGetRule = GergeIPAD.pos and JeryIPAD.pos and GergeMood.pos is good
```

When we start a comment using `//`, the next line is automatically considered code, meaning we don't need to terminate the comment ourselves.

#### Multi-line comments

Multi-line comments are started using `/*` and ended using `*/`. They can be used on single lines too, but are generally referred to as multi-line since they can potentially span multiple lines, and that is what distinguishes them from comments beginning with `//`. Examples:

```
/* Hello I am a multi-line comment that only uses one line. */

/*
    Hello I am a multi-line comment that uses
    more
    than
    one 
    line.
*/
```

## Commands

There are five types of commands in LogMor script:

- hyp declarations
- rule declarations
- solver declarations
- solver operations
- compare operation

The commands have to be made in that given order, meaning if a hyp declaration is made after a rule declaration you will get an error.

### hyp declarations

##### syntax

```
hyp <name> <pos> <neg>
```

- **name**: the name of the hypothetical.
- **pos**: a quoted string, should express the hypothetical in the positive.
- **neg**: a variable name, should express the hypothetical in the negative.

##### info

The `hyp` keyword is used to declare a hypothetical.

A hypothetical is a boolean variables, `H`, and the values of `pos` and `neg` are just metadata that relates to the values `H = true` and `H = false`. The system does not interpret the data stored in the `pos` and `neg` in any way, or use it in any computations.

##### examples

```
hyp FoodStealingHyp "Person X stole some food." "Person X did not steal any food." 
```

```
hyp SufferingHyp "Person X is suffering." "Person X is not suffering." 
```

### rule declarations

##### syntax

```
rule <name> = <formula> [moral value]
```

- **name**: the name of the rule.
- **formula**: a logical formula (see the section on [formulas](#formulas)).
- **moral value** (optional): `is good` or `is bad`. The default value is `is good`.

##### info

The `rule` keyword is used to declare a rule.

When `is good` is used, the logical formula is left unmodified. When `is bad` is used, the formula is inverted, i.e. `F` is changed to `not F`; for example: 

`rule MyRule = A and B is bad`

is equivalent to writing: 

`rule MyRule = not (A and B) is good`.

##### examples

Using `is good`:

```
hyp H "H pos" "H neg"
rule MyRule = H.either is good
```

Using `is bad`:

```
hyp H1 "H1 pos" "H1 neg"
hyp H2 "H2 pos" "H2 neg"
rule MyRule = (H1 and H2) is bad
```

Omitting `is X`, which is the same as using `is good`:

```
hyp H1 "H1 pos" "H1 neg"
hyp H2 "H2 pos" "H2 neg"
rule MyRule = H1.pos or H2.neg
```

### solver declarations

##### syntax

```
solver <name> <meta>
```

- **name**: the name of the solver.
- **meta**: a quoted string, presumably containing some information about the solver.

##### info

The `solver` keyword can be used to declare a solver.

##### examples

```
solver MySolver "my solver"
```

### solver operations

The `solver` keyword can be used in combination with other keywords to do things with an already declared solver.

#### apply

##### syntax

```
solver apply <rule>
```

- **rule**: the name of a rule variable.

##### info

Applies a rule to the solver, which will be used when the solver is run using the `solver run` command.

This command can be run any number of times, to add any number of rules. If more than one rule is added, the rules will be `and`:ed when the solver is run. Thus, the following two scripts does the exact same thing:

```
hyp H1 "H1 pos" "H1 neg"
hyp H2 "H2 pos" "H2 neg"
rule MyRule1 = (H1 or H2)
rule MyRule2 = (H1 xor H2)
solver S "s"
solver S apply MyRule1
solver S apply MyRule2
solver run
```

```
hyp H1 "H1 pos" "H1 neg"
hyp H2 "H2 pos" "H2 neg"
rule MyRule = (H1 or H2) and (H1 xor H2)
solver S "s"
solver S apply MyRule
solver run
```

Technically, the conjunction of all applied rules becomes the formula `F` such that the solutions found by the solver is solutions to the equation `F = true`.

#### omit

##### syntax

```
solver omit <rule>
```

- **rule**: the name of a rule variable.

##### info

This works the exact same way as `apply` except the rules are combined to find states that are considered invalid solutions. Technically, the omitted rule formula `G` is run to find solutions to `G = true`, and then the `apply`:ed formula `F` is run to find `F = true`. If the state `x` is a solution to `F = true` there are two possibilities: either `x` is a solution to `G = true` as well, in which case it is an invalid solution, or `x` is not a solution to `G = true`, in which case it is a valid solution.

#### run

##### syntax

```
solver run
```

##### info

Runs the backing SAT-solver with the added and omitted rules and stores the results.

Will throw an error if the solver has no `apply`:ed rules.

#### print

##### syntax

```
solver print
```

##### info

Prints the results that are created through `solver run`.

Will throw an error if the solver has not been run.

### compare operations

The `compare` keyword can be used in combination with other keywords to do things with an already declared solver.

#### sim

##### syntax

```
compare sim <solver1> <solver2>
```

- **solver1**: the name of a solver variable.
- **solver2**: the name of a solver variable.

##### info

Prints the good, bad, and neutral states that are common to both solvers along with some relevant statistics.

## Formulas

Formulas are logical formulas on boolean variables that has been declared using `hyp`. They always appear inside of rule statements, e.g:

`rule MyRule = <formula> is good`

If someone does not know how to use formal logic and boolean algebra but has some background in philosophy and/or debating, this seems like a very good resource: https://brewminate.com/an-introduction-to-basic-logic/.

For anyone with a STEM education, a good introduction can be the video series https://www.youtube.com/watch?v=EPJf4owqwdA&ab_channel=ComputerScience and https://www.youtube.com/watch?v=2zRJ1ShMcgA&ab_channel=JoeJames, where boolean algebra is exemplified using logic circuits and bits.

**NOTE**: most logical expressions used in this app will be very simple, and is possible to learn without going into the theory.

### Logical operators

The logical operators supported here are:

| op name | description | operands | notes |
|-|-|-|-|
| not | logical NOT | 1 | |
| and | logical AND | 2 | |
| xor | logical XOR | 2 | exclusive or |
| or | logical OR | 2 |  |
| impl | logical implication | 2 | |
| eq | logical equivalence | 2 | |

The operands are variables declared using `hyp` declarations, e.g:

```
hyp H1 = "H1 pos" "H1 neg"
hyp H2 = "H2 pos" "H2 neg"
rule R = H1 and H2
```

### Dot-expressions

Operands can be modified using dot expressions. For a hypothetical `H`:

- `H.pos`       is the same as `H`
- `H.true`      is the same as `H`
- `H.neg`       is the same as `not H`
- `H.false`     is the same as `not H`
- `H.either`    is the same as `(H or not H)`

For example, in the script:

```
hyp H1 = "H1 pos" "H1 neg"
hyp H2 = "H2 pos" "H2 neg"
rule R = H1.neg and H2.either
```

The formula `H1.neg and H2.either` is equivalent to `not H1 and (H2 or not H3)`, or to be even more specific about how the formula is evaluated: `(not H1) and (H2 or (not H3))`.

### Operator precedence

Operators are applied in the following order, from top to bottom:

- **not**
- **and**
- **xor**
- **or**
- **impl**
- **eq**

The default precedences can be overwritten using parentheses, like normal, meaning an expression `(A op1 B) op2 C` is evaluated in the order: 

`D = A op1 B`, then 

`D op2 C`.

All operations are computed left-to right, meaning for any given operator `op` we have:

`A op B op C op D op ... = ((...(A op B) op C) op D) ...`.

For example:

`A and B and C and D and ... = ((...(A and B) and C) and D) ...`.

This however is not important when only working with expressions that only involves `not`, `and`, `or`, and `xor`.

##### examples

`A and not B` is evaluated as `A and (not B)`.

`not A and not B` is evaluated as `(not A) and (not B)`.

`A and B or C` is evaluated as `(A and B) or C`.

`A eq B xor C` is evaluated as `A eq (B xor C)`.

`A and B and C` is evaluated as `(A and B) and C` (which is equivalent to `A and (B and C)`).

## Advice

This is a list of some principles that can help people make fewer mistakes.

### Learn to use AND, and OR/XOR correctly

If I want to combine two booleans, when should I use `and`, and when should I use `or`?

The answer is: 

- If I want **both** the statements to hold, I use `and`. 
- If I want **either** of them to hold **or both**, I use `or`.
- If I want **either** of them to hold **but not both**, I use `xor`.

#### examples

Consider the statement *It is good if Gerge becomes happy when receiving an IPAD*. If the hypotheticals are:

```
hyp GergeIPAD "Gerge get IPAD" "Gerge don't get IPAD"
hyp GergeMood "Gerge becomes happy" "Gerge becomes sad"
```

where the mood is to be interpreted as a consequence of the IPAD situation, then the logical rule would be:

`rule GergeRule = GergeIPAD.pos and GergeMood.pos is good`,

because the case we are concerned with is when he receives an ipad, **and** is happy. The rule:

`rule GergeRule = GergeIPAD.pos or GergeMood.pos is good`,

would mean that if Gerge gets an IPAD, or he is happy (for whatever reason), or both, then either of those cases are good.

### Include every hypothetical in every rule

If we have three hypotheticals `H1`, `H2` and `H3`, we should generally include all of them in every single rule, because the solutions to every rule depends on the state of every hypothetical in the system. If we are indifferent to what the value of a specific hypothetical is, then we use `.either`.

Let's say we have three hypotheticals `H1`, `H2`, and `H3`. Consider the statement *"We want `H1` and `H2` to be true"*. 

This implicitly means that we don't care about `H3`. Thus, to write this as a formula I would write:

`H1.pos and H2.pos and H3.either`

Technically, if we leave `H3` out, it is the same as setting it to `not H3`, meaning: 

`H1.pos and H2.pos`

is the same as

`H1.pos and H2.pos and H3.neg`,

which is wrong in this case, so remember to always include every hypothetical in every statement.

### Use the same basic technique in every system

A good way to work with this system is to follow some general rules. A simple, standard process is this:

#### Hypotheticals

- Define the hypotheticals in a clear, concise way.
- Go over them to make sure each one makes sense, and that they make sense when put together.
- Use lots of comments, `//`.

#### Rules

- Define several rules, where each rule handles one or a few specific cases.
- Include all hypotheticals in each rule using `.either` for those you are indifferent to in each specific case.
- Join all the rules using `or`.

The Gerge and Jery IPAD script is a good example:

```
rule BothGetRule = GergeIPAD.pos and JeryIPAD.pos and GergeMood.pos is good
rule MoodRuleOnlyOne = (GergeIPAD.pos xor JeryIPAD.pos) and GergeMood.neg is good
rule MoodRule = BothGetRule or MoodRuleOnlyOne
```

- Use the same techniques for neutral rules.

#### Solvers (and comparisons)

Working with solvers is trivial, and would normally be reduced to the simple sequence:

declare -> apply rules -> omit rules -> run -> print

Comparisons are also trivial.

## Finding and fixing errors

When the results does not come out right, you should:

1. If there are no results at all, check if there are any error reported in the card below the editor. Errors appear as log messages on a dark background right below the editor. If there are any errors, try fixing them and then run the script again.

2. If the results are not what you expected, start by running the solver for each individual sub-rule to make sure the rule gives you the exact state you expect want, and then combine them to see what the final result becomes.
