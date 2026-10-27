Was this page helpful?
# JSDoc Reference
The list below outlines which constructs are currently supported when using JSDoc annotations to provide type information in JavaScript files.
Note:
  * Any tags which are not explicitly listed below (such as `@async`) are not yet supported.
  * Only documentation tags are supported in TypeScript files. The rest of the tags are only supported in JavaScript files.


## Types
  * [`@param`](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#param-and-returns) (or [`@arg`](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#param-and-returns) or [`@argument`](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#param-and-returns))
  * [`@returns`](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#param-and-returns) (or [`@return`](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#param-and-returns))


## Classes
  * [Property Modifiers](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#property-modifiers) `@public`, `@private`, `@protected`, `@readonly`
  * [`@extends`](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#extends) (or [`@augments`](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#extends))
  * [`@class`](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#constructor) (or [`@constructor`](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#constructor))


## Documentation
Documentation tags work in both TypeScript and JavaScript.


## Other
  * [Other supported patterns](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#other-supported-patterns)
  * [Unsupported patterns](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#unsupported-patterns)
  * [Unsupported tags](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#unsupported-tags)


The meaning is usually the same, or a superset, of the meaning of the tag given at [jsdoc.app](https://jsdoc.app). The code below describes the differences and gives some example usage of each tag.
**Note:** You can use [the playground to explore JSDoc support](https://www.typescriptlang.org/play?useJavaScript=truee=4#example/jsdoc-support).
## Types
### `@type`
You can reference types with the “@type” tag. The type can be:
  1. Primitive, like `string` or `number`.
  2. Declared in a TypeScript declaration, either global or imported.
  3. Declared in a JSDoc [`@typedef`](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#typedef-callback-and-param) tag.


You can use most JSDoc type syntax and any TypeScript syntax, from [the most basic like `string`](https://www.typescriptlang.org/docs/handbook/2/basic-types.html) to [the most advanced, like conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html).

```

js


/**



@type{string}





var;





/** @type{Window} */




var;





/** @type{PromiseLike<string>} */




varpromisedString;




// You can specify an HTML Element with DOM properties



/** @type{HTMLElement} */




varmyElementdocument.querySelector(selector);




element.dataset.myData"";

Try[](https://www.typescriptlang.org/play/#code/PQKhCgAIUgBAXAngBwKaQN4Gd4CcCWAdgOYC+UIw4AbgIa6RYDc44oMCK6GA6kQCYB7AO6loVOg2FEWbMHCRpMABVyCAtviyoAMvgDWqADw4CJAHxjKNepGRrN2-gGU8RYrODBIATUEBXSABjWkJGNCD8ADNESFDIAAkAFQBZHUgAUQAbVHVUQnhIaXgAC0gAEQB5FLs1NFx4fFQsOQ5FbmS07Nz8+CsJW3VEbryCyABeSCEg-1H4ADoAR39UXERnVByg+EFcAAptLZ3cAEoWTZ6C+f5aeFptBaHy29oJyAAid6YgA)


```

`@type` can specify a union type — for example, something can be either a string or a boolean.

```

js


/**



@type{string | boolean}





var;

Try[](https://www.typescriptlang.org/play/#code/PQKhCgAIUgBAXAngBwKaQN4Gd4CcCWAdgOaQA+kARgPbUA2qAhoQL5QjDgBujukWlANxA)


```

You can specify array types using a variety of syntaxes:

```

js



/** @type{number[]} */




var;




/** @type{Array.<number>} */




varjsdoc;




/** @type{Array<number>} */




var;

Try[](https://www.typescriptlang.org/play/#code/PQKhAIAEBcE8AcCm4DeA7ArgWwEaIE4DaAugL7gjABQAbgIb7hoDOA3FaBDAsigIL58dWADoAPJlwEAfOUq0G4AFbMAJgHsAxu05Q4SVAKGwJ2PPlkVq9RmjpsgA)


```

You can also specify object literal types. For example, an object with properties ‘a’ (string) and ‘b’ (number) uses the following syntax:

```

js



/** @type{{ a: string, b: number }} */




varvar9;

Try[](https://www.typescriptlang.org/play/#code/PQKhAIAEBcE8AcCm4DeLwEMBc4DO0AnASwDsBzAGnACMcSBXAW2sQPAF93wRgAoANwxtBBAJwBuIA)


```

You can specify map-like and array-like objects using string and number index signatures, using either standard JSDoc syntax or TypeScript syntax.

```

js


/**


 * A map-like object that maps arbitrary `string` properties to `number`s.




@type{Object.<string, number>}





varstringToNumber;





/** @type{Object.<number, object>} */




vararrayLike;

Try[](https://www.typescriptlang.org/play/#code/PQKhCgAIUhBSC2BDADgWgDYEsDWBTSAewCMArPAYwBdIqALJG5FAZ0iQCdisqPOBPSAAMWvLADsA5kMgoOhFHg5UseNlULDxAVwTElIgHRQI0SAAEq-RZADeAeTKUqhgDyiOEyQBpIOvUoAfAC+JsDgAG6ckB5eACqEAHK6+hwA3ODgoDCW1gQOTtRu-qm+JOTUIdDhURzsHHz8ADK4eGlAA)


```

The preceding two types are equivalent to the TypeScript types `{ [x: string]: number }` and `{ [x: number]: any }`. The compiler understands both syntaxes.
You can specify function types using either TypeScript or Google Closure syntax:

```

js



/** @type{function(string, boolean): number} Closure syntax */




var;




/** @type{(s: string, b: boolean) => number} TypeScript syntax */




varsbn2;

Try[](https://www.typescriptlang.org/play/#code/PQKhAIAEBcE8AcCm4DeAzArgOwMbQJYD2WAFAM7QBO+WA5gDTgBGhhANogIZYCUAXOCwYAtk0SUAvuADCbQmQyVkZWFmicAHuBDAAUADdOlcGSZYA3LtAQYCZCnICK1OoyYCW7Lr3ABeAHyCImKS4AAqdgDKONTw0Caq6lo6BkYmZgBM5kA)


```

Or you can just use the unspecified `Function` type:

```

js



/** @type{Function} */




var;




/** @type{function} */




var;

Try[](https://www.typescriptlang.org/play/#code/PQKhAIAEBcE8AcCm4DeAxArgOwMbQJYD2WAvuCMAFABuAhgE7gBmWA7ANyWgQwLIpNseIqXJU6jFgDZ2QA)


```

Other types from Closure also work:

```

js


/**



@type{*} - can be 'any' type





varstar;



/**



@type{?} - unknown type (same as 'any')





varquestion;

Try[](https://www.typescriptlang.org/play/#code/PQKhCgAIUgBAXAngBwKaQN4gL6QLSQDGAhgHaQBG6A5GYtZEmlCMOAG7EBOkAzvNwDc4UBGhwm6DAH5cBAK6kA1qQD2Ad3KTIACl7EAtumK9ItUvQCULNpx4BHean4BLVaUFA)


```

#### Casts
TypeScript borrows cast syntax from Google Closure. This lets you cast types to other types by adding a `@type` tag before any parenthesized expression.

```

js


/**



@type{number | string}





varnumberOrStringMath.random() < 0.5"hello"100;




vartypeAssertedNumber/** @type{number} */ (numberOrString);

Try[](https://www.typescriptlang.org/play/#code/PQKhCgAIUgBAXAngBwKaQN4DsCuBbAI1QCdIAfSAZ3mIEssBzAXyhGHADcBDU3QkgPLEAyjXoNIAXkgBZLvAAWAOmJcsAEwD2eABQBKSAB5IABiUBWSAH5IAIgWoANo823IALkgBGEyYDcnDyQSGgAgpSUJPCo6gBy+ESk0qAwCCjo2AkkTNDAkDp8iUKidIx6fkA)


```

You can even cast to `const` just like TypeScript:

```

js



let/** @type{const} */(1);

Try[](https://www.typescriptlang.org/play/#code/DYUwLgBA9gdiEF4IHoBUqIAEwE8AO8A3gMawDOYAvhKsgBQCMAlANxA)


```

#### Import types
You can import declarations from other files using import types. This syntax is TypeScript-specific and differs from the JSDoc standard:

```

js


// @filename: types.d.ts



exporttype = {




name: string,





// @filename: main.js


/**



@param{import("./types").Pet}p





functionwalk() {




console.(`Walking ${.name}...`);


Try[](https://www.typescriptlang.org/play/#code/PTAEAEDMEsBsFMB2BDAtvAXKALgTwA7wDOAdACYnZEBQ8AHvgPYBO2OB8oACvGwLygA3tVCgU6LEWzNoiAOYAaagF8A3NWogIMBOMyhUyWSQBWNYACoLIixHzJmaIdFRNWACgBEJYHkJFPAEoSHmxlUHwbYGpIAFdEAGNsaEZEUAB3ZFgAa3d8QKERUATUokYEElhGOXcAAwB1LOzZOVAAEkF8Ej1lEj7awPVlIA)


```

import types can be used to get the type of a value from a module if you don’t know the type, or if it has a large type that is annoying to type:

```

js


/**



@type{typeof import("./accounts").userAccount}





varrequire("./accounts").userAccount;

Try[](https://www.typescriptlang.org/play/#code/PTAEAEBcE8AcFMDOAuUA7A9gE3gKBBAGYCWANvGgIYC28qlAxgxgK5qSIB0WnHu8AD1gYATpFDM0icS0TwRAQSat2oALygA3rlDoadUACIAcvsMAaHaEpYsIpCiMK012-cSILV4dMqkAwtgGhl66zGyQItCoIZa6sKSUaPCQMaGgiNDS8NRpcaAA5n6UAtFG6WzEAG7ycnm4AL4A3Phg4CTkVLSo1JTEaJwAVoitoAC0EwwskBNj+ABU8zrzEDAIWmvwGISgxNTCYgAUhpzAjOHsngCUnLLySheQDcvAuFWUIqAC6qD2AI4sYj2Y6nc4qDiGG53RTKCJNIA)


```

### `@import`
The `@import` tag can let us reference exports from other files.

```

js


/**



@import {Pet} from "./types"





/**



@type{Pet}





varmyPet;




myPet.name;

Try[](https://www.typescriptlang.org/play/#code/PTAEAEDMEsBsFMB2BDAtvAXKALgTwA7wDOAdACYnZEBQ8AHvgPYBO2OB8oACvGwLygA3tVCgU6LEWzNoiAOYAaagF8A3NRAQYCcZlCpkskgCsamgLSWAxgFdsl8xoBUTkU4jRUTVkJ7ZloJDMjKigAEQkwHiERGFuwNTOrqDu4NGcgn7K8dQAbsjM+rh+6qjFvCS6qkA)


```

These tags don’t actually import files at runtime, and the symbols they bring into scope can only be used within JSDoc comments for type-checking.

```

js


// @filename: dog.js



exportclass {




woof() {




console.("Woof!");






// @filename: main.js



/** @import { Dog } from "./dog.js" */





constnew(); // error!

Try[](https://www.typescriptlang.org/play/#code/PTAEAEDMEsBsFMB2BDAtvAXKAJgewOYB0AVgM4BQ8AHgA64BOALqAMazKmmgAiBoA3uVCgA7rlyQAFAEoBQ4a1yJSuBIVgFJAIgDq4yAEIt0gNzyAvuUvkQEGAhTosqZNEQkKwAFReI0VHRMAjx85qCQ9LiooFqEwHhEZFqgXsDk5CxKpMzYoAC8oIjwIiH4MiagtvD0kfQGQA)


```

###  `@param` and `@returns`
`@param` uses the same type syntax as `@type`, but adds a parameter name. The parameter may also be declared optional by surrounding the name with square brackets:

```

js


// Parameters may be declared in a variety of syntactic forms


/**



@param{string}p1 - A string param.




@param{string=}p2 - An optional param (Google Closure syntax)




@param{string}[p3] - Another optional param (JSDoc syntax).




@param{string}[p4="test"] - An optional param with a default value




@returns{string} This is the result





functionstringsStringStrings(, , , ) {




// TODO


Try[](https://www.typescriptlang.org/play/#code/PTAEAUEMCdIWwKYBcHQM6jpAnqARgqACYIDGANjAkaAJYB2okoAbjLcrgPYBmoa2ekkikktUqB5docNAChgAKkVzQi0AAEADjHigA3miTQGAcwC+oUFoCMoALSgAgv2NnruuADpV67Z4MjE3pTAF5LLQAmB2dGLi0xLnpIcg9YOFAACgBxLi5TckIAYXIuNABXaEIBIUgADwBKX00ddMC3EMsAbS0AZgBdGKd6LiQAC1RQeMTk1Na9TIApAGUAES4JGuFGnzUWgMMOi1AegBZQgCIUIwvBx2GphNoklLS9AHdacaZiBB5IcrkJCsFLlBDNDRVJCVegYQ7BY4AFTGtAwqNA40IVQqQN8wDkPHK9FEz0YQTMaGWRypCLQmVsABprJEmX1WacGgZVKAQKBEQB5Vb8uTmIA)


```

Likewise, for the return type of a function:

```

js


/**



@return{PromiseLike<string>}





function() {}




/**



@returns{{ a: string, b: number }} - May use '@returns' as well as '@return'





function() {}

Try[](https://www.typescriptlang.org/play/#code/PQKhCgAIUgBAnApgFwK7wHaQN4AV4D2AtgJYDOiAMiQNaIA8Zy8JGA5gHwC+UIw4AM1QYAxshIEsABzIAKAJQ4e4UBGhwkaTGRzZIAQwBckJi3YAaSACNjGVESuJ4kLl0gBaSAFl9AT0ioFJAA5Ago6BhkwQY6AO6IADYJMSFhWhjBvPxCouKSBlYKSkA)


```

###  `@typedef`, `@callback`, and `@param`
You can define complex types with `@typedef`. Similar syntax works with `@param`.

```

js


/**



@typedef{Object}SpecialType - creates a new type named 'SpecialType'




@property{string}prop1 - a string property of SpecialType




@property{number}prop2 - a number property of SpecialType




@property{number=}prop3 - an optional number property of SpecialType




@prop{number}[prop4] - an optional number property of SpecialType




@prop{number}[prop5=42] - an optional number property of SpecialType with default






/** @type{SpecialType} */




varspecialTypeObject;




specialTypeObject.prop3;

Try[](https://www.typescriptlang.org/play/#code/PQKhCgAIUgBAXAngBwKYBNUDNIG8DyARgFaoDG8AvpAMppkCWAhgDYAqKqkAtJGQE6om8VAGdITSADtUAd0hI00pgFsMkAOR1yzdpw1QYsZPwD2afkjyj4-BlIDm1E+YCMPCZBt3HkFxatTHG1GVg40Qzh-VEtEPCkAVxVCGOczZAAmD0lE5Ji-dJjA4PpdcNRI40LY+KSU-gBeNPMAZmypSHN4BlMpVmk6-OiaoNpSsM5K-1q8-moAbX8AFgBdds7kbt7+3PqC8yK40ZCyyego9Jn6hf8AVgaljLXeJg6unr6WAdn9gKOSnQTJSyBjwAAWkEwWCYCRY8EMwHA4FARkUXFwJyBqGoIERADcmPwvOM9GgiKQKABucCiEnlcnkeAAOn8LUpQA)


```

You can use either `object` or `Object` on the first line.

```

js


/**



@typedef{object}SpecialType1 - creates a new type named 'SpecialType1'




@property{string}prop1 - a string property of SpecialType1




@property{number}prop2 - a number property of SpecialType1




@property{number=}prop3 - an optional number property of SpecialType1






/** @type{SpecialType1} */




varspecialTypeObject1;

Try[](https://www.typescriptlang.org/play/#code/PQKhCgAIUgBAXAngBwKYBNUDNIG8D2ARgFaoDG8AvpAMppkCWAhgDYAqKqAjJALSRkATqibxUAZ0hNIAO1QB3SEjSymAWwyQA5HXLN2nLlqgxYyQfjSCkecfEEMZAc2rnLPftLsPnkN1Zt8HF1GVg40LhM4f1RrRDwZAFc1QljXC2QAJj4pWWTUwT8M2MDg+n1w7iizYriE-NiAXnTLAGYcphlIS3gGfBlWPJTYossS+KDacrDDE2BwcFBTZVQ8EIrDahB5gDcmQvFpgzQAeRJyeC4AbiA)


```

`@param` allows a similar syntax for one-off type specifications. Note that the nested property names must be prefixed with the name of the parameter:

```

js


/**



@param{Object}options - The shape is the same as SpecialType above




@param{string}options.prop1




@param{number}options.prop2




@param{number=}options.prop3




@param{number}[options.prop4]




@param{number}[options.prop5=42]





functionspecial(options) {




return (options.prop4 || 1001) + options.prop5;


Try[](https://www.typescriptlang.org/play/#code/PQKhCgAIUgBAHAhgJ0QW0gbwPICMBWApgMYAuAvpAPbykCWVAdgM6QC0kAKgBaGTPdE8PnVale-dH0SsAysOJ1EAG04BPYZES4qAN0JQYCFOizNSyOowDmlGvSbMAdPGQ0AjIbhJUGTIwBXNFxCZDtaBhYXN3gAJi9jXyxA4NCAXnCHKNcaAGYEn1N-IJCwyABte0jnHPgAFgBdApM-FNLKSojHaJoAVjS62KboYHAAMwDGMkj+BSVlAAoqxwBKLChIZEJSAORGSCWu7Ji6yAAfM8h3AAZr9zWAamojmpjegG5wciA)


```

`@callback` is similar to `@typedef`, but it specifies a function type instead of an object type:

```

js


/**



@callbackPredicate




@param{string}data




@param{number}[index]




@returns{boolean}






/** @type{Predicate} */




const = () => !(.length2);

Try[](https://www.typescriptlang.org/play/#code/PQKhCgAIUgBBjAhgG2QI0fA1pACgJwFMATASyQBdCoZYAHRfRAW0gG8BnC-UgOwHMAvpGKIKiGnAZNWbXgFdmaQvmEBtPsUIAPALqTYRCvPy8O7NAHtLyQol6CawcOFC0KATzqF2BEuTFCYRBneEszCkhLHABeSAAKDgBKSBiAPkgAQkSAOlsBCgALSABSSAAmJIBuIA)


```

Of course, any of these types can be declared using TypeScript syntax in a single-line `@typedef`:

```

js

/** @typedef{{ prop1: string, prop2: string, prop3?: number }}SpecialType */




/** @typedef{(data: string, index?: number) => boolean}Predicate */


```

### `@template`
You can declare type parameters with the `@template` tag. This lets you make functions, classes, or types that are generic:

```

js


/**



@templateT




@param{T}x - A generic parameter that flows through to the return type




@returns{T}





function() {




return;






const("string");




const(123);




const({});

Try[](https://www.typescriptlang.org/play/#code/PQKhCgAIUgBAXApgWwA4BsCGTIBUoyyqYBOmykA3rgL6QAekAtJAIKQDmiAdoiQJYBjSMTLJESEpHgALbJABm6APYB3AM7SZJZQFcOM6cq2JIJCbpLdpAT1SICcc-EvdN1GgWDgFu7oPh+ZWt+ABMACnoASiooMwsrBgBucE9wQWD1eEhMSABeSDDwgCIsgW4OYqiUjLdsgCN8woiARgAmAGZq9Mzs4QKiyhpqoA)


```

Use comma or multiple tags to declare multiple type parameters:

```

js
/**



@templateT,U,V




@templateW,X




```

You can also specify a type constraint before the type parameter name. Only the first type parameter in a list is constrained:

```

js


/**



@template{string}K - K must be a string or string literal




@template{{ serious(): string }}Seriousalizable - must have a serious method




@param{K}key




@param{Seriousalizable}object





functionseriousalize(, object) {




// ????


Try[](https://www.typescriptlang.org/play/#code/PQKhCgAIUgBAXApgWwA4BsCGTIG8DO8ATgJYB2A5gL6QDSkAtHZMgK6GQBGikmkhpSpAD2RfsXIVI6EkiKZ0UGAhQZsPXLn6JSw9gAoAlAC5xgqVRoBlHST34FJAF6ZO6HkzYcAFpgBuPHz4tvYsiPDewgAmSnComPLIeLQ0ANaIAJ6xsPGJeDa67I4ubog0wpwAVogAxvBKwOAAZqxkdXZk2oUOMk6I+ukZADQiVbXwhnhQkMDAkAD8i-PgVEA)


```

Finally, you can specify a default for a type parameter:

```

js



/** @template [T=object] */




classCache {




/** @param{T}initial */




constructor(initial) {






letnewCache()

Try[](https://www.typescriptlang.org/play/#code/PQKhAIAEBcFMFsAOAbAhncBtAKgXgPYBGAVrAMbQC64IwAUGWgM5PgDCqZAFrOAN51wQ8KAiREqAE6p4-bAF9wASwB2S6EtTIa9YeDL4VTaJICuFfJIAUq9ZuQBKfoOHy6b5LGj7wucCtgAd3ZOHisHIA)


```

### `@satisfies`
`@satisfies` provides access to the postfix [operator `satisfies`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html) in TypeScript. Satisfies is used to declare that a value implements a type but does not affect the type of the value.

```

js


// @ts-check


/**



@typedef{"hello world" | "Hello, world"}WelcomeMessage






/** @satisfies {WelcomeMessage} */




constmessage"hello world"




const message: "hello world"





/** @satisfies {WelcomeMessage} */


Type '"Hello world!"' does not satisfy the expected type 'WelcomeMessage'.1360Type '"Hello world!"' does not satisfy the expected type 'WelcomeMessage'.

constfailingMessage"Hello world!"





/** @type{WelcomeMessage} */




constmessageUsingType"hello world"




const messageUsingType: WelcomeMessage

Try[](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygIwGYBsAGAUCBAC6IC0AxgBaTkDWBAVA3qA8QJ4AOkAJpAGagA3gCJqAG3FxQAdwTieI0AB9QIgBKRJcADSz5igL6gA6lvJwAtpACykRIgCGAc0gsGwPIzbgnRAJaI-P72wmbiFtZ2Di6Qxh54FgB2iESg1jGuoAC8ahJS+tAKIgRgoOWgAHoA-F7ATBB+gcGhQuGRtvZOrvGeyamg-I7+4v5JztHdkDlqmtqFCgCEJd4c3GHmVp2Zcax9cClpGVMAqohjzgAqXNO5YloFckWKpRXlNUA)


```

## Classes
Classes can be declared as ES6 classes.

```

js



class {





@param{number}data





constructor(data) {




// property types can be inferred




this.name"foo";





// or set explicitly




/** @type{string | null} */




this.titlenull;





// or simply annotated, if they're set elsewhere




/** @type{number} */




this.size;





this.initialize(data); // Should error, initializer expects a string






@param{string}s





initializefunction () {




this.size.length;







varnew(0);




// C should only be called with new, but


// because it is JavaScript, this is allowed and


// considered an 'any'.



varresult(1);

Try[](https://www.typescriptlang.org/play/#code/MYGwhgzhAEDC0G8BQ1oHoBUGWo9AAgA5gBOYAtogHYCu5ARgKYkC+0AJmAC5g7QZocwAPZUIXEjWBdhJABSceASkR90aaIRLDCzLgE9oB3TGBgq0JtACWVAGbMSjdmq4ALaxAB0VCo2gAvNAARHbCwsEA3EhqaBqy0BCMXNCMAB6EINbA1lwg+rFYBMb+COIktgDm0AA+0LQgIGwCrh7eXLkg-kENINGx8SSJ1uSZhuZUwjxczgA0NnZGboz6AOROicmpIEkA7stOhXj4JdR0TKz8gqio7p5eENYAXoz9N0v3trnWYFkvCtwwEpIupoABlNzCGggdipEjaEjzL4dX7PZipDKMaQwMCJCRVHAsHCYbA3Y7EMiUMr4qiVNgQPgtVDIn5-brQOw0KjSayiaByCAqZDvO7eR4vQKJLxdWnuaKoFjRIlIABupGgwElVEYuzgcgADMCYnE4IlIdDYaJ8pZ-GZGs5oLtcm56jr5vQaFwkCamGYaEkbClPNAAFJgNVg4AVQhceaimw4xrCXYO8wuE0iMTWdjMVMWVbmNZeVXqpwQaEpIKwOQARmBQA)


```

They can also be declared as constructor functions; use [`@constructor`](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#constructor) along with [`@this`](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#this) for this.
### Property Modifiers
`@public`, `@private`, and `@protected` work exactly like `public`, `private`, and `protected` in TypeScript:

```

js


// @ts-check




class {




constructor() {




/** @private */




this.identifier100;






printIdentifier() {




console.(this.identifier);







constnew();




console.(.identifier);


Property 'identifier' is private and only accessible within class 'Car'.2341Property 'identifier' is private and only accessible within class 'Car'.Try[](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwGYAsBGAUCBAC6IC0AxgBaTkDWee5ANgIaKKgDCL0oA3nlChycAHaIi0AK7kiCABQBKfoKGhgAKg0QADtACWANxZFIoDcFVCilfYgB0+gCaRRRfQDN9MUAF5QOAAMgQDcqgC+DEJ6+m4Aki5unt7QSipqwmKIcEyQ9kxwAObyNnaOie5eMIphQpGRjFlEwn6gopAA7lw8SmEi4jl5BcXk5a6VKTVAA)


```

  * `@public` is always implied and can be left off, but means that a property can be reached from anywhere.
  * `@private` means that a property can only be used within the containing class.
  * `@protected` means that a property can only be used within the containing class, and all derived subclasses, but not on dissimilar instances of the containing class.


`@public`, `@private`, and `@protected` do not work in constructor functions.
### `@readonly`
The `@readonly` modifier ensures that a property is only ever written to during initialization.

```

js


// @ts-check




class {




constructor() {




/** @readonly */




this.identifier100;






printIdentifier() {




console.(this.identifier);







constnew();




console.(.identifier);

Try[](https://www.typescriptlang.org/play/#code/PTAEAEFMCdoe2gZwFygEwFYAsAGAUCBAC6IC0AxgBaTkDWee5ANgIaKKgDCL0oA3nlChycAHaIi0AK7kiCABQBKfoKGhgAKg0RokFgBMxTAJ6gNwVUKKUAlogB0N-ZFFEbAMxsxQAXlABGHBwAblUAXwYhAAdoG1cASWdXDy9oJRU1YTFEOCZIeyY4AHN5aztHJLdPGEVQoQiIxmyiYV9QUUgAdy4eJVCRcVz8wpLyCpcq1NqgA)


```

### `@override`
`@override` works the same way as in TypeScript; use it on methods that override a method from a base class:

```

js



exportclass {




() { }





classextends {




/** @override */




() { }


Try[](https://www.typescriptlang.org/play/#code/KYDwDg9gTgLgBAYwDYEMDOa4GE4G8BQccAtgBQCUecAvvrcupgCJygzAB2AJpjgUQHoAVELgABCADdgUKAEsuwOEIGESFKrWpA)


```

Set `noImplicitOverride: true` in tsconfig to check overrides.
### `@extends`
When JavaScript classes extend a generic base class, there is no JavaScript syntax for passing a type argument. The `@extends` tag allows this:

```

js


/**



@templateT




@extends{Set<T>}





classSortableSetextends {




// ...


Try[](https://www.typescriptlang.org/play/#code/PQKhCgAIUgBAXApgWwA4BsCGTIBUoyyIAeSAdgCYDOkA3gMqLwA8uAfAL4HDgDGWVGvQD2AJ3iYARukSN4kEuWqQ5dKJGDBIAOl3gOQA)


```

Note that `@extends` only works with classes. Currently, there is no way for a constructor function to extend a class.
### `@implements`
In the same way, there is no JavaScript syntax for implementing a TypeScript interface. The `@implements` tag works just like in TypeScript:

```

js



/** @implements{Print} */




classTextBook {




print() {




// TODO



Try[](https://www.typescriptlang.org/play/#code/PQKhAIAEEsFsAcA2BTWyB2AXAzuA3gAoBO0WAvuCMAFADGiAhtrgCrIAemAQgPY8DW+auHDwSWABQBKISJHBg4FgHkAIsuHgy1MkA)


```

### `@constructor`
The compiler infers constructor functions based on this-property assignments, but you can make checking stricter and suggestions better if you add a `@constructor` tag:

```

js


/**



@constructor




@param{number}data





function(data) {




// property types can be inferred




this.name"foo";





// or set explicitly




/** @type{string | null} */




this.titlenull;





// or simply annotated, if they're set elsewhere




/** @type{number} */




this.size;





this.initialize();


Argument of type 'number' is not assignable to parameter of type 'string'.2345Argument of type 'number' is not assignable to parameter of type 'string'.

/**



@param{string}s





.prototype.initializefunction () {




this.size.length;






varnew(0);




.size;





varresult(1);


Value of type 'typeof C' is not callable. Did you mean to include 'new'?2348Value of type 'typeof C' is not callable. Did you mean to include 'new'?Try[](https://www.typescriptlang.org/play/#code/PTAEAEGMAsFNINYCkDOAoEFYCdsHtsUAuUAJgGYAWAVjKoA4MAqJtUJiSPAOxQBdsAV0h8CbDuAAOAQ2zSAtqADe3QfIBGOAL6gAJtL7TxwNADNB3EQEseoAMIAKfYYCUytqEyT8knHwCeoAG+KKCQ0tygmqBW3KY42LC6HnzQVigAdNwKsKAAvKAARKZ4eIUA3GgemASgKLB8oLAAHpIANlaQVnxt-tUsEMG5SvzYsQDmoAA+oKptbTpMJqBBaZl83W25BXNtldVgtShW8u2BEdx4hnxJADQxpquw-gDkiXUNTW31AO5wif0JENlKoNNp2MtVukMscAF6wfYrVLQ2LdKzSDrwpwGaQuSpaZisdgQGRyRQjAQTHToCFoOwZbxXK7+XwZVEbDFWeH5UDmSwbWwOFBuJQpNYwrnbOoZLbccapfH7ABusjCPO4sB+9gcAAY8WhIBL4crVYkUII2o0Co4AIx4oA)


```

> Note: Error messages only show up in JS codebases with [a JSConfig](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) and [`checkJs`](https://www.typescriptlang.org/tsconfig#checkJs) enabled.
With `@constructor`, `this` is checked inside the constructor function `C`, so you will get suggestions for the `initialize` method and an error if you pass it a number. Your editor may also show warnings if you call `C` instead of constructing it.
Unfortunately, this means that constructor functions that are also callable cannot use `@constructor`.
### `@this`
The compiler can usually figure out the type of `this` when it has some context to work with. When it doesn’t, you can explicitly specify the type of `this` with `@this`:

```

js


/**



@this{HTMLElement}




@param{*}e





functioncallbackForLater() {




this.clientHeightparseInt(); // should be fine!


Try[](https://www.typescriptlang.org/play/#code/PQKhCgAIUgBAXAFgSwM6QN4AkAqBZAGQFEAbAUwFsyA7eAXyhlgAcBDAJ1YsxDsjMbBwAMwCu1AMbxkAe2qQJrEiQBGrCQGsAYjPYFW8MuwAUZAJSYokJGgB0EkshrwsZZAHNE8SAF5IbdlQyAElaUzMAbkhgYEhURBlREgATSBUySGFkajIAQnA6IA)


```

## Documentation
### `@deprecated`
When a function, method, or property is deprecated you can let users know by marking it with a `/** @deprecated */` JSDoc comment. That information is surfaced in completion lists and as a suggestion diagnostic that editors can handle specially. In an editor like VS Code, deprecated values are typically displayed in a strike-through style ~~like this~~.

```

js



/** @deprecated */




constapiV1 = {};




constapiV2 = {};





apiV;



   


  * apiV1


  * apiV2






Try[](https://www.typescriptlang.org/play/#code/PTAEAEDsHsFECd7XgZwFDAFSYgEwKYAO8+AxgIYAu+uomwap0kKlo5hAlgGoCMoAXlABvAL4BuRs1bsu3AEyCREtGg49JIUAD0APqqA)


```

### `@see`
`@see` lets you link to other names in your program:

```

ts



type> = { :  }




/** @seeBox for implementation details */




typeBoxify> = { [inkeyof]: > };

Try[](https://www.typescriptlang.org/play/#code/C4TwDgpgBAQg9gDwDwBUB8UC8UDeVgBcUKUAvgFAD0AVNVAAIDOE08CUAZnAE5QCWAWzAAbCAIgA7YAENgfOBKgATCDL7DGUapXKhIsRHw4hUGbHgDaAaX6KA1hBBwOxALpE2psgG4gA)


```

Some editors will turn `Box` into a link to make it easy to jump there and back.
### `@link`
`@link` is like `@see`, except that it can be used inside other tags:

```

ts



type> = { :  }




/** @returns{@linkBox} containing the parameter. */




function>(: ): > {




return };


Try[](https://www.typescriptlang.org/play/#code/C4TwDgpgBAQg9gDwDwBUB8UC8UDeVgBcUKUAvgFAD0AVNVAAIBOEwArowHYDOUAgrvQA2ASw4BrWIlJQAxnA7AAhqNEBzfAAtoYRY0UBbFhEYA6KNUrkAZqw4zgw+VABGiJAFU0AClZF3ASiJ4ZE9ccigoZjZOXHwiVjIAbnJSIA)


```

You can also link a property:

```

ts



type = {




name: string




hello: () =>string





/**



 * Note: you should implement the {@linkPet.hello} method of Pet.





functionhello(: ) {




.hello()


Try[](https://www.typescriptlang.org/play/#code/C4TwDgpgBAChxQLxQN4CgpQHYEMC2EAXFAM7ABOAllgOYZQAWEANswPbEAUAlEgHykK1OgF80aAPQAqKRilQAcm2BEoINgFdSDTcwAmUSnjDMIBLAmBNUAAWbUA1rHgA6JqzYioBK2wNsAM2dgFzkJNACNLABjYEo2LEYWdk4wYjhgXnRMMDdkth40ESA)


```

Or with an optional name:

```

ts



type = {




name: string




hello: () =>string





/**



 * Note: you should implement the {@linkPet.hello | hello} method of Pet.





functionhello(: ) {




.hello()


Try[](https://www.typescriptlang.org/play/#code/C4TwDgpgBAChxQLxQN4CgpQHYEMC2EAXFAM7ABOAllgOYZQAWEANswPbEAUAlEgHykK1OgF80aAPQAqKRilQAcm2BEoINgFdSDTcwAmUSnjDMIBLAmBNUAAWbUA1rHgA6JqzZQAPoxbsRUARWbAZsAGbOwC5yEmhhGlgAxsCUbFi+HpxgxHDAvOiYYG5+bDxoIkA)


```

## Other
### `@enum`
The `@enum` tag allows you to create an object literal whose members are all of a specified type. Unlike most object literals in JavaScript, it does not allow other members. `@enum` is intended for compatibility with Google Closure’s `@enum` tag.

```

js



/** @enum{number} */




constJSDocState = {




BeginningOfLine:0,




SawAsterisk:1,




SavingComments:2,






JSDocState.SawAsterisk;

Try[](https://www.typescriptlang.org/play/#code/PQKhAIAEFMDsFcC24DeDECNoCcC+4RgAoAYwHtYBnAF3ACkBlAETJIeoENrpwBeVIuHAAhaAHMAlrFhSxAeQBmAGSnQAXOAAMAGkHgGHAO4BBGjgmUA1hoCMuoQYBusgMJlEiONUoaATLtwAbiIiRhY2Tm4AOgMTM2wLS0CgA)


```

Note that `@enum` is quite different from, and much simpler than, TypeScript’s `enum`. However, unlike TypeScript’s enums, `@enum` can have any type:

```

js



/** @enum{function(number): number} */




constMathFuncs = {




add1: () =>1,




: () => -,




sub1: () =>1,






MathFuncs.add1;

Try[](https://www.typescriptlang.org/play/#code/PQKhAIAEFMDsFcC24DeAzesDGAXAlgPawAUCiARtAE4CUAXOGZVQL7gjABQWRAzjuACyAQxwALAGKYsvcAF5UncOGEATVQEYGpGvIB8jcAGpwGgDRLweVdti65BgLSwLy3vHJbwO-YcemLFgBuTk4RcSlsXgA6NU0goA)


```

### `@author`
You can specify the author of an item with `@author`:

```

ts


/**


 * Welcome to awesome.ts



@authorIan Awesome <i.am.awesome@example.com>


Try[](https://www.typescriptlang.org/play/#code/PQKhCgAIUh1BTANgYwPYFt6QC6sgQwHd4BnDeAOmxKhgAF8BXbAC1QCdIBJfAO0gCCxMpkgAeAJYV86acPJ14ADxkAHRJTToAfLWBA)


```

Remember to surround the email address with angle brackets. Otherwise, `@example` will be parsed as a new tag.
### Other supported patterns

```

js



varsomeObj = {





@param{string}param1 - JSDocs on property assignments work





:function (param1) {},





/**


 * As do jsdocs on variable assignments



@return{Window}





letsomeFuncfunction () {};




/**


 * And class methods



@param{string}greeting The greeting to use





.prototype.sayHi = (greeting) =>console.("Hi!");




/**


 * And arrow function expressions



@param{number}x - A multiplier





letmyArrow = () =>;




/**


 * Which means it works for function components in JSX too



@param{{a: string, b: number}}props - Some param





var = (props) =><div>{props..charAt(0)}</div>;




/**


 * A parameter can be a class constructor, using Google Closure syntax.




@param{{new(...args: any[]): object}}C - The class to register





functionregisterClass() {}




/**



@param{...string}p1 - A 'rest' arg (array) of strings. (treated as 'any')





functionfn10() {}




/**



@param{...string}p1 - A 'rest' arg (array) of strings. (treated as 'any')





function() {




return.join();


Try[](https://www.typescriptlang.org/play/#code/PTAEAEBcE8AcFMDOAuUAneBDAxpAUNgDaaKKgBiA9paAN4C+eIoAtG9gK6Rst4BumNKESUAtvADyAIwBWoALx08oUMABUa5SrURYgzKLqJIaAJYA7AOb1QetAYCMrUACkAygBFK2MpXO20SgQ0GFASRFNLc3FzSDIAd0o0AGstUDVgLQAPVAAzDnNcUz9QAAo7RwBKOnoAGjx6AG48Jg1lHQBBMgATGhlEXp9QEoEzTClCeDDSSOj4WMR2iAxIDjR-WgB1C174xnTMychhMXhyAuwFUHzCyGL-UuqGZtbNdNAO827QInDQcUgAAtKN1Fu9wBVDLRjGYrDZLBh4HcrKAACqAqYI+BIiyWUCQGgcRDwdqZKiUAB0sECBJgCApiEw0AAEqYrqUsTirNV5AA+H5+ESTCmESiWUoAIlZAEIJZUXuo3p0vmE0IF4tcLncSvAstSkBFBUsIfooeYOKIpPA0DYss4Ov8OIQ7rBCKZraS8Ed-tAOmrKBrFKUsjz+XadFkFW13ptAaZsID-lhzGRTMdEikyLkkprbvcBaJYH55nFQBZXG4ABr46jGyF0WiYVAw3G1UBSVDmy3W+g2alBMgsUBuU62U2e0bXS5B-uwRCh0AAHm6pj4vNos8QFMwFITgg6kFKAAZKvRF8AV2uo0qPmP7ADrT9MP4rWEfsRSAKUyYOLgkm2iVxUAAHFqEsSZQAAYVFRA1imRBoFiTAsgpdo61NBtzHgeJSgpPDBEsFAwnMaAAG0AF1KlQShZHgXBeyg5x0SmX5PwJdB4EsUxjA9A48BuIoSgwLieLQaDwlKSCnkYV50PvOg8IZExcT7JwhwdAByDBjA01U8VKQR7GgapKFyYRlKsLcyhMLBIHgb4SFADTn2gDTKk9ATtX8XJzAcI9ygcaSWkVOSDAUvCWzhWw1NvLSkEgXSCLKQymRMszIsIilrIwTA7IcshnJItyPK1fMfIATgCp4tBWNZ-FgBwKRkSgLEeZp6CAA)


```

### Unsupported patterns
Postfix equals on a property type in an object literal type doesn’t specify an optional property:

```

js


/**



@type{{ a: string, b: number= }}





varwrong;



/**


 * Use postfix question on the property name instead:



@type{{ a: string, b?: number }}





varright;

Try[](https://www.typescriptlang.org/play/#code/PQKhCgAIUgBAXAngBwKaQN4cgQwFyQDO8ATgJYB2A5gDSQBGBFArgLb2okC8kAvr1BDBwANxwlIAdxIB7agG5woCNEgBVQumQziAMzIAPSAEdmqYmTmQr8ABZbZaEkkgUcrdJWKocAEzyCcEhomNj4RKSUtAwA-ExsHBL8gsJiEuRUtvDyQA)


```

Nullable types only have meaning if [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks) is on:

```

js


/**



@type{?number}



 * With strictNullChecks: true  -- number | null


 * With strictNullChecks: false -- number




varnullable;

Try[](https://www.typescriptlang.org/play/#code/PQKhCgAIUgBAXAngBwKaQN4H4B2BXAWwCNUAnAXyhgHUBLeAC0gGd5TaBjeAOTwBs+AYQaoOAa2YAuSGzzpIAWgWR8xMpAA+K-nyqQ6jFm048dw0ROkAzAIZ9m6JdrWkqwcADcbpbQJtE+VABuIA)


```

The TypeScript-native syntax is a union type:

```

js


/**



@type{number | null}



 * With strictNullChecks: true  -- number | null


 * With strictNullChecks: false -- number




varunionNullable;

Try[](https://www.typescriptlang.org/play/#code/PQKhCgAIUgBAXAngBwKaQN4DsCuBbAI1QCdIAfSXAGyoF8oYB1AS3gAtIBneY5gY3gA5HDQDCbVHwDWnAFyQeOdJAC0KyviKkK1Kg0gt2XHvyEiq4yTPkAzAIZVO6NRsIkGwcADc7pHFmYAeyxhGjsCKlQAbiA)


```

Non-nullable types have no meaning and are treated just as their original type:

```

js


/**



@type{!number}



 * Just has type number




varnormal;

Try[](https://www.typescriptlang.org/play/#code/PQKhCgAIUgBAXAngBwKaQN4EIB2BXAWwCNUAnAXyhgCk8BneSACwEM7Ik1J9iyrhwANxaluAe1IEWAGwDcQA)


```

Unlike JSDoc’s type system, TypeScript only allows you to mark types as containing null or not. There is no explicit non-nullability — if strictNullChecks is on, then `number` is not nullable. If it is off, then `number` is nullable.
### Unsupported tags
TypeScript ignores any unsupported JSDoc tags.
The following tags have open issues to support them:
  * `@memberof` ([issue #7237](https://github.com/Microsoft/TypeScript/issues/7237))
  * `@yields` ([issue #23857](https://github.com/Microsoft/TypeScript/issues/23857))
  * `@member` ([issue #56674](https://github.com/microsoft/TypeScript/issues/56674))


### Legacy type synonyms
A number of common types are given aliases for compatibility with old JavaScript code. Some of the aliases are the same as existing types, although most of those are rarely used. For example, `String` is treated as an alias for `string`. Even though `String` is a type in TypeScript, old JSDoc often uses it to mean `string`. Besides, in TypeScript, the capitalized versions of primitive types are wrapper types — almost always a mistake to use. So the compiler treats these types as synonyms based on usage in old JSDoc:
  * `String -> string`
  * `Number -> number`
  * `Boolean -> boolean`
  * `Void -> void`
  * `Undefined -> undefined`
  * `Null -> null`
  * `function -> Function`
  * `array -> Array<any>`
  * `promise -> Promise<any>`
  * `Object -> any`
  * `object -> any`


The last four aliases are turned off when `noImplicitAny: true`:
  * `object` and `Object` are built-in types, although `Object` is rarely used.
  * `array` and `promise` are not built-in, but might be declared somewhere in your program.


### [Type Checking JavaScript Files How to add type checking to JavaScript files using TypeScript ](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html)### [Creating .d.ts Files from .js files How to add d.ts generation to JavaScript projects ](https://www.typescriptlang.org/docs/handbook/declaration-files/dts-from-js.html)
The TypeScript docs are an open source project. Help us improve these pages [by sending a Pull Request](https://github.com/microsoft/TypeScript-Website/blob/v2/packages/documentation/copy/en/javascript/JSDoc%20Reference.md) ❤
Contributors to this page:
OT
NS
RG
N
R
12+
Last updated: Oct 26, 2026This page loaded in 0.278 seconds.
