# Documentation

This is the official documentation for the LogMor web application.

- [Basic language features](#basic-language-features)
  * [Quoted strings](#quoted-strings)
  * [Comments](#comments)
    + [Single-line comments](#single-line-comments)
    + [Multi-line comments](#multi-line-comments)
  * [The difference between quoted strings and comments](#the-difference-between-quoted-strings-and-comments)
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
- [Advice](#advice)
  * [Learn to use AND, and OR/XOR correctly](#learn-to-use-and--and-or-xor-correctly)
  * [Include every hypothetical in every rule](#include-every-hypothetical-in-every-rule)
  * [Use the same basic technique in every system](#use-the-same-basic-technique-in-every-system)
  * [If all else fails - use one rule per state](#if-all-else-fails---use-one-rule-per-state)
- [Finding and fixing errors](#finding-and-fixing-errors)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>


## Basic language features

### Quoted strings

When regular text is required, such as in a `hyp` declaration, it must be provided in the form of a single-line quoted string:

`"I am a valid single-line quoted string."`.

Quoted strings must not span multiple lines:

```
"I am a quoted string, 
but I am not considered valid. I will cause an error."
```

### Comments

Comments are sections of script that are ignored by the interpreter. You can use them to add notes about what a program is doing.

#### Single-line comments

A single-line comment starts with the character sequence `//`. Everything to the right of that sequence is considered part of that comment, including other `//` sequences.

```
// I am a valid single-line comment.
```

```
//I am also a valid single-line comment.
```

```
//                      I am also a valid single-line comment.
```

```
/// // / I !! am %% an && exotic )) but (( valid ½½ çinglé-lînë || cömmen\t. / /\ /\ <> 
```

```
// I am not a valid
single-line comment. I will cause an error.
```

When we start a comment using `//`, the next line will automatically be considered code again meaning we don't have to terminate the comment ourselves. In the example below, `hyp H "something" "something else"` will be interpreted as script.

```
// I am a valid single-line comment.
hyp H "something" "something else" // I am also a valid single-line comment.
// I am also a valid single-line comment.
```

#### Multi-line comments

Multi-line comments are started using `/*` and ended using `*/`. They can be used on single lines too, but are referred to as multi-line because they are allowed to span multiple lines. Examples:

```
/* I am a valid multi-line comment, even though I only use one line. */

/*
    I am a valid multi-line comment that uses
    more
    than
    one 
    line.
*/
```

```
/* I am a valid multi-line comment. */ But this text will cause an error.
```

```
/* I am a valid
multi-line 
comment. */ But this text will cause an error.
```

```
/* I am a valid
multi-line 
comment. */ // And I am a valid, single-line comment.
```

## Commands

There are five types of commands in LogMor script:

- hyp declarations
- rule declarations
- solver declarations
- solver operations
- compare operation

Commands have to be given in that specific order, meaning if a hyp declaration is made after a rule declaration you will get an error.

### hyp declarations

**syntax**

```
hyp <name> <pos> <neg>
```

- **name**: a sequence of alphanumeric characters.
- **pos**: a quoted string. Should express the hypothetical in the positive.
- **neg**: a quoted string. Should express the hypothetical in the negative.

**info**

The `hyp` keyword is used for declaring hypotheticals. A hypothetical is a boolean variable, `H`. The values of `pos` and `neg` are metadata that relates to the values `H = true` and `H = false` respectively. The system does not interpret the data stored in the `pos` and `neg`, or use it in any computations.

**examples**

```
hyp FoodStealingHyp "Person X stole some food." "Person X did not steal any food." 
```

```
hyp SufferingHyp "Person X is suffering." "Person X is not suffering." 
```

### rule declarations

**syntax**

```
rule <name> = <formula> [moral value]
```

- **name**: a sequence of alphanumeric characters.
- **formula**: a logical formula (see the section on [formulas](#formulas)).
- **moral value** (optional): `is good` or `is bad`. The default value is `is good`.

**info**

The `rule` keyword is used for declaring rules.

When `is good` is used, the logical formula is left unmodified. When `is bad` is used, the formula is negated; for example: 

`rule MyRule = A and B is bad`

is equivalent to writing: 

`rule MyRule = not (A and B) is good`.

**examples**

Using `is good`:

```
hyp H "H pos" "H neg"
rule MyRule = H.either is good
```

Using `is bad`:

```
hyp H1 "H1 pos" "H1 neg"
hyp H2 "H2 pos" "H2 neg"
rule MyRule = H1 and H2 is bad
```

Omitting the phrase `is X`, which is the same as using `is good`:

```
hyp H1 "H1 pos" "H1 neg"
hyp H2 "H2 pos" "H2 neg"
rule MyRule = H1.pos or H2.neg
```

### solver declarations

**syntax**

```
solver <name> <meta>
```

- **name**: a sequence of alphanumeric characters.
- **meta**: a quoted string, presumably containing some information about the solver.

**info**

The `solver` keyword is used for declaring solvers.

**examples**

```
solver MySolver "my solver"
```

### solver operations

The `solver` keyword can be used in combination with other keywords to do things with an already declared solver.

#### apply

**syntax**

```
solver <name> apply <rule>
```

- **name**: the name of a solver variable.
- **rule**: the name of a rule variable.

**info**

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

**syntax**

```
solver <name> omit <rule>
```

- **name**: the name of a solver variable.
- **rule**: the name of a rule variable.

**info**

This works the exact same way as `apply` except the rules are combined to find states that are considered invalid solutions. Technically, the omitted rule formula `G` is run to find solutions to `G = true`, and then the `apply`:ed formula `F` is run to find `F = true`. If the state `x` is a solution to `F = true` there are two possibilities: either `x` is a solution to `G = true` as well, in which case it is an invalid solution, or `x` is not a solution to `G = true`, in which case it is a valid solution.

#### primary

**syntax**

```
solver <name> primary <rule>
```

- **name**: the name of a solver variable.
- **rule**: the name of a rule variable.

**info**

Sets a hypothetical as primary, meaning it is the hypothetical that the rules of this solver is ultimately about. This is an optional command, and what it does is to add a flag to the states of the primary hypothetical in the output.

#### run

**syntax**

```
solver run
```

**info**

Runs the backing SAT-solver with the added and omitted rules and stores the results.

Will throw an error if the solver has no `apply`:ed rules.

#### print

**syntax**

```
solver print
```

**info**

Prints the results that are created through `solver run`.

Will throw an error if the solver has not been run.

### compare operations

The `compare` keyword can be used in combination with other keywords to do things with an already declared solver.

#### sim

**syntax**

```
compare sim <solver1> <solver2>
```

- **solver1**: the name of a solver variable.
- **solver2**: the name of a solver variable.

**info**

Prints the good, bad, and neutral states that are common to both solvers along with some relevant statistics.

## Formulas

Formulas are logical formulas on boolean variables that has been declared using `hyp`. They always appear inside of rule statements, e.g:

`rule MyRule = <formula> is good`

If someone does not know basic logic, this seems like a good resource: https://brewminate.com/an-introduction-to-basic-logic/.

For anyone with a STEM education, a good introduction can be the video series https://www.youtube.com/watch?v=EPJf4owqwdA&ab_channel=ComputerScience and https://www.youtube.com/watch?v=2zRJ1ShMcgA&ab_channel=JoeJames, where boolean algebra is exemplified using logic circuits and bits.

**NOTE**: most logic used in this app is very simple, and is possible to learn without going deep into the theory.

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

The formula `H1.neg and H2.either` is equivalent to `not H1 and (H2 or not H3)`.

### Operator precedence

Operators are applied in the following order, from top to bottom:

- **not**
- **and**
- **xor**
- **or**
- **impl**
- **eq**

The precedence of an operation can be changed by using parentheses; for example, an expression `(A op1 B) op2 C` is always evaluated in the order:

`D = A op1 B`, then 

`D op2 C`.

All operations are computed left-to right, meaning for any given operator `op` we have:

`A op B op C op D op ... = ((...(A op B) op C) op D) ...`.

For example:

`A and B and C and D and ... = ((...(A and B) and C) and D) ...`.

**examples**

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

**examples**

Consider the statement *It is good if Gerge becomes happy when he receives an IPAD*. If the hypotheticals are:

```
hyp GergeIPAD "Gerge get IPAD" "Gerge don't get IPAD"
hyp GergeMood "Gerge becomes happy" "Gerge becomes sad"
```

where the mood is to be interpreted as a consequence of the IPAD situation, then the logical rule would be:

`rule GergeRule = GergeIPAD.pos and GergeMood.pos is good`,

because the case we are concerned with is when he receives an ipad, **and** is happy. The rule:

`rule GergeRule = GergeIPAD.pos or GergeMood.pos is good`,

would mean that if Gerge gets an IPAD, or if he is happy (for whatever reason), or both, then that's good. If he doesn't get an IPAD and is still happy, then that is still good, or if he gets an IPAD and is sad, then that is good too.

### Include every hypothetical in every rule

If we have three hypotheticals in a program, `H1`, `H2` and `H3`, we should generally include all of them in every single rule, because **the solutions to every rule depends on the state of every hypothetical in the system**. If we are indifferent to what the value of a specific hypothetical is, then we use `.either`.

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

**Hypotheticals**

- Define the hypotheticals in a clear, concise way.
- Go over them to make sure each one makes sense, and that they make sense when put together.
- Use lots of comments, `//`.

**Rules**

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

**Solvers (and comparisons)**

Working with solvers is trivial, and would normally be reduced to the simple sequence:

declare -> apply rules -> omit rules -> run -> print

Comparisons are also trivial.

### If all else fails - use one rule per state

If finding rules to describe a group of states feels to complicated or weird, just use one rule per state. Consider a system with two hypotheticals:

```
hyp GergeIPAD "Gerge get IPAD" "Gerge don't get IPAD"
hyp GergeMood "Gerge becomes happy" "Gerge becomes sad"
```

```
rule TrueTrueRule   GergeIPAD.pos and GergeMood.pos is good // or 'is bad'
rule TrueFalseRule  GergeIPAD.pos and GergeMood.neg is good // or 'is bad'
rule FalseTrueRule  GergeIPAD.neg and GergeMood.pos is good // or 'is bad'
rule FalseFalseRule GergeIPAD.neg and GergeMood.neg is good // or 'is bad'
```

Finally, we combine those rules into one single rule using *or*:

```
rule CompleteRule = TrueTrueRule or TrueFalseRule or FalseTrueRule or FalseFalseRule is good
```

We can cover every state here because there are only four possible states, but it blows up pretty fast: If there are three hypotheticals we would have eight states, and for four hypotheticals we would have sixteen states, and so on.

## Finding and fixing errors

When the results does not come out right, you should:

1. If there are no results at all, check if there are any error reported in the card below the editor. Errors appear as log messages on a dark background right below the editor. If there are any errors, try fixing them and then run the script again.

2. If the results are not what you expected, start by running the solver for each individual sub-rule to make sure the rule gives you the exact state you expect want, and then combine them to see what the final result becomes.
