# tool-args gate test - every family character - EDITED with an em-dash and a curly "quote" and an ellipsis...

Dashes: the em-dash - and the en-dash - and another -.
Curly quotes: "double" and 'single' and the low-9 "double".
Ellipsis: three dots ... and again ....
Unicode spaces: normal space vs non-breaking space (here) and a thin space.
Invisible: zero-width spaces between these letters and a soft hyphen after this word.
Fullwidth: ABC and 123 and !(full-width forms).

If the tool-args gate works, every character above is normalized IN THE WRITTEN FILE:
dashes → -, curly → straight, ... → ..., unicode spaces → regular, zero-width → removed,
full-width → half-width.