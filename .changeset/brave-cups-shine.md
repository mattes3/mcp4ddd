---
'@ddd-components/scaffolder': patch
---

Refactored the domain service template to chain `.andThen()` calls directly on the `transact(...)` result instead of nesting them inside the `transact` callback. Generated code now follows a flatter, more readable `AsyncResult` chain when an aggregate is involved.
