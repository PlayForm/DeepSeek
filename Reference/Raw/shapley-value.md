From Wikipedia, the free encyclopedia Concept in game theory In
[cooperative game theory](https://en.wikipedia.org/wiki/Cooperative_game_theory "Cooperative game theory"),
the **Shapley value** is a method
([solution concept](https://en.wikipedia.org/wiki/Solution_concept "Solution concept")) for fairly
distributing the total gains or costs among a group of players who have collaborated. For example,
in a team project where each member contributed differently, the Shapley value provides a way to
determine how much credit or blame each member deserves. It was named in honor of
[Lloyd Shapley](https://en.wikipedia.org/wiki/Lloyd_Shapley "Lloyd Shapley"), who introduced it
in 1951. The Shapley value determines each player's contribution by considering how much the overall
outcome changes when they join each possible combination of other players, and then averaging those
changes. In essence, it calculates each player's average marginal contribution across all possible
coalitions. It is the only solution that satisfies four fundamental properties: efficiency,
symmetry, additivity, and the dummy player (or null player) property, which are widely accepted as
defining a fair distribution. This method is used in many fields, from dividing profits in business
partnerships to understanding feature importance in
[machine learning](https://en.wikipedia.org/wiki/Machine_learning "Machine learning"). Lloyd Shapley
in 2012

## Definition

Suppose we have a situation where players can win certain rewards by cooperating (forming a
coalition) to accomplish a task; such situations are often called
[coalitional games](https://en.wikipedia.org/wiki/Coalitional_game "Coalitional game"). For a
coalition (set of players) {\displaystyle S} , we define the _payoff_ or _value_ function v ( S )
{\displaystyle v(S)} as the total sum of payoffs that the members of {\displaystyle S} can obtain by
cooperating. The Shapley value is one way to divide up the value created by a coalition between its
members. It is a "fair" distribution in the sense that it is the only distribution with certain
desirable properties (listed below). According to the Shapley value, the amount that player
{\displaystyle i} is given in a coalitional game ( v , N ) {\displaystyle (v,N)} is ( v ) = ∑ S ⊆ N
∖ { i } S ! ( n − S − 1 ) ! ( v ( S ∪ { i } ) − v ( S ) ) {\displaystyle \varphi _{i}(v)=\sum
_{S\subseteq N\setminus \\{i\\}}{\frac {|S|!\;(n-|S|-1)!}{n!}}(v(S\cup \\{i\\})-v(S))} = ∑ S ⊆ N ∖ {
i } ( v ( S ∪ { i } ) − v ( S ) ) {\displaystyle \quad \quad \quad ={\frac {1}{n}}\sum _{S\subseteq
N\setminus \\{i\\}}{n-1 \choose |S|}^{-1}(v(S\cup \\{i\\})-v(S))} where {\displaystyle n} is the
total number of players and the sum extends over all subsets {\displaystyle S} of {\displaystyle N}
not containing player {\displaystyle i} , including the empty set. Also note that {\displaystyle {n
\choose k}} is the
[binomial coefficient](https://en.wikipedia.org/wiki/Binomial_coefficient "Binomial coefficient").
The formula can be interpreted as follows: imagine the coalition is formed one actor at a time, with
each actor demanding their contribution v ( S ∪ { i } ) − v ( S ) {\displaystyle v(S\cup
\\{i\\})-v(S)} as a fair compensation, and then for each actor take the average of this contribution
over the possible different [permutations](https://en.wikipedia.org/wiki/Permutation "Permutation")
in which the coalition can be formed. An alternative, equivalent formula for the Shapley value is: (
v ) = [ v ( ∪ ) − v ( ) ] {\displaystyle \varphi *{i}(v)={\frac {1}{n!}}\sum
*{R}\left[v(P*{i}^{R}\cup \left\\{i\right\\})-v(P*{i}^{R})\right]} where the sum ranges over all
{\displaystyle n!} orders {\displaystyle R} of the players and {\displaystyle P_{i}^{R}} is the set
of players in {\displaystyle N} which precede {\displaystyle i} in the order {\displaystyle R} .

### In terms of synergy

Venn diagram displaying synergies for Shapley values Venn diagram of the division of synergies that
sum to the Shapley Value From the characteristic function {\displaystyle v} one can compute the
_synergy_
([Harsanyi dividend](https://en.wikipedia.org/wiki/Cooperative_game_theory#Harsanyi_dividend "Cooperative game theory"))
that each group of players provides. The synergy is the unique function w : → {\displaystyle w\colon
2^{N}\to \mathbb {R} } , such that v ( S ) = w ( R ) {\displaystyle v(S)=\sum _{R\subseteq S}w(R)}
for any subset {\displaystyle S\subseteq N} of players. In other words, the 'total value' of the
coalition {\displaystyle S} comes from summing up the _synergies_ of each possible subset of
{\displaystyle S} . Given a characteristic function {\displaystyle v} , the synergy function
{\displaystyle w} is calculated via w ( S ) = ( − 1 ) S − R v ( R ) {\displaystyle w(S)=\sum
_{R\subseteq S}(-1)^{|S|-|R|}v(R)} using the
[Inclusion exclusion principle](https://en.wikipedia.org/wiki/Inclusion-exclusion_principle#Other_forms "Inclusion-exclusion principle").
The Shapley values are given in terms of the synergy function by ( v ) = ∑ i ∈ S ⊆ N w ( S )
{\displaystyle \varphi _{i}(v)=\sum _{i\in S\subseteq N}{\frac {w(S)}{|S|}}} where the sum is over
all subsets {\displaystyle S} of {\displaystyle N} that include player {\displaystyle i} . This can
be interpreted as ( v ) = ∑ coalitions including i synergy of the coalition number of members in the
coalition {\displaystyle \varphi _{i}(v)=\sum _{\text{coalitions including i}}{\frac {\text{synergy
of the coalition}}{\text{number of members in the coalition}}}} In other words, the synergy of each
coalition is divided equally between all members. This can be interpreted visually with a
[Venn diagram](https://en.wikipedia.org/wiki/Venn_diagram "Venn diagram"). In the first example
diagram above, each region has been labeled with the synergy bonus of the corresponding coalition.
The total value produced by a coalition is the sum of synergy bonuses of the composing
subcoalitions - in the example, the coalition of the players labeled "You" and "Emma" would produce
a profit of 30 + 20 + 40 = 90 {\displaystyle 30+20+40=90} dollars, as compared to their individual
profits of {\displaystyle 30} and {\displaystyle 20} dollars respectively. The synergies are then
split equally among each member of the subcoalition that contributes that synergy - as displayed in
the second diagram.

## Examples

### Business example

Consider a simplified description of a business. An owner, _o_ , provides crucial capital in the
sense that, without him/her, no gains can be obtained. There are _m_ workers _w_ 1,...,_w_ , each of
whom contributes an amount _p_ to the total profit. Let N = { o , , … , } . {\displaystyle
N=\\{o,w_{1},\ldots ,w_{m}\\}.} The value function for this coalitional game is v ( S ) = { ( S − 1
) p o ∈ S , otherwise . {\displaystyle v(S)={\begin{cases}(|S|-1)p&{\text{if }}o\in
S\;,\\\0&{\text{otherwise}}\;.\\\\\end{cases}}} Computing the Shapley value for this coalition game
leads to a value of for the owner and for each one of the _m_ workers. This can be understood from
the perspective of synergy. The synergy function {\displaystyle w} is w ( S ) = { S = { o , }
otherwise {\displaystyle w(S)={\begin{cases}p,&{\text{if
}}S=\\{o,w_{i}\\}\\\0,&{\text{otherwise}}\\\\\end{cases}}} so the only coalitions that generate
synergy are one-to-one between the owner and any individual worker. Using the above formula for the
Shapley value in terms of {\displaystyle w} we compute = w ( { o , } ) 2 = {\displaystyle \varphi
_{w_{i}}={\frac {w(\\{o,w_{i}\\})}{2}}={\frac {p}{2}}} and = ∑ w ( { o , } ) 2 = {\displaystyle
\varphi _{o}=\sum _{i=1}^{m}{\frac {w(\\{o,w_{i}\\})}{2}}={\frac {mp}{2}}} The result can also be
understood from the perspective of averaging over all orders. A given worker joins the coalition
after the owner (and therefore contributes _p_) in half of the orders and thus makes an average
contribution of {\displaystyle {\frac {p}{2}}} upon joining. When the owner joins, on average half
the workers have already joined, so the owner's average contribution upon joining is {\displaystyle
{\frac {mp}{2}}} .

### Glove game

The glove game is a coalitional game where the players have left- and right-hand gloves and the goal
is to form pairs. Let N = { 1 , 2 , 3 } , {\displaystyle N=\\{1,2,3\\},} where players 1 and 2 have
right-hand gloves and player 3 has a left-hand glove. The value function for this coalitional game
is v ( S ) = { S ∈ { { 1 , 3 } , { 2 , 3 } , { 1 , 2 , 3 } } ; otherwise . {\displaystyle
v(S)={\begin{cases}1&{\text{if }}S\in
\left\\{\\{1,3\\},\\{2,3\\},\\{1,2,3\\}\right\\};\\\0&{\text{otherwise}}.\\\\\end{cases}}} The
formula for calculating the Shapley value is ( v ) = 1 [ v ( ∪ ) − v ( ) ] , {\displaystyle \varphi
_{i}(v)={\frac {1}{|N|!}}\sum *{R}\left[v(P*{i}^{R}\cup \left\\{i\right\\})-v(P_{i}^{R})\right],}
where R is an ordering of the players and {\displaystyle P_{i}^{R}} is the set of players in N which
precede i in the order R. The following table displays the marginal contributions of Player 1. Order
R 1 , 2 , 3 v ( { 1 } ) − v ( ∅ ) = 0 − 0 = 0 1 , 3 , 2 v ( { 1 } ) − v ( ∅ ) = 0 − 0 = 0 2 , 1 , 3
v ( { 1 , 2 } ) − v ( { 2 } ) = 0 − 0 = 0 2 , 3 , 1 v ( { 1 , 2 , 3 } ) − v ( { 2 , 3 } ) = 1 − 1 =
0 3 , 1 , 2 v ( { 1 , 3 } ) − v ( { 3 } ) = 1 − 0 = 1 3 , 2 , 1 v ( { 1 , 3 , 2 } ) − v ( { 3 , 2 }
) = 1 − 1 = 0 {\displaystyle {\begin{array}{|c|r|}{\text{Order }}R\,\\!&MC_{1}\\\\\hline
{1,2,3}&v(\\{1\\})-v(\varnothing )=0-0=0\\\\{1,3,2}&v(\\{1\\})-v(\varnothing
)=0-0=0\\\\{2,1,3}&v(\\{1,2\\})-v(\\{2\\})=0-0=0\\\\{2,3,1}&v(\\{1,2,3\\})-v(\\{2,3\\})=1-1=0\\\\{3,1,2}&v(\\{1,3\\})-v(\\{3\\})=1-0=1\\\\{3,2,1}&v(\\{1,3,2\\})-v(\\{3,2\\})=1-1=0\end{array}}}
Observe ( v ) = ( 1 ) = . {\displaystyle \varphi _{1}(v)=\\!\left({\frac {1}{6}}\right)(1)={\frac
{1}{6}}.} By a symmetry argument it can be shown that ( v ) = ( v ) = . {\displaystyle \varphi
_{2}(v)=\varphi _{1}(v)={\frac {1}{6}}.} Due to the efficiency axiom, the sum of all the Shapley
values is equal to 1, which means that ( v ) = = . {\displaystyle \varphi _{3}(v)={\frac
{4}{6}}={\frac {2}{3}}.}

## Properties

The Shapley value has many desirable properties, including satisfying the four properties of
efficiency, symmetry, linearity and null player (or dummy player).

### Efficiency

The sum of the Shapley values of all agents equals the value of the grand coalition, so that all the
gain is distributed among the agents: ( v ) = v ( N ) {\displaystyle \sum _{i\in N}\varphi
_{i}(v)=v(N)} _Proof_ : ( v ) = 1 v ( ∪ ) − v ( ) {\displaystyle \sum _{i\in N}\varphi
_{i}(v)={\frac {1}{|N|!}}\sum _{R}\sum *{i\in N}v(P*{i}^{R}\cup \left\\{i\right\\})-v(P_{i}^{R})} =
1 v ( N ) = 1 N ! ⋅ v ( N ) = v ( N ) {\displaystyle ={\frac {1}{|N|!}}\sum _{R}v(N)={\frac
{1}{|N|!}}|N|!\cdot v(N)=v(N)} since v ( ∪ ) − v ( ) {\displaystyle \sum *{i\in N}v(P*{i}^{R}\cup
\left\\{i\right\\})-v(P_{i}^{R})} is a
[telescoping sum](https://en.wikipedia.org/wiki/Telescoping_sum "Telescoping sum") and there are
{\displaystyle |N|!} different orderings {\displaystyle R} .

### Symmetry

If {\displaystyle i} and {\displaystyle j} are two actors who are equivalent in the sense that v ( S
∪ { i } ) = v ( S ∪ { j } ) {\displaystyle v(S\cup \\{i\\})=v(S\cup \\{j\\})} for every subset
{\displaystyle S} of {\displaystyle N} which contains neither {\displaystyle i} nor {\displaystyle
j} , then ( v ) = ( v ) {\displaystyle \varphi _{i}(v)=\varphi _{j}(v)} . This property is also
called _equal treatment of equals_.

### Linearity

If two coalition games described by gain functions {\displaystyle v} and {\displaystyle w} are
combined, then the distributed gains should correspond to the gains derived from {\displaystyle v}
and the gains derived from {\displaystyle w} : ( v + w ) = ( v ) + ( w ) {\displaystyle \varphi
_{i}(v+w)=\varphi _{i}(v)+\varphi _{i}(w)} for every {\displaystyle i} in {\displaystyle N} . Also,
for any real number {\displaystyle a} , ( a v ) = a ( v ) {\displaystyle \varphi _{i}(av)=a\varphi
_{i}(v)} for every {\displaystyle i} in {\displaystyle N} .

### Null player

The Shapley value ( v ) {\displaystyle \varphi _{i}(v)} of a null player {\displaystyle i} in a game
{\displaystyle v} is zero. A player {\displaystyle i} is _null_ in {\displaystyle v} if v ( S ∪ { i
} ) = v ( S ) {\displaystyle v(S\cup \\{i\\})=v(S)} for all coalitions {\displaystyle S} that do not
contain {\displaystyle i} .

### Stand-alone test

If {\displaystyle v} is a
[subadditive set function](https://en.wikipedia.org/wiki/Subadditive_set_function "Subadditive set function"),
i.e., if v ( S ∪ T ) ≤ v ( S ) + v ( T ) {\displaystyle v(S\cup T)\leq v(S)+v(T)} , then for each
agent {\displaystyle i} : ( v ) ≤ v ( { i } ) {\displaystyle \varphi _{i}(v)\leq v(\\{i\\})} .
Similarly, if {\displaystyle v} is a
[superadditive set function](https://en.wikipedia.org/wiki/Superadditive_set_function "Superadditive set function"),
i.e., if v ( S ∪ T ) ≥ v ( S ) + v ( T ) {\displaystyle v(S\cup T)\geq v(S)+v(T)} for S ∩ T = ∅
{\displaystyle S\cap T=\emptyset } , then for each agent {\displaystyle i} : ( v ) ≥ v ( { i } )
{\displaystyle \varphi _{i}(v)\geq v(\\{i\\})} . So, if the cooperation has positive synergy, all
agents (weakly) gain, and if it has negative synergy, all agents (weakly) lose.: 147–156

### Anonymity

If {\displaystyle i} and {\displaystyle j} are two agents, and {\displaystyle w} is a gain function
that is identical to {\displaystyle v} except that the roles of {\displaystyle i} and {\displaystyle
j} have been exchanged, then ( v ) = ( w ) {\displaystyle \varphi _{i}(v)=\varphi _{j}(w)} . This
means that the labeling of the agents doesn't play a role in the assignment of their gains.

### Marginalism

The Shapley value can be defined as a function which uses only the marginal contributions of player
{\displaystyle i} as the arguments.

## Aumann–Shapley value

In their 1974 book, [Lloyd Shapley](https://en.wikipedia.org/wiki/Lloyd_Shapley "Lloyd Shapley") and
[Robert Aumann](https://en.wikipedia.org/wiki/Robert_Aumann "Robert Aumann") extended the concept of
the Shapley value to infinite games (defined with respect to a
[non-atomic](<https://en.wikipedia.org/wiki/Atom_(measure_theory)> "Atom (measure theory)")
[measure](<https://en.wikipedia.org/wiki/Measure_(mathematics)> "Measure (mathematics)")), creating
the diagonal formula. This was later extended by
[Jean-François Mertens](https://en.wikipedia.org/wiki/Jean-Fran%C3%A7ois_Mertens "Jean-François Mertens")
and [Abraham Neyman](https://en.wikipedia.org/wiki/Abraham_Neyman "Abraham Neyman"). As seen above,
the value of an n-person game associates with each player the expectation of their contribution to
the worth of the coalition of players before them in a random ordering of all the players. When
there are many players and each individual plays only a minor role, the set of all players preceding
a given one is heuristically thought of as a good sample of all players. The value of a given
infinitesimal player ds is then defined as "their" contribution to the worth of a "perfect" sample
of all the players. Symbolically, if v is the coalitional worth function that associates each
coalition c with its value, and each coalition c is a measurable subset of the measurable set I of
all players, that we assume to be I = [ 0 , 1 ] {\displaystyle I=[0,1]} without loss of generality,
the value ( S v ) ( d s ) {\displaystyle (Sv)(ds)} of an infinitesimal player ds in the game is ( S
v ) ( d s ) = ( v ( t I + d s ) − v ( t I ) ) d t . {\displaystyle (Sv)(ds)=\int
_{0}^{1}(\,v(tI+ds)-v(tI)\,)\,dt.} Here tI is a perfect sample of the all-player set I containing a
proportion t of all the players, and t I + d s {\displaystyle tI+ds} is the coalition obtained after
ds joins tI. This is the heuristic form of the diagonal formula. Assuming some regularity of the
worth function, for example, assuming v can be represented as differentiable function of a
non-atomic measure on I, , v ( c ) = f ( μ ( c ) ) {\displaystyle v(c)=f(\mu (c))} with density
function {\displaystyle \varphi } , with μ ( c ) = ∫ ( u ) φ ( u ) d u , {\displaystyle \mu (c)=\int
1_{c}(u)\varphi (u)\,du,} where ( ∙ ) {\displaystyle 1_{c}(\bullet )} is the characteristic function
of c. Under such conditions μ ( t I ) = t μ ( I ) {\displaystyle \mu (tI)=t\mu (I)} , as can be
shown by approximating the density by a step function and keeping the proportion t for each level of
the density function, and v ( t I + d s ) = f ( t μ ( I ) ) + ( t μ ( I ) ) μ ( d s ) .
{\displaystyle v(tI+ds)=f(t\mu (I))+f'(t\mu (I))\mu (ds).} The diagonal formula has then the form
developed by Aumann and Shapley (1974) ( S v ) ( d s ) = f t μ ( I ) ′ ( μ ( d s ) ) d t
{\displaystyle (Sv)(ds)=\int _{0}^{1}f'_{t\mu (I)}(\mu (ds))\,dt} Above can be vector valued (as
long as the function is defined and differentiable on the range of , the above formula makes sense).
In the argument above if the measure contains atoms μ ( t I ) = t μ ( I ) {\displaystyle \mu
(tI)=t\mu (I)} is no longer true—this is why the diagonal formula mostly applies to non-atomic
games. Two approaches were deployed to extend this diagonal formula when the function f is no longer
differentiable. Mertens goes back to the original formula and takes the derivative after the
integral thereby benefiting from the smoothing effect. Neyman took a different approach. Going back
to an elementary application of Mertens's approach from Mertens (1980): ( S v ) ( d s ) = lim ε → 0
, ε 0 ∫ ( f ( t + ε μ ( d s ) ) − f ( t ) ) d t {\displaystyle (Sv)(ds)=\lim _{\varepsilon \to
0,\varepsilon >0}{\frac {1}{\varepsilon }}\int _{0}^{1-\varepsilon }(f(t+\varepsilon \mu
(ds))-f(t))\,dt} This works for example for majority games—while the original diagonal formula
cannot be used directly. How Mertens further extends this by identifying symmetries that the Shapley
value should be invariant upon, and averaging over such symmetries to create further smoothing
effect commuting averages with the derivative operation as above. A survey for non atomic value is
found in Neyman (2002)

## Generalization to coalitions

The Shapley value only assigns values to the individual agents. It has been generalized to apply to
a group of agents _C_ as, ( v ) = ∑ T ⊆ N ∖ C ( n − T − C ) ! T ! ( n − C + 1 ) ! ( − 1 ) C − S v (
S ∪ T ) . {\displaystyle \varphi _{C}(v)=\sum _{T\subseteq N\setminus C}{\frac
{(n-|T|-|C|)!\;|T|!}{(n-|C|+1)!}}\sum _{S\subseteq C}(-1)^{|C|-|S|}v(S\cup T)\;.} In terms of the
synergy function {\displaystyle w} above, this reads ( v ) = ∑ C ⊆ T ⊆ N w ( T ) T − C + 1
{\displaystyle \varphi _{C}(v)=\sum _{C\subseteq T\subseteq N}{\frac {w(T)}{|T|-|C|+1}}} where the
sum goes over all subsets {\displaystyle T} of {\displaystyle N} that contain {\displaystyle C} .
This formula suggests the interpretation that the Shapley value of a coalition is to be thought of
as the standard Shapley value of a single player, if the coalition {\displaystyle C} is treated like
a single player.

## Value of a player to another player

The Shapley value ( v ) {\displaystyle \varphi _{i}(v)} was decomposed by Hausken and Matthias into
a matrix of values ( v ) = ( S − 1 ) ! ( n − S ) ! ( v ( S ) − v ( S ∖ { i } ) − v ( S ∖ { j } ) + v
( S ∖ { i , j } ) ) ∑ t = S {\displaystyle \varphi _{ij}(v)=\sum _{S\subseteq N}{\frac
{(|S|-1)!\;(n-|S|)!}{n!}}(v(S)-v(S\setminus \\{i\\})-v(S\setminus \\{j\\})+v(S\setminus
\\{i,j\\}))\sum _{t=|S|}^{n}{\frac {1}{t}}} Each value ( v ) {\displaystyle \varphi _{ij}(v)}
represents the value of player {\displaystyle i} to player {\displaystyle j} . This matrix satisfies
( v ) = ( v ) {\displaystyle \varphi _{i}(v)=\sum _{j\in N}\varphi _{ij}(v)} i.e. the value of
player {\displaystyle i} to the whole game is the sum of their value to all individual players. In
terms of the synergy {\displaystyle w} defined above, this reads ( v ) = ∑ { i , j } ⊆ S ⊆ N w ( S )
{\displaystyle \varphi _{ij}(v)=\sum _{\\{i,j\\}\subseteq S\subseteq N}{\frac {w(S)}{|S|^{2}}}}
where the sum goes over all subsets {\displaystyle S} of {\displaystyle N} that contain
{\displaystyle i} and {\displaystyle j} . This can be interpreted as sum over all subsets that
contain players {\displaystyle i} and {\displaystyle j} , where for each subset {\displaystyle S}
you

- take the synergy w ( S ) {\displaystyle w(S)} of that subset
- divide it by the number of players in the subset {\displaystyle |S|} . Interpret that as the
  surplus value player {\displaystyle i} gains from this coalition
- further divide this by {\displaystyle |S|} to get the part of player {\displaystyle i} 's value
  that's attributed to player {\displaystyle j}

In other words, the synergy value of each coalition is evenly divided among all {\displaystyle
|S|^{2}} _pairs_ ( i , j ) {\displaystyle (i,j)} of players in that coalition, where {\displaystyle
i} generates surplus for {\displaystyle j} .

## Shapley value regression

Shapley value regression is a statistical method used to measure the contribution of individual
predictors in a regression model. In this context, the "players" are the individual predictors or
variables in the model, and the "gain" is the total explained variance or predictive power of the
model. This method ensures a fair distribution of the total gain among the predictors, attributing
each predictor a value representing its contribution to the model's performance. Shapley value
contributions are recognized for their balance of stability and discriminating power, which make
them suitable for accurately measuring the importance of service attributes in market research.
Several studies have applied Shapley value regression to key drivers analysis in marketing research.
Pokryshevskaya and Antipov (2012) utilized this method to analyze online customers' repeat purchase
intentions, demonstrating its effectiveness in understanding consumer behavior. Similarly, Antipov
and Pokryshevskaya (2014) applied Shapley value regression to explain differences in recommendation
rates for hotels in south Cyprus, highlighting its utility in the hospitality industry. Further
validation of the benefits of Shapley value in key-driver analysis is provided by Vriens, Vidden,
and Bosch (2021), who underscored its advantages in applied marketing analytics.

## In machine learning

The Shapley value provides a principled way to explain the predictions of
[nonlinear models](https://en.wikipedia.org/wiki/Nonlinear_model "Nonlinear model") common in the
field of [machine learning](https://en.wikipedia.org/wiki/Machine_learning "Machine learning"). By
interpreting a model trained on a set of features as a value function on a coalition of players,
Shapley values provide a natural way to compute which features contribute to a prediction or
contribute to the uncertainty of a prediction. This unifies several other methods, including
[locally interpretable model-agnostic explanations](https://en.wikipedia.org/wiki/Locally_interpretable_model-agnostic_explanation?action=edit&redlink=1 "Locally interpretable model-agnostic explanation (page does not exist)")
(LIME),
[DeepLIFT](https://en.wikipedia.org/wiki/DeepLIFT?action=edit&redlink=1 "DeepLIFT (page does not exist)"),
and
[layer-wise relevance propagation](https://en.wikipedia.org/wiki/Layer-wise_relevance_propagation?action=edit&redlink=1 "Layer-wise relevance propagation (page does not exist)").
Distributional values are an extension of the Shapley value and related value operators designed to
preserve the probabilistic output of predictive models in machine learning, including
[neural network classifiers](https://en.wikipedia.org/wiki/Neural_network_classifier?action=edit&redlink=1 "Neural network classifier (page does not exist)")
and
[large language models](https://en.wikipedia.org/wiki/Large_language_model "Large language model").
The statistical understanding of Shapley values remains an ongoing research question. A smooth
version, called
[Shapley curves](https://en.wikipedia.org/wiki/Shapley_curve?action=edit&redlink=1 "Shapley curve (page does not exist)"),
achieves the
[minimax rate](https://en.wikipedia.org/wiki/Minimax_rate?action=edit&redlink=1 "Minimax rate (page does not exist)")
and is shown to be asymptotically Gaussian in a
[nonparametric](https://en.wikipedia.org/wiki/Nonparametric "Nonparametric") setting. Confidence
intervals for finite samples can be obtained via the
[wild bootstrap](https://en.wikipedia.org/wiki/Wild_bootstrap "Wild bootstrap").

## See also

- [Shapley–Shubik power index](https://en.wikipedia.org/wiki/Shapley%E2%80%93Shubik_power_index "Shapley–Shubik power index")

## References

1. Shapley, Lloyd S. (August 21, 1951).
   ["Notes on the n-Person Game -- II: The Value of an n-Person Game"](https://www.rand.org/content/dam/rand/pubs/research_memoranda/2008/RM670.pdf)
   (PDF). Santa Monica, Calif.: RAND Corporation.
2. Roth, Alvin E., ed. (1988). _The Shapley Value: Essays in Honor of Lloyd S. Shapley_. Cambridge:
   Cambridge University Press.
   [doi](<https://en.wikipedia.org/wiki/Doi_(identifier)> "Doi (identifier)"):[10.1017/CBO9780511528446](https://doi.org/10.1017%2FCBO9780511528446).
   [ISBN](<https://en.wikipedia.org/wiki/ISBN_(identifier)> "ISBN (identifier)")
   [0-521-36177-X](https://en.wikipedia.org/wiki/Special:BookSources/0-521-36177-X "Special:BookSources/0-521-36177-X").
3. Hart, Sergiu (1989). "Shapley Value". In Eatwell, J.; Milgate, M.; Newman, P. (eds.). _The New
   Palgrave: Game Theory_. Norton. pp. 210–216.
   [doi](<https://en.wikipedia.org/wiki/Doi_(identifier)> "Doi (identifier)"):[10.1007/978-1-349-20181-5_25](https://doi.org/10.1007%2F978-1-349-20181-5_25).
   [ISBN](<https://en.wikipedia.org/wiki/ISBN_(identifier)> "ISBN (identifier)")
   [978-0-333-49537-7](https://en.wikipedia.org/wiki/Special:BookSources/978-0-333-49537-7 "Special:BookSources/978-0-333-49537-7").
4. Hart, Sergiu (May 12, 2016).
   ["A Bibliography of Cooperative Games: Value Theory"](http://www.ma.huji.ac.il/~hart/value.html).
5. Shapley, Lloyd S. (1953). "A Value for n-person Games". In Kuhn, H. W.; Tucker, A. W. (eds.).
   _Contributions to the Theory of Games_.
   [Annals of Mathematics Studies](https://en.wikipedia.org/wiki/Annals_of_Mathematics_Studies "Annals of Mathematics Studies").
   Vol. 28. Princeton University Press. pp. 307–317.
   [doi](<https://en.wikipedia.org/wiki/Doi_(identifier)> "Doi (identifier)"):[10.1515/9781400881970-018](https://doi.org/10.1515%2F9781400881970-018).
   [ISBN](<https://en.wikipedia.org/wiki/ISBN_(identifier)> "ISBN (identifier)")
   [978-1-4008-8197-0](https://en.wikipedia.org/wiki/Special:BookSources/978-1-4008-8197-0 "Special:BookSources/978-1-4008-8197-0").
   : ISBN / Date incompatibility
   ([help](https://en.wikipedia.org/wiki/Help:CS1_errors#invalid_isbn_date "Help:CS1 errors"))
6. For a proof of unique existence, see Ichiishi, Tatsuro (1983).
   [_Game Theory for Economic Analysis_](https://books.google.com/books?id=zFm7AAAAIAAJ&pg=PA118).
   New York: Academic Press. pp. 118–120.
   [ISBN](<https://en.wikipedia.org/wiki/ISBN_(identifier)> "ISBN (identifier)")
   [0-12-370180-5](https://en.wikipedia.org/wiki/Special:BookSources/0-12-370180-5 "Special:BookSources/0-12-370180-5").
7. Grabisch, Michel (October 1997). "Alternative Representations of Discrete Fuzzy Measures for
   Decision Making". _International Journal of Uncertainty, Fuzziness and Knowledge-Based Systems_.
   **5** (5): 587–607.
   [doi](<https://en.wikipedia.org/wiki/Doi_(identifier)> "Doi (identifier)"):[10.1142/S0218488597000440](https://doi.org/10.1142%2FS0218488597000440).
   [ISSN](<https://en.wikipedia.org/wiki/ISSN_(identifier)> "ISSN (identifier)")
   [0218-4885](https://search.worldcat.org/issn/0218-4885).
8. Grabisch, Michel (1 December 1997). "k-order additive discrete fuzzy measures and their
   representation". _Fuzzy Sets and Systems_. **92** (2): 167–189.
   [doi](<https://en.wikipedia.org/wiki/Doi_(identifier)> "Doi (identifier)"):[10.1016/S0165-0114(97)00168-1](https://doi.org/10.1016%2FS0165-0114%2897%2900168-1).
   [ISSN](<https://en.wikipedia.org/wiki/ISSN_(identifier)> "ISSN (identifier)")
   [0165-0114](https://search.worldcat.org/issn/0165-0114).
9. [Hervé Moulin](https://en.wikipedia.org/wiki/Herv%C3%A9_Moulin "Hervé Moulin") (2004). _Fair
   Division and Collective Welfare_. Cambridge, Massachusetts: MIT Press.
   [ISBN](<https://en.wikipedia.org/wiki/ISBN_(identifier)> "ISBN (identifier)")
   [9780262134231](https://en.wikipedia.org/wiki/Special:BookSources/9780262134231 "Special:BookSources/9780262134231").
10. Aumann, Robert J.; Shapley, Lloyd S. (1974). _Values of Non-Atomic Games_. Princeton: Princeton
    Univ. Press. [ISBN](<https://en.wikipedia.org/wiki/ISBN_(identifier)> "ISBN (identifier)")
    [0-691-08103-4](https://en.wikipedia.org/wiki/Special:BookSources/0-691-08103-4 "Special:BookSources/0-691-08103-4").
11. Mertens, Jean-François (1980). "Values and Derivatives".
    _[Mathematics of Operations Research](https://en.wikipedia.org/wiki/Mathematics_of_Operations_Research "Mathematics of Operations Research")_.
    **5** (4): 523–552.
    [doi](<https://en.wikipedia.org/wiki/Doi_(identifier)> "Doi (identifier)"):[10.1287/moor.5.4.523](https://doi.org/10.1287%2Fmoor.5.4.523).
    [JSTOR](<https://en.wikipedia.org/wiki/JSTOR_(identifier)> "JSTOR (identifier)")
    [3689325](https://www.jstor.org/stable/3689325).
12. Mertens, Jean-François (1988). "The Shapley Value in the Non Differentiable Case".
    _International Journal of Game Theory_. **17** (1): 1–65.
    [doi](<https://en.wikipedia.org/wiki/Doi_(identifier)> "Doi (identifier)"):[10.1007/BF01240834](https://doi.org/10.1007%2FBF01240834).
    [S2CID](<https://en.wikipedia.org/wiki/S2CID_(identifier)> "S2CID (identifier)")
    [118017018](https://api.semanticscholar.org/CorpusID:118017018).
13. Neyman, A., 2002. Value of Games with infinitely many Players, "Handbook of Game Theory with
    Economic Applications," Handbook of Game Theory with Economic Applications, Elsevier, edition 1,
    volume 3, number 3, 00. R.J. Aumann & S. Hart (ed.).
14. Grabisch, Michel; Roubens, Marc (1999). "An axiomatic approach to the concept of interaction
    among players in cooperative games". _International Journal of Game Theory_. **28** (4):
    547–565.
    [doi](<https://en.wikipedia.org/wiki/Doi_(identifier)> "Doi (identifier)"):[10.1007/s001820050125](https://doi.org/10.1007%2Fs001820050125).
    [S2CID](<https://en.wikipedia.org/wiki/S2CID_(identifier)> "S2CID (identifier)")
    [18033890](https://api.semanticscholar.org/CorpusID:18033890).
15. Hausken, Kjell; Mohr, Matthias (2001). "The Value of a Player in n-Person Games". _Social Choice
    and Welfare_. **18** (3): 465–83.
    [doi](<https://en.wikipedia.org/wiki/Doi_(identifier)> "Doi (identifier)"):[10.1007/s003550000070](https://doi.org/10.1007%2Fs003550000070).
    [JSTOR](<https://en.wikipedia.org/wiki/JSTOR_(identifier)> "JSTOR (identifier)")
    [41060209](https://www.jstor.org/stable/41060209).
    [S2CID](<https://en.wikipedia.org/wiki/S2CID_(identifier)> "S2CID (identifier)")
    [27089088](https://api.semanticscholar.org/CorpusID:27089088).
16. Lipovetsky S, Conklin M (2001). "Analysis of regression in game theory approach". _Applied
    Stochastic Models in Business and Industry_. **17** (4): 319–330.
    [doi](<https://en.wikipedia.org/wiki/Doi_(identifier)> "Doi (identifier)"):[10.1002/asmb.446](https://doi.org/10.1002%2Fasmb.446).
17. Pokryshevskaya E, Antipov E (2014). "A comparison of methods used to measure the importance of
    service attributes". _International Journal of Market Research_. **56** (3): 283–296.
    [doi](<https://en.wikipedia.org/wiki/Doi_(identifier)> "Doi (identifier)"):[10.2501/IJMR-2014-020](https://doi.org/10.2501%2FIJMR-2014-020).
18. Pokryshevskaya EB, Antipov EA (2012). "The strategic analysis of online customers' repeat
    purchase intentions". _Journal of Targeting, Measurement and Analysis for Marketing_. **20** :
    203–211.
    [doi](<https://en.wikipedia.org/wiki/Doi_(identifier)> "Doi (identifier)"):[10.1057/jt.2012.13](https://doi.org/10.1057%2Fjt.2012.13).
19. Antipov EA, Pokryshevskaya EB (2014). "Explaining differences in recommendation rates: the case
    of South Cyprus hotels". _Economics Bulletin_. **34** (4): 2368–2376.
20. Vriens M, Vidden C, Bosch N (2021). "The benefits of Shapley-value in key-driver analysis".
    _Applied Marketing Analytics_. **6** (3): 269–278.
21. Lundberg, Scott M.; [Lee, Su-In](https://en.wikipedia.org/wiki/Su-In_Lee "Su-In Lee") (2017).
    ["A Unified Approach to Interpreting Model Predictions"](https://papers.nips.cc/paper/2017/hash/8a20a8621978632d76c43dfd28b67767-Abstract.html).
    _Advances in Neural Information Processing Systems_. **30** : 4765–4774.
    [arXiv](<https://en.wikipedia.org/wiki/ArXiv_(identifier)> "ArXiv (identifier)"):. Retrieved
    2021-01-30.
22. Watson, David; O'Hara, Joshua; Tax, Niek; Mudd, Richard; Guy, Ido (2023). "Explaining Predictive
    Uncertainty with Information Theoretic Shapley". _Advances in Neural Information Processing
    Systems_. **37**.
    [arXiv](<https://en.wikipedia.org/wiki/ArXiv_(identifier)> "ArXiv (identifier)"):.
23. Ribeiro, Marco Tulio; Singh, Sameer; Guestrin, Carlos (2016-08-13). ""Why Should I Trust You?"".
    _Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data
    Mining_. New York, NY, USA: ACM. pp. 1135–1144.
    [doi](<https://en.wikipedia.org/wiki/Doi_(identifier)> "Doi (identifier)"):[10.1145/2939672.2939778](https://doi.org/10.1145%2F2939672.2939778).
    [ISBN](<https://en.wikipedia.org/wiki/ISBN_(identifier)> "ISBN (identifier)")
    [978-1-4503-4232-2](https://en.wikipedia.org/wiki/Special:BookSources/978-1-4503-4232-2 "Special:BookSources/978-1-4503-4232-2").
24. Shrikumar, Avanti; Greenside, Peyton; Kundaje, Anshul (2017-07-17).
    ["Learning Important Features Through Propagating Activation Differences"](http://proceedings.mlr.press/v70/shrikumar17a.html).
    _PMLR_ : 3145–3153.
    [ISSN](<https://en.wikipedia.org/wiki/ISSN_(identifier)> "ISSN (identifier)")
    [2640-3498](https://search.worldcat.org/issn/2640-3498). Retrieved 2021-01-30.
25. Bach, Sebastian; Binder, Alexander; Montavon, Grégoire; Klauschen, Frederick;
    [Müller, Klaus-Robert](https://en.wikipedia.org/wiki/Klaus-Robert_M%C3%BCller "Klaus-Robert Müller");
    Samek, Wojciech (2015-07-10). Suarez, Oscar Deniz (ed.).
    ["On Pixel-Wise Explanations for Non-Linear Classifier Decisions by Layer-Wise Relevance Propagation"](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4498753).
    _PLOS ONE_. **10** (7) e0130140. Public Library of Science (PLoS).
    [Bibcode](<https://en.wikipedia.org/wiki/Bibcode_(identifier)> "Bibcode (identifier)"):[2015PLoSO..1030140B](https://ui.adsabs.harvard.edu/abs/2015PLoSO..1030140B).
    [doi](<https://en.wikipedia.org/wiki/Doi_(identifier)> "Doi (identifier)"):[10.1371/journal.pone.0130140](https://doi.org/10.1371%2Fjournal.pone.0130140).
    [ISSN](<https://en.wikipedia.org/wiki/ISSN_(identifier)> "ISSN (identifier)")
    [1932-6203](https://search.worldcat.org/issn/1932-6203).
    [PMC](<https://en.wikipedia.org/wiki/PMC_(identifier)> "PMC (identifier)") .
    [PMID](<https://en.wikipedia.org/wiki/PMID_(identifier)> "PMID (identifier)")
    [26161953](https://pubmed.ncbi.nlm.nih.gov/26161953).
26. Antipov, E. A.; Pokryshevskaya, E. B. (2020). "Interpretable machine learning for demand
    modeling with high-dimensional data using Gradient Boosting Machines and Shapley values".
    _Journal of Revenue and Pricing Management_. **19** (5): 355–364.
    [doi](<https://en.wikipedia.org/wiki/Doi_(identifier)> "Doi (identifier)"):[10.1057/s41272-020-00236-4](https://doi.org/10.1057%2Fs41272-020-00236-4).
27. Franceschi L, Donini M, Archambeau C, Seeger M (2024). "Explaining probabilistic models with
    distributional values". _Proceedings of the 41st International Conference on Machine Learning
    (ICML 2024)_. [arXiv](<https://en.wikipedia.org/wiki/ArXiv_(identifier)> "ArXiv (identifier)"):.
28. Miftachov, Ratmir; Keilbar, Georg; Härdle, Wolfgang (2025).
    ["Shapley Curves: A Smoothing Perspective"](https://www.tandfonline.com/doi/full/10.1080/07350015.2024.2365781).
    _Journal of Business & Economic Statistics_. **43** (2): 312–323.
    [doi](<https://en.wikipedia.org/wiki/Doi_(identifier)> "Doi (identifier)"):[10.1080/07350015.2024.2365781](https://doi.org/10.1080%2F07350015.2024.2365781).

## Further reading

- Friedman, James W. (1986).
  [_Game Theory with Applications to Economics_](https://archive.org/details/gametheorywithap0000frie).
  New York: Oxford University Press. pp.
  [209](https://archive.org/details/gametheorywithap0000frie/page/209)–215.
  [ISBN](<https://en.wikipedia.org/wiki/ISBN_(identifier)> "ISBN (identifier)")
  [0-19-503660-3](https://en.wikipedia.org/wiki/Special:BookSources/0-19-503660-3 "Special:BookSources/0-19-503660-3").

## External links

- ["Shapley value"](https://www.encyclopediaofmath.org/index.php?title=Shapley_value),
  _[Encyclopedia of Mathematics](https://en.wikipedia.org/wiki/Encyclopedia_of_Mathematics "Encyclopedia of Mathematics")_
  , EMS Press, 2001 [1994]
- [Shapley Value Calculator](http://shapleyvalue.com/)
- [Calculating a Taxi Fare using the Shapley Value](https://www.youtube.com/watch?v=aThG4YAFErw)

| hide |
| ---- |
|      |

|  
|

| showTraditional [game theory](https://en.wikipedia.org/wiki/Game_theory "Game theory")                               |
| -------------------------------------------------------------------------------------------------------------------- |
|                                                                                                                      |
|                                                                                                                      |
| show[Combinatorial game theory](https://en.wikipedia.org/wiki/Combinatorial_game_theory "Combinatorial game theory") |
| ---                                                                                                                  |
|                                                                                                                      |
|                                                                                                                      |
| show[Evolutionary game theory](https://en.wikipedia.org/wiki/Evolutionary_game_theory "Evolutionary game theory")    |
| ---                                                                                                                  |
|                                                                                                                      |
|                                                                                                                      |
| show                                                                                                                 |
| ---                                                                                                                  |
|                                                                                                                      |
|                                                                                                                      |
| showOther topics                                                                                                     |
| ---                                                                                                                  |
|                                                                                                                      |
|                                                                                                                      |

---

|  
Retrieved from
"[https://en.wikipedia.org/w/index.php?title=Shapley_value&oldid=1381086677](https://en.wikipedia.org/w/index.php?title=Shapley_value&oldid=1381086677)"
[Categories](https://en.wikipedia.org/wiki/Help:Category "Help:Category"):

Hidden categories:

- [Articles with short description](https://en.wikipedia.org/wiki/Category:Articles_with_short_description "Category:Articles with short description")
- [Short description matches Wikidata](https://en.wikipedia.org/wiki/Category:Short_description_matches_Wikidata "Category:Short description matches Wikidata")
- [CS1 errors: ISBN date](https://en.wikipedia.org/wiki/Category:CS1_errors:_ISBN_date "Category:CS1 errors: ISBN date")
- [Commons category link is locally defined](https://en.wikipedia.org/wiki/Category:Commons_category_link_is_locally_defined "Category:Commons category link is locally defined")

Shapley value 13 languages [ Add topic ](https://en.wikipedia.org/wiki/Shapley_value) *[v]: View
this template *[t]: Discuss this template *[e]: Edit this template
