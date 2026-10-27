## Keyboard shortcuts
Press `←` or `→` to navigate between chapters
Press `S` or `/` to search in the book
Press `?` to show this help
Press `Esc` to hide this help
# [Comments](https://doc.rust-lang.org/reference/comments.html#comments)
[[comments.syntax]](https://doc.rust-lang.org/reference/comments.html#r-comments.syntax "comments.syntax")
**Lexer** → | | | | | 
→ // ( ~[/ ! [LF](https://doc.rust-lang.org/reference/whitespace.html#grammar-LF)] | // ) ~* | // | //immediately followed by LF
→ /* ^ ( | ( !*/ ) )* */
→ //! ^ [LINE_DOC_COMMENT_CONTENT](https://doc.rust-lang.org/reference/comments.html#grammar-LINE_DOC_COMMENT_CONTENT) ( | )
[LINE_DOC_COMMENT_CONTENT](https://doc.rust-lang.org/reference/comments.html#railroad-LINE_DOC_COMMENT_CONTENT) → ( ! ~ )*
→ /*! ^ ( | )* */
→ /// ^ [LINE_DOC_COMMENT_CONTENT](https://doc.rust-lang.org/reference/comments.html#grammar-LINE_DOC_COMMENT_CONTENT) ( | )
→ /** ![* /] ^ ( ~* | ) ( | )* */
→ ( !( */ | ) )
→ | | 
Show syntax diagrams
COMMENT LINE_COMMENT INNER_LINE_DOC OUTER_LINE_DOC INNER_BLOCK_DOC OUTER_BLOCK_DOC BLOCK_COMMENT
LINE_COMMENT ⚠️ with the exception of CHAR ⚠️ with the exception of CHAR immediately followed by LF
BLOCK_COMMENT no backtracking BLOCK_COMMENT_OR_DOC not followed by CHAR
INNER_LINE_DOC //! no backtracking LINE_DOC_COMMENT_CONTENT
LINE_DOC_COMMENT_CONTENT not followed by ⚠️ with the exception of CHAR
INNER_BLOCK_DOC /*! no backtracking BLOCK_COMMENT_OR_DOC BLOCK_CHAR
OUTER_LINE_DOC /// no backtracking LINE_DOC_COMMENT_CONTENT
OUTER_BLOCK_DOC /** not followed by no backtracking ⚠️ with the exception of CHAR BLOCK_COMMENT_OR_DOC BLOCK_COMMENT_OR_DOC BLOCK_CHAR
BLOCK_CHAR not followed by CHAR
BLOCK_COMMENT_OR_DOC INNER_BLOCK_DOC OUTER_BLOCK_DOC BLOCK_COMMENT
[[comments.normal]](https://doc.rust-lang.org/reference/comments.html#r-comments.normal "comments.normal")
## [Non-doc comments](https://doc.rust-lang.org/reference/comments.html#non-doc-comments)
Comments follow the general C++ style of line (`//`) and block (`/* ... */`) comment forms. Nested block comments are supported.
[[comments.normal.tokenization]](https://doc.rust-lang.org/reference/comments.html#r-comments.normal.tokenization "comments.normal.tokenization")
Tests with this rule: 
  * [tests/ui/tuple/index-float.rs](https://github.com/rust-lang/rust/blob/1.99.1/tests/ui/tuple/index-float.rs)


Non-doc comments are interpreted as a form of whitespace.
[[comments.doc]](https://doc.rust-lang.org/reference/comments.html#r-comments.doc "comments.doc")
## [Doc comments](https://doc.rust-lang.org/reference/comments.html#doc-comments)
[[comments.doc.syntax]](https://doc.rust-lang.org/reference/comments.html#r-comments.doc.syntax "comments.doc.syntax")
Line doc comments beginning with exactly _three_ slashes (`///`), and block doc comments (`/** ... */`), both outer doc comments, are interpreted as a special syntax for [`doc` attributes](https://doc.rust-lang.org/rustdoc/the-doc-attribute.html).
[[comments.doc.attributes]](https://doc.rust-lang.org/reference/comments.html#r-comments.doc.attributes "comments.doc.attributes")
That is, they are equivalent to writing `#[doc="..."]` around the body of the comment, i.e., `/// Foo` turns into `#[doc=" Foo"]` and `/** Bar */` turns into `#[doc=" Bar "]`. They must therefore appear before something that accepts an outer attribute.
[[comments.doc.inner-syntax]](https://doc.rust-lang.org/reference/comments.html#r-comments.doc.inner-syntax "comments.doc.inner-syntax")
Line comments beginning with `//!` and block comments `/*! ... */` are doc comments that apply to the parent of the comment, rather than the item that follows.
[[comments.doc.inner-attributes]](https://doc.rust-lang.org/reference/comments.html#r-comments.doc.inner-attributes "comments.doc.inner-attributes")
That is, they are equivalent to writing `#![doc="..."]` around the body of the comment. `//!` comments are usually used to document modules that occupy a source file.
[[comments.doc.bare-crs]](https://doc.rust-lang.org/reference/comments.html#r-comments.doc.bare-crs "comments.doc.bare-crs")
The character `U+000D` (CR) is not allowed in doc comments.
> Note
> It is conventional for doc comments to contain Markdown, as expected by `rustdoc`. However, the comment syntax does not respect any internal Markdown. `/** `glob = "*/*.rs";` */` terminates the comment at the first `*/`, and the remaining code would cause a syntax error. This slightly limits the content of block doc comments compared to line doc comments.
> Note
> The sequence `U+000D` (CR) immediately followed by `U+000A` (LF) would have been previously transformed into a single `U+000A` (LF).
## [Examples](https://doc.rust-lang.org/reference/comments.html#examples)

```
#![allow(unused)]
fn main() {
//! A doc comment that applies to the implicit anonymous module of this crate

pub mod outer_module {

    //!  - Inner line doc
    //!! - Still an inner line doc (but with a bang at the beginning)

    /*!  - Inner block doc */
    /*!! - Still an inner block doc (but with a bang at the beginning) */

    //   - Only a comment
    ///  - Outer line doc (exactly 3 slashes)
    //// - Only a comment

    /*   - Only a comment */
    /**  - Outer block doc (exactly) 2 asterisks */
    /*** - Only a comment */

    pub mod inner_module {}

    pub mod nested_comments {
        /* In Rust /* we can /* nest comments */ */ */

        // All three types of block comments can contain or be nested inside
        // any other type:

        /*   /* */  /** */  /*! */  */
        /*!  /* */  /** */  /*! */  */
        /**  /* */  /** */  /*! */  */
        pub mod dummy_item {}
    }

    pub mod degenerate_cases {
        // empty inner line doc
        //!

        // empty inner block doc
        /*!*/

        // empty line comment
        //

        // empty outer line doc
        ///

        // empty block comment
        /**/

        pub mod dummy_item {}

        // empty 2-asterisk block isn't a doc block, it is a block comment
        /***/

    }

    /* The next one isn't allowed because outer doc comments
       require an item that will receive the doc */

    /// Where is my item?
  mod boo {}
}
}
```

