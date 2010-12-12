A safe JavaScript dictionary
============================

The problem
-----------

**JavaScript objects used as dictionaries cannot support arbitrary keys.** The
following snippets of code, run in the SpiderMonkey JavaScript shell,
demonstrate the problem:

1. 

        js> var foo = {}
        js> "toString" in foo
        true

    Here toString is in foo's prototype, so we unexpectedly return true. This
can be solved by using hasOwnProperty wherever we would normally use in, but
that is ugly and cumbersome.

2. 

        js> var bar = {}
        js> bar["__proto__"] = "test"
        js> for (var k in bar) print(k)
        (no output)

    SpiderMonkey treats the `__proto__` property of an object specially and does
not consider it enumerable. Since `__proto__` is non-configurable, there's no
non-fragile way to solve this that I know of. (Setting `__proto__` to null seems
to work but is probably fragile.)

The solution
------------

* Define a Dict constructor, instances of which are safe dictionaries.

* Use objects under the hood for efficient lookup, and use a reversible
  conversion to avoid colliding with special objects.

* Use ECMAScript proxies to allow (... in ...) and for (... in ...) to function
  as expected.

Unfortunately we cannot use direct property accesses, because there's no way to
distinguish between toString called because JavaScript wants to coerce our
object into a string and toString read as a key. [Virtual Values for Language
Extensions][1], if implemented in Harmony, will likely be able to solve this.

Limitations
-----------

* This is (obviously) a fair bit slower than direct property access.

* We only support strings and numbers (and things that can be coerced to strings
  or numbers) as keys.

[1]: http://www.soe.ucsc.edu/research/report?ID=1588
