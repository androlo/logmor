# Logical Morality Tutorial

- [What this program is](#what-this-program-is)
  * [Logical rules and SAT-solvers](#logical-rules-and-sat-solvers)
    + [1 - Boolean variables](#1---boolean-variables)
    + [2 - The state space](#2---the-state-space)
    + [3 - Formulas](#3---formulas)
    + [SAT-solvers](#sat-solvers)
    + [How LogMor works](#how-logmor-works)
- [Script](#script)
  * [1 - Declaring hypotheticals](#1---declaring-hypotheticals)
  * [2 - Declaring rules](#2---declaring-rules)
    + [Hypotheticals in rules](#hypotheticals-in-rules)
    + [Logical operators](#logical-operators)
    + [Moral judgements](#moral-judgements)
    + [Continuing on...](#continuing-on)
    + [Neutral rules](#neutral-rules)
  * [3 - Declaring solvers](#3---declaring-solvers)
  * [4 - Working with solvers](#4---working-with-solvers)
    + [Adding rules](#adding-rules)
    + [Running solvers](#running-solvers)
    + [Printing the result of a solver](#printing-the-result-of-a-solver)
  * [5 Comparisons](#5-comparisons)
  * [6 Output](#6-output)
    + [Solver print](#solver-print)
      - [Level of amorality](#level-of-amorality)
      - [Permissiveness](#permissiveness)
      - [Moral sophistication](#moral-sophistication)
      - [Moral entropy](#moral-entropy)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>


In this tutorial we will learn how to set up a few hypotheticals, a few rules, and then run the program to find what the different states are. This is the example that will be used:

```
// Is it morally right to steal food?

// Hypotheticals.
hyp BreadTheft "Person X stole some food." "Person X did not steal any food."
hyp StarvingChildren "The children of person X are starving." "The children of person X are not starving."

// true + true: person X stole food because his children were starving.
// true + false: person X stole food despite his children being well fed.
// false + true: person X has not stolen any food, even though his children are starving.
// false + false: person X has not stolen any food, and his children are well fed.

// Rules

// This rule states that the stealing of food is morally acceptable (or good) if
// the children of person X is starving. 
rule ChildrenRule = BreadTheft.pos and StarvingChildren.pos is good

// This rule will be used to filter out states that we are indifferent to, meaning we 
// either consider them to be neutral, or we simply don't care to judge them at all.
rule IndifferenceRule = BreadTheft.false and StarvingChildren.either

// Declare a solver for these hypotheticals and rules.
solver MySolver "The solver used here."

// Apply the "theft is good when children are starving" rule.
solver MySolver apply ChildrenRule  

// Omit the cases that we are indifferent to.
solver MySolver omit IndifferenceRule

// Run the solver. This is when the results are actually computed.
solver MySolver run

// Print the results - sends the output to be presented in the application.
solver MySolver print
```

This code can be copied and pasted into the editor window of the LogMor app without modifications. It is recommended to run this code in the app to get the output, which can then be used as a reference when reading the tutorial section about output.

## What this program is

This program lets people form hypotheticals as booleans (variables that can be true or false), and then label each different possible combined states of those hypotheticals as either good or bad, or neutral. 

The distinction is done using rules rather than having to go over each individual state. To understand the rule approach, imagine that we have a bowl of sweets and that we're supposed to let some people know which of them we like, and which of them we don't like. We can do that in two ways:

The first way is to point to each sweet, or to pick each of them up, and then say whether we like it or not.

The other way is to give our answer in the form of a rule, for example:

*I like the sweets that are red, but not the other ones.*

If it is sufficiently clear what "red" means here (meaning there are no multi-colored sweets, or sweets that are "somewhat red-ish" etc.) then this rule is a complete answer because people can find out whether we like a particular sweet or not by looking at its color.

Logically speaking, these are two different approaches: in the first case we *define* each sweet as being good or bad, and in the second case we give a formula that can be used to *deduce* whether a sweet is good or bad by examining a property that it already has, namely its color.

Formulas are something we use very often in normal life:

*"I could only live in a big city."* - this means that out of all residences there are, only those that are placed inside of big cities are good (for living in).

*"I only drive Renault."* - out of every car there is, only those that are of brand Renault are good (for driving).

*"I eat everything but shrimp."* - out of every food there is, everything is good (for consumption) except shrimp.

This is of course much easier than going over every existing residence, car, and food, and specifying our preferences for each individual one.

### Logical rules and SAT-solvers

#### 1 - Boolean variables

In this system we are not working with sweets but with hypotheticals, meaning statements that can be either `true` or `false`. The logical representation of a hypothetical here is as a boolean variable, meaning a variable that can be either `true` or `false`. Thus, the logical representation of a hypothetical used here has no other properties than its truth value: no color, or taste, or brand, or anything else. Hypotheticals are of expressed using ordinary language, though, and the program will store the text as meta-data, but the system itself does not interpret and use that text in any way.

As an example, we could have a hypothetical `Person X attacked person Y`, which we could store under the variable name `H`, where `H` is a boolean variable that can be either `true` or `false`. The program also keeps track of the text itself so that we know how `H = true` and `H = false` should be interpreted; in fact, in this system we even have to declare hypotheticals in both the positive and the negative (because it may not be clear what the logical negation of a statement is), but the text is only used to add context to the values `true` and `false` for each variable - it has no direct effect on the results of any computations.

#### 2 - The state space

This system allows for any number of hypotheticals, meaning we could for example have three variables `A`, `B`, and `C`. The value of each variable is referred to as their `state`, meaning the two possible states of a boolean variable is `true` and `false`. We also have the complete `state space`, which is the states of all existing variables combined. For example, if there is only one boolean variable, `A`, we have two possible values:

```
A = true
A = false
```

The state space is the set of those two values `P = {true, false}`, which contains two states - `true` and `false`.

If there are 2 booleans, `A` and `B`, we have four possible combined values:

```
(A, B) = (true, true)
(A, B) = (true, false)
(A, B) = (false, true)
(A, B) = (false, false)
```

The state space is the set `P` of all those values, namely:

```
P = { (true, true), (true, false), (false, true), (false, false) }
```

Thus, this state space contains 4 possible states where each state is made up of 2 booleans. For 3 booleans `A`, `B`, and `C` we would have a combined total of 8 states, and each state would be made up of 3 booleans, for example `(true, false, false)`, and so on.

#### 3 - Formulas

In any system we will also have a set of `formulas`, which we will also call `rules`. Rules are defined on a set of boolean variables; for example, if we have the three variables `A` `B`, and `C`, we could have a rule:

```
A and (B or not C)
```

Normally we would use variables for rules as well, for example:  `R := A and (B or not C)`, where `:=` means: *is defined as*, which means that the variable `R` is essentially a reference to (or an alias for) the rule `A and (B or not C)`.

Rules are then put into equations; the standard form being:

```
F = true
```

where `F` is any rule.

To solve an equation we could go over the entire state space and try every possible state to find the ones that solves the equation. In the case of `R = true`, one solution would be: 

`A = true, B = false, C = false`,

because if we evaluate the formula for those values we get: 

```
R = true                    <=> 
A and (B or not C) = true   <=> 
(false or not false) = true <=> 
(false or true) = true      <=> 
true = true
```

Here we interpret solutions as states that are considered morally good. Thus, in this case, `A = true, B = false, and C = false` is a state that would be considered good, and we would find out what that state actually means by looking at the text interpretation of each value.

#### SAT-solvers

In this system we don't have to compute the solutions to these equations ourselves because it is done automatically by a SAT-solver. For example, when we run the rule `R` in the previous section, with its given state space of three booleans, we get the following set of solutions:

```
true, false, false
true, true, false
true, true, true
```

We could of course find these solutions ourselves, for example by running the formula for every possible state and test whether the equation holds, but the solver is much more efficient.

#### How LogMor works

The LogMor program maps hypotheticals (statements that can be either `true` or `false`) to boolean variables, then it maps moral rules to logical rules and evaluates them on the space spanned by those boolean variables. The way morals come in to this is through the following rule: **If a state is a solution, then we consider the interpretation of that state to be morally good, and if a state is not a solution, we consider the interpretation of that state to be morally bad.**

Thus, we can have the single hypothetical `A` where:

```
A = true means "Person X stole some food." 
A = false means "Person X did not steal any food."
```

If we add the rule `not A` and then run this rule (i.e. we find solutions to the equation `not A = true`), the solver will find that the only solution is `A = false`. The way this is interpreted is that we consider it morally good if person `X` did not steal any food, or maybe generally: *it is good not to steal food*. Also, it is implied that if a state doesn't satisfy the rule is must be morally bad, and since the only other state here is `A = true` we implicitly have that: *person X stealing food is bad*. Thus, the rule `not A` can be interpreted as an anti-theft morality, since the stealing of food is considered morally wrong.

That being said though, things are actually a little bit more complicated, because we also have a third type of states that we exclude from consideration, meaning if an excluded state is a solution then the solution is discarded. For example, we could use the rule  

```
E: A and B and C
```

to rule out solutions for the rule `R` in the previous section. The equation for this rule would be:

```
E = true
```

This equation has only one solution, `true, true, true`, which would be considered a forbidden solution. If we apply that formula to produce this forbidden state and then run the solver with the formula `A and (B or not C)`, we would end up with two solutions rather than three, because one of the three (would be) solutions for that formula is `true, true, true`.

With forbidden states we divide the original state space up into three sets rather than two: solutions, non-solutions, and forbidden.

The states that are explicitly forbidden in this way is regarded as neutral, meaning they are to be interpreted as moral indifference.

## Script

Now let us look at the example script. It is a very simple script containing three hypotheticals, one main moral rule as a conjunction of two others, one indifference rule, and one solver. We will start by going over its main parts.

A script is made up of six sections:

1. Declaration of hypotheticals.
2. Declaration of rules.
3. Declaration of solvers.
4. Configuration and execution of solvers.
5. (optional) Comparisons of solver results.

The order of these sections is enforced, and failing to put the statements in the right order will result in an error. 

### 1 - Declaring hypotheticals

Hypotheticals are declared using the `hyp` keyword:

```
hyp <name> "Statement in the positive." "Statement in the negative."
```

In an example about the morality of theft we may for example want to create a hypothetical about someone (call him person X) stealing some food. We add the descriptions of the hypothetical in the positive and in the negative.

```
hyp BreadTheft "Person X stole some food." "Person X did not steal any food."
```

We don't have to worry about what the plain-text statements contains, because this program does not analyze the text inside of statements. It is of course important that everyone is clear about what it means so that everything can be interpreted correctly by the people involved.

Next we want to add another hypothetical that could change someone's moral judgement of this situation:

```
hyp StarvingChildren "The children of person X are starving." "The children of person X are not starving."
```

The positive/negatives may seem unnecessary, but there is potential for ambiguity if the negative is put simply as "the negation" of the first statement when there are many ways to negate a sentence; for example, *"Person X killed person Y"* could be inverted to *"Person X did not kill person Y"* or *"Person Y killed person X"*.

Either way, at this point we have two hypotheticals, each with a positive and a negative, giving us a state space of four possible cases / states:

```
"Person X stole some food." AND "The children of person X are starving."
"Person X stole some food." AND "The children of person X are not starving."
"Person X did not steal any food." AND "The children of person X are starving."
"Person X did not steal any food." AND "The children of person X are not starving."
```

To make it abundantly clear what the hypotheticals are, we could add comments to the text (using `//`). For example, we could clarify that the (potential) theft is due to the children starving.

```
// true + true: person X stole food because his children were starving.
// true + false: person X stole food even though his children already had food to eat.
// false + true: person X did not steal any food even though his children are starving.
// false + false: person X did not steal any food because his children already had food to eat.
```

### 2 - Declaring rules

Hypotheticals can be things that we assume has happened/is happening/will happen, or not, or the possible states of things. They are inherently amoral, meaning they are simply to be seen as facts about the world. The next step is to add moral judgements about the different possible cases, and we do that through rules. Rules have the general form:

```
rule <name> = <LogicalFormula> [is good/bad]
```

The name is just something we call our rule - it has no other significance. The logical formula is a combination of hypotheticals in various different states, strung together using logical operations. The rules for how to form a logical formulas are explained below.

#### Hypotheticals in rules

A hypothetical `X` can be expressed on either of the following forms: 

```
X           - Means X in the positive: X = true
X.pos       - same
X.true      - same
X.neg       - means X in the negative: X = false
X.false     - same
X.either    - means either the positive or negative: X = true OR X = false
```

For `X.either`, we therefore have a composite statements: `X.pos`, `X.neg`, and the logical operation `or`.

#### Logical operators

The logical operations that can be used to string hypotheticals together are:

```
X and Y     - Logical AND
X xor Y     - Logical XOR
X or Y      - Logical OR
X impl Y    - Logical implication
X eq Y      - Logical equivalence
```

These operations are also listed in order of their operator precedence from highest to lowest, i.e.:

```
highest         lowest
and, xor, or, impl, eq
```

thus, `X and Y or Z` evaluates to `(X and Y) or Z`, not `X and (Y or Z)`.

We can also use parentheses to force priority of evaluation, meaning `X and (Y or Z)` is valid syntax and it means that `R = Y or Z` will be evaluated first, and then `X and R`.

Note that here, `X.either` and `(X.pos or X.neg)` always means the same thing and can be used interchangeably.

#### Moral judgements

As mentioned in the section **Logic and SAT**, rules ultimately expresses constraints on the SAT-solver, meaning we are using a logical formula `R` to find the states that solves `R = true`. 

The modifier `is good` basically means that we are fine with this, so if the rule is `R`, we are happy with the "equation" being `R = true`. The modifier `is bad` simply changes this to `not R = true`, meaning it is the same as taking the entire logical statement of the rule and `not`:ing it.

As an example, with `R = A and B`, if we write `rule MyRule = R is bad`, we can use boolean algebra to find the rule as:

`MyRule = R is bad = not R = not (A and B) = not A or not B`.

Finally, the modifier `is good/bad` is optional, and leaving it out is the same as writing `is good`.

#### Continuing on...

We will now go on to state a rule saying that it is ok for person X to steal when his children are starving. That would be written:

```
rule ChildrenRule = BreadTheft.pos and StarvingChildren.pos is good
```


This is a trivial rule, of course, as the only solution to `A and B = true` for any two booleans `A` and `B` is `A = true` and `B = true`, meaning we will end up with one good state `(true, true)` and three bad ones, but that is fine.

#### Neutral rules

In our morality we may only care about when something gets stolen, so if nothing gets stolen we don't care about whether someone's children is starving. To omit those cases from consideration we can form the rule that includes those two cases:

```
rule IndifferenceRule = BreadTheft.false and StarvingChildren.either
```

This rule will then be applied to the solver as an omission rule, which will be done in the next section.

### 3 - Declaring solvers

A solver is declared using the format:

```
solver <name> [description]
```

Here, `name` is just a name, like for hypotheticals and rules, and the optional `description` is just a quoted string that can be used to add extra information about the solver. For example:

```
solver MySolver "The solver used here."
```

### 4 - Working with solvers

There are a number of commands for working with solvers.

#### Adding rules

Rules can be added to solvers in two ways, either as moral rules or as indifference rules. To add a rule to a solver we use the `apply` keyword:

```
solver <solver_name> apply <rule_name>
```

Thus, if we have a rule called `ChildrenRule` that we want to add to a solver named `MySolver`, the command would be:

```
solver MySolver apply ChildrenRule  
```

To add indifference rules we just use the keyword `omit` in place of `apply`, so if we want to add the rule `IndifferenceRule` to a solver named `MySolver` to remove the states that fall under that rule from consideration, the command would be:

```
solver MySolver omit IndifferenceRule
```

The way it works is that if any of the solutions to `IndifferenceRule` are also solutions to the moral rules that was added using `apply`, they will not end up in the set of solutions to those moral rules.

#### Running solvers

A solver has to be run in order to produce its solutions. This is done using the `run` command:

```
solver <name> run
```

So, in order to run the solver from above the command would be:

```
solver MySolver run
```

Once a solver has been run it will keep its results, which can then be printed, or used in comparisons with the results of other solvers.

#### Printing the result of a solver

To print the results of a solver, we use the `print` command.

```
solver <name> print
```

So, in order to print the result from the solver above the command would be:

```
solver GergeSolver print
```

Printing a solver requires that it has been run first, otherwise it will yield an error.

### 5 Comparisons

Comparisons are not included in this example, but they are very easy to do. They are comparisons of the results of two different solvers, checking which solutions, and other things. 

Comparisons currently only works with the `sim` command, which shows similarities between two results, but will later be extended to `diff`, which shows differences, and maybe other types of comparison as well. The syntax for `sim` is:

```
compare <solver_name> <other_solver_name> sim
```

### 6 Output

When printing or comparing, the result is a card that appears in the app below the script editor. The card is different depending on what operation was used.

#### Solver print

The solver print card contains the following things:

1. A list of all states that are morally good
2. A list of all states that are morally bad
3. A list of all states that are morally neutral

Together they will add up to the total number of states in the state space. 

In addition to that there are also some derived numbers and statistics:

##### Level of amorality

The level of amorality is a measure on how many states are neutral, and how many are good or bad. It is given as the fraction: 

```
number of neutral states / number of total states
```

##### Permissiveness

The permissiveness is a measure of the proportion between good and bad states. It is given as the fraction:

```
number of good cases / number of non-neutral cases
```

The proportion of bad states would be the fraction `1 - x`, where `x` is the permissiveness fraction.

Note that this value is undefined when every possible state is neutral, meaning there are no good or bad states at all.

##### Moral sophistication

##### Moral entropy
