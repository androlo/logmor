# Documentation

## Commands

These are the commands available in LogMor script.

- [hyp declarations](#hyp-declarations)
- [rule declarations](#rule-declarations)
- [solver declarations](#solver-declarations)
- [solver statements](#solver-statements)
  * [apply](#apply)
  * [omit](#omit)
  * [run](#run)
  * [print](#print)
- [compare statements](#compare-statements)
  * [sim](#sim)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>


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

A hypothetical is treated by the system as a boolean variable, `H`, and the values of `pos` and `neg` as metadata that relates to the values `H = true` and `H = false`. The system does not interpret the data stored in the `pos` and `neg` in any way, or use it in any computations.

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
- **formula**: a logical formula (see the section on logical formulas).
- **moral value** (optional): one out of `is good` or `is bad`. If left out, it defaults to 'is good'.

##### info

The `rule` keyword is used to declare a rule.

When `is good` is used, the logical formula is left unmodified. When `is bad` is used, the formula is inverted, i.e. `F` is changed to `not F`; for example, `A and B` becomes `not (A and B)`.

##### examples

```
hyp H "H pos" "H neg"
rule MyRule = H.either is good
```

```
hyp H1 "H1 pos" "H1 neg"
hyp H2 "H2 pos" "H2 neg"
rule MyRule = (H1 and H2) is bad
```

```
hyp H1 "H1 pos" "H1 neg"
hyp H2 "H2 pos" "H2 neg"
rule MyRule = (H1.pos or H2.neg)
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

### solver statements

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

### compare statements

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

### Logical operators

The logical operators supported here are

- **and**   (logical AND)
- **xor**   (logical XOR, exclusive or)
- **or**    (logical OR)
- **impl**  (logical implication)
- **eq**    (logical equivalence)

### Hypotheticals and dot-expressions

The operands are variables declared using `hyp`, e.g.:

```
hyp H1 = "H1 pos" "H1 neg"
hyp H2 = "H2 pos" "H2 neg"
rule R = H1 and H2
```

Hypotheticals can be modified using dot expressions. For a hypothetical `H`:

- `H.pos`       is the same as `H`
- `H.true`      is the same as `H`
- `H.neg`       is the same as `not H`
- `H.false`     is the same as `not H`
- `H.either`    is the same as `(H or not H)`

#### Operator precedence

Operators are applied in the following order, from top to bottom:

- **and**
- **xor**
- **or**
- **impl**
- **eq**

The default precedences can be overwritten using parentheses like normal, meaning an expression `(A op1 B) op2 C` is evaluated in the order `D = A op1 B`, then `D op2 C`.

All operations are computed left-to right, meaning for any given operator `op` we have:

`A op B op C op D op ... = ((...(A op B) op C) op D) ...`

##### examples

`A and B or C` is evaluated as `(A and B) and C`.

`A eq B xor C` is evaluated as `A eq (B xor C)`.
