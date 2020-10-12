# Logical Morality Tutorial

This tutorial explains the basics of how LogMor works, and how to create a simple program. To understand how propositions and hypotheticals works, and how they can be put on a format suitable for a program like LogMor, you could read an article on basic logic such as: https://brewminate.com/an-introduction-to-basic-logic/.

Several examples of LogMor script can also be found here: https://github.com/androlo/logmor/tree/main/script. You can click on a file to open it, then copy the script into the [LogMor app](https://androlo.github.io/) to get syntax highlighting and to run it.

- [Script](#script)
  * [1 - Declaring hypotheticals](#1---declaring-hypotheticals)
  * [2 - Declaring rules](#2---declaring-rules)
    + [Hypotheticals in rules](#hypotheticals-in-rules)
    + [Logical operators](#logical-operators)
    + [Moral judgements](#moral-judgements)
    + [Continuing on...](#continuing-on)
    + [Neutral rules](#neutral-rules)
  * [3 - Solvers](#3---solvers)
    + [Adding rules](#adding-rules)
    + [Running solvers](#running-solvers)
    + [Printing the result of a solver](#printing-the-result-of-a-solver)
  * [5 Comparisons](#5-comparisons)
  * [6 Output](#6-output)
    + [Solver print](#solver-print)
- [LogMor in-depth](#logmor-in-depth)
  * [Logical rules and SAT-solvers](#logical-rules-and-sat-solvers)
    + [1 - Boolean variables](#1---boolean-variables)
    + [2 - The state space](#2---the-state-space)
    + [3 - Formulas](#3---formulas)
    + [The SAT-solver](#the-sat-solver)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>


## Script

In this tutorial we will go over the basic parts of a simple program:

```
// Is it morally right to steal food?

// Hypotheticals.
hyp FoodTheft "Person X stole some food." "Person X did not steal any food."
hyp StarvingChildren "The children of person X are starving." "The children of person X are not starving."

// true + true: person X stole food because his children were starving.
// true + false: person X stole food despite his children being well fed.
// false + true: person X has not stolen any food, even though his children are starving.
// false + false: person X has not stolen any food, and his children are well fed.

// Rules

// This rule states that the stealing of food is morally acceptable (or good) if
// the children of person X is starving. 
rule ChildrenRule = FoodTheft.pos and StarvingChildren.pos is good

// This rule will be used to filter out states that we are indifferent to, meaning we 
// either consider them to be neutral, or we simply don't care to judge them at all.
rule IndifferenceRule = FoodTheft.false and StarvingChildren.either

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

This example is a very simple script containing two hypotheticals, one main good-or-bad rule, one indifference rule, and one solver. We will start by going over its main parts.

A script is made up of five sections:

1. Declaration of hypotheticals.
2. Declaration of rules.
3. Declaration of solvers.
4. Configuration and execution of solvers.
5. (optional) Comparisons of solver results.

The order of these sections is enforced, and failing to put the statements in the right order will result in an error. 

### 1 - Declaring hypotheticals

Hypotheticals are statements about the world that could be either true or false. They are declared using the `hyp` keyword, and the general form of a declaration is:

```
hyp <name> "A proposition in the positive." "The same proposition in the negative."
```

The reason why we have to state the proposition both in the positive and in the negative is because it may not always be clear what the negation of a statement actually is; for example, the statement "person X killed person Y" could be negated as "person X didn't kill person Y", or "person Y killed person X".

Either way, the example script is about the morality of theft, so we will start by creating a hypothetical about a person stealing some food. The hypothetical contains the proposition *"Person X stole some food"* in both the positive and the negative.

```
hyp FoodTheft "Person X stole some food." "Person X did not steal any food."
```

We now have a *boolean variable* named `FoodTheft` that can be either `true` or `false`, meaning we allow for the case where person X stole some food, and the case where person X didn't steal any food.

- If `FoodTheft` is `true`, we interpret that using the first text, meaning person X stole some food.
- If `FoodTheft` is `false`, we interpret that using the second text, meaning person X didn't steal any food.

We don't have to worry too much about the structure of the text, though, because this program does not analyze the text inside of statements, although is of course important that everyone is clear about what the text actually means.

Next we want to add another hypothetical which could change the moral judgement of this situation:

```
hyp StarvingChildren "The children of person X are starving." "The children of person X are not starving."
```

At this point we have two hypotheticals which gives us a *state space* containing four possible states (or cases):

```
(true, true)   = "Person X stole some food." AND "The children of person X are starving."
(true, false)  = "Person X stole some food." AND "The children of person X are not starving."
(false, true)  = "Person X did not steal any food." AND "The children of person X are starving."
(false, false) = "Person X did not steal any food." AND "The children of person X are not starving."
```

To make it abundantly clear what the hypotheticals are when combined, we could write some additional text commentary in the script (using `//`). For example, we may want to make it clear that the (potential) theft is due to the children starving.

```
// (true, true)  : person X stole food because his children were starving.
// (true, false) : person X stole food even though his children already had food to eat.
// (false, true) : person X did not steal any food even though his children were starving.
// (false; false): person X did not steal any food because his children already had food to eat.
```

### 2 - Declaring rules

As already mentioned, hypotheticals are just statements about the world that could be either true or false. They are inherently amoral, meaning they are just a set of possible states of the world. To add moral judgements about these different states we use *rules*. Rules have the general form:

```
rule <name> = <LogicalFormula> [is good/bad]
```

The name is just a name that we use when referencing our rule. The logical formula is a combination of hypotheticals in various different states formed using logical operators.

#### Hypotheticals in rules

A hypothetical `X` can be expressed on either of the following forms:

```
X           - Means X in the positive: X = true
X.pos       - same
X.true      - same
X.neg       - means X in the negative: X = false
X.false     - same
X.either    - means that X can be in the positive or in the negative: X = true OR X = false
```

#### Logical operators

The logical operations that can be used here are:

```
not X       - Logical NOT (so the same as X.neg and X.false)
X and Y     - Logical AND
X xor Y     - Logical XOR
X or Y      - Logical OR
X impl Y    - Logical implication
X eq Y      - Logical equivalence
```

These operations are also listed in order of their operator precedence from highest to lowest, i.e.:

```
highest         lowest
not, and, xor, or, impl, eq
```

thus, `X and Y or Z` evaluates to `(X and Y) or Z`, not `X and (Y or Z)`.

We can also use parentheses to force priority of evaluation, meaning `X and (Y or Z)` is valid syntax and it means that `R = Y or Z` will be evaluated first, and then `X and R`.

Note that here, `X.either` and `(X.pos or X.neg)` always means the same thing and can be used interchangeably.

#### Moral judgements

The modifier `is good` basically means that all states that satisfy a given rule is morally good. The modifier `is bad` means that the negation of the formula is good, so it is the same as taking the entire logical statement of the rule and `not`:ing it. As an example, with the formula `F = A and B`, the rule: 

`rule MyRule = F is bad` 

is equivalent to:

`rule MyRule = not F is good`.

Finally, the modifier `is good/bad` is optional, and leaving it out is the same as writing `is good`.

#### Continuing on...

We will now go on to state a rule saying that it is morally acceptable (or even good) for person X to steal when his children are starving. That would be written:

```
rule ChildrenRule = BreadTheft.pos and StarvingChildren.pos is good
```

If we analyze this statement, we can see that the only possible "solutions" to this rule is when `BreadTheft = true` and `StarvingChildren = true`, because the formula is `A and B` for some booleans `A and B`, and the only case where `A and B = true` is when `A = true` and `B = true`. If we go back and look at the interpretation of all states we have the list:

```
// (true, true)  : person X stole food because his children were starving.
// (true, false) : person X stole food even though his children already had food to eat.
// (false, true) : person X did not steal any food even though his children are starving.
// (false; false): person X did not steal any food because his children already had food to eat.
```

Thus, the only one of those cases we find morally good (given our rule here) is `(true, true)`, or:

`person X stole food because his children were starving`,

all other cases are (implicitly) morally bad:

```
person X stole food even though his children already had food to eat.           <-- BAD!
person X did not steal any food even though his children are starving.          <-- BAD!
person X did not steal any food because his children already had food to eat.   <-- BAD!
```

One thing we can note here is that we always find it bad when person X does not steal, regardless of whether his children is starving or not. This could be what we intended but if not, we could change this by adding a second rule:

```
rule ChildrenRule = BreadTheft.neg and StarvingChildren.neg is good
```

We can then chain the two rules using `or`, to form a combination of those two rules. The whole sequence would be:

```
rule ChildrenRule = BreadTheft.pos and StarvingChildren.pos is good
rule NoGratuitousTheftRule = BreadTheft.neg and StarvingChildren.neg is good

rule TotalRule = ChildrenRule or NoGratuitousTheftRule is good
```

What this means is that if either of the two rules holds, or both, then that is good. Thus, the rule `TotalRule` will lead to the following judgements:

```
person X stole food because his children were starving                          <-- GOOD!
person X stole food even though his children already had food to eat.           <-- BAD!
person X did not steal any food even though his children are starving.          <-- BAD!
person X did not steal any food because his children already had food to eat.   <-- GOOD!
```

We could also use some tricks to reduce this rule to a single rule that is logically equivalent, namely:

`rule TotalRule = BreadTheft.pos xor StarvingChildren.pos is bad`.

#### Neutral rules

In our moral philosophy we may only care about when something actually gets stolen, so if nothing gets stolen we don't care about whether someone has starving children or not. The two cases without theft are:

```
// (false, true) : person X did not steal any food even though his children are starving.
// (false; false): person X did not steal any food because his children already had food to eat.
```

To omit those cases from consideration we can form a rule that logically includes both of them:

```
rule IndifferenceRule = BreadTheft.false and StarvingChildren.either
```

This rule can then be applied to the solver as an omission rule, and we will see how that is done in the section about solver operations.

### 3 - Solvers

Rules are applied to hypotheticals through something called solvers. A solver is declared using the format:

```
solver <name> [description]
```

Here, `name` is just a name, like for hypotheticals and rules, and the optional `description` is just a quoted string that can be used to add extra information about the solver. For example:

```
solver MySolver "This is a solver. Specifically, it is MY solver."
```

Solvers automatically knows about the hypotheticals that exists in the script, but the rules has to be specified. The reason for this is because we may want to evaluate many solvers with the same hypotheticals but different rules, to compare the results of using those different rules.

#### Adding rules

Rules can be added to solvers in two ways, either as moral rules (good/bad rules) or as indifference rules (neutral rules). To add a moral rule to a solver we use the `apply` keyword:

```
solver <solver_name> apply <rule_name>
```

Thus, if we have a rule called `ChildrenRule` that we want to add to a solver named `MySolver`, the command would be:

```
solver MySolver apply ChildrenRule  
```

To add indifference rules we just use the keyword `omit` in place of `apply`, so if we want to add the rule `IndifferenceRule` to a solver named `MySolver` the command is:

```
solver MySolver omit IndifferenceRule
```

#### Running solvers

A solver has to be run in order to produce the judgements given by its applied (and omitted) rules. This is done using the `run` command:

```
solver <name> run
```

So, in order to run a solver named `MySolver`, the command would be:

```
solver MySolver run
```

Once a solver has been run it will keep its results, which can then be printed, or used in comparisons with the results of other solvers.

#### Printing the result of a solver

To print the results of a solver, we use the `print` command.

```
solver <name> print
```

So, in order to print the result from a solver named `MySolver`, the command would be:

```
solver GergeSolver print
```

Printing a solver requires that it has been run first, otherwise it will yield an error.

### 5 Comparisons

Comparisons are not included in this example, but they are very easy to do. They are comparisons of the results of two different solvers, checking which solutions, and other things. 

Comparisons currently only works with the `sim` command, which shows similarities between two results, but will later be extended to `diff`, which shows differences, and maybe other types of comparison as well. The syntax for `sim` is:

```
compare sim <solver_name> <other_solver_name>
```

### 6 Output

When printing or comparing, the result is a card that appears in the app below the script editor. The card is different depending on what operation was used.

#### Solver print

The solver print card contains the following things:

1. A list of all states that are morally good
2. A list of all states that are morally bad
3. A list of all states that are morally neutral

Together they will add up to the total number of states in the state space. 

There are also some derived numbers and statistics included in the data, which are all explained in the output itself.

## LogMor in-depth 

This program lets people create hypotheticals as booleans (variables that can be true or false), and then label each different possible combined state of those hypotheticals as either good or bad, or neutral. The labeling itself is done using rules rather than having to go over each individual state. The rules approach is simple in principle:

Imagine that we have a bowl of sweets and that we're supposed to let some people know which of them we like, and which of them we don't like. We can do that in two ways:

The first way is to point to each sweet and then say whether we like it or not. 

The other way is to give our answer in the form of a rule, for example:

*I like the sweets that are red, but not the other ones.*

If it is sufficiently clear what "red" means here (meaning there are no multi-colored sweets, or sweets that are "somewhat red-ish" etc.) then this rule is a complete answer because people can find out whether we like a particular sweet or not by looking at its color.

One way to describe the difference between these two approaches is that in the first case we *define* each sweet as being good or bad, and in the second case we instead give a formula that can be used to *deduce* whether a sweet is good or bad from a property that it already has, namely its color.

Formulas are something we use very often in normal life:

*"I could only live in a big city."* - this means that out of all residences there are, only those that are placed inside of big cities are good (for living in).

*"I only drive Renault."* - out of every car there is, only those that are of brand Renault are good (for driving).

*"I eat everything but shrimp."* - out of every food there is, everything is good (for consumption) except shrimp.

This is of course much easier than going over every existing residence, car, and food, and specifying our preferences for each individual one.

### Logical rules and SAT-solvers

#### 1 - Boolean variables

In this system we are not working with sweets but with hypotheticals, meaning statements that can be either `true` or `false`. The logical representation of a hypothetical is a *boolean variable*, meaning a variable that can be either `true` or `false`. This logical representation has no other properties than the truth value: no color, or taste, or brand, or anything else. 

Hypotheticals are expressed using ordinary text, though, and the program will store that text as meta-data; in fact, we even have to declare hypotheticals in both the positive and the negative (because it may not be clear what the logical negation of a statement is), but the text is only used to add context to the values `true` and `false` - it has no effect on the results of any computations.

#### 2 - The state space

This system allows for any number of hypotheticals, meaning we could for example have three variables `A`, `B`, and `C`. The value of each variable is referred to as their `state`, meaning the two possible states of a boolean variable is `true` and `false`. We also have the complete `state space`, which is the states of all existing variables combined. For example, if there is only one boolean variable, `A`, we only have two possible values (or states):

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

Thus, this state space contains 4 possible states where each state is made up of 2 booleans. For 3 booleans `A`, `B`, and `C` we would have a combined total of 8 states and each state would be made up of 3 booleans, for example `(true, false, false)`, and so on.

#### 3 - Formulas

In any system we also have a set of `formulas`, or `rules`. Rules are defined on a set of boolean variables; for example, if we have the three variables `A` `B`, and `C`, we could have a rule:

```
A and (B or not C)
```

Normally we would use variables for rules as well, for example:  `R := A and (B or not C)`, where `:=` means: *is defined as*. This is just to say that the variable `R` is a reference to (or an alias for) the rule `A and (B or not C)`.

When evaluating the rules they are put as equations, the standard form being:

```
F = true
```

where `F` is a rule. In the case of the rule `R`, which we defined as `A and (B or not C)`, one solution would be: 

`A = true, B = false, C = false`,

because if we evaluate the formula for those values we get:

```
A and (B or not C) = true   <=> 
(false or not false) = true <=> 
(false or true) = true      <=> 
true = true
```

In this program we interpret solutions as states that are considered morally good. Thus, in this case, `A = true, B = false, and C = false` is a state that would be considered good, and we could find out what that state actually means by looking at the text interpretation that we added for the values `A = true`, `B = false`, and `C = false` (we will do that when we get to the part about script).

#### The SAT-solver

When the program has mapped all hypotheticals to boolean variables, and all moral rules to logical rules, it will evaluate those rules on the space of those boolean variables using a SAT-solver.

The way morals come in to this is through the following rule: **If a state is a solution, then we consider the interpretation of that state to be morally good, and if a state is not a solution, we consider the interpretation of that state to be morally bad.**

Thus, we can have the single hypothetical `A` where:

```
A = true means "Person X stole some food." 
A = false means "Person X did not steal any food."
```

If we add the rule `not A` and then run this rule (i.e. we find solutions to the equation `not A = true`), the solver will find that the only solution is `A = false`. The way this is interpreted is that we consider it morally good if person `X` did not steal any food, or maybe generally: *it is good not to steal food*. Also, it is implied that if a state doesn't satisfy the rule is must be morally bad, and since the only other state here is `A = true` we implicitly have that: *person X stealing food is bad*. Thus, the rule `not A` can be interpreted as an anti-theft morality, since the stealing of food is considered morally wrong.

That being said though, things are actually a bit more complicated because we also have a third type of state that we exclude from consideration, meaning if an excluded state is a solution then the solution is discarded. For example, we could use the rule  

```
E := A and B and C
```

to rule out solutions for the rule `R` in the previous section. The equation for the new rule `E` would be:

```
E = true
```

This equation has only one solution, `true, true, true`, which would be considered a forbidden solution. If we apply that formula to produce this forbidden state and then run the solver with the formula `A and (B or not C)`, we would end up with two solutions rather than three, because one of the three (would be) solutions for that formula is `true, true, true`.

With forbidden states we divide the original state space up into three sets rather than two: solutions, non-solutions, and forbidden.

The states that are explicitly forbidden in this way is regarded as morally neutral.
