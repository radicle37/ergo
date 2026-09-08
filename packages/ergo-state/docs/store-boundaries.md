# Store boundaries: one store, or many?

[Back to README](../README.md)

When you're deciding whether two pieces of state belong in the same store or in separate stores, one question matters most:

**If these two things got out of sync, would something actually break — or would it just look a little off for a moment?**

## The rule: state that must agree, belongs together

If two pieces of state always need to match up for your app to behave correctly, put them in one store. A single `set()` call can then update both at once, so there's never a moment where they disagree.

For example, say you have a date-range filter with a `start` and an `end`, and `start` must never be after `end`. If `start` and `end` live in two separate stores, nothing stops one from being updated without the other — even if today's code is careful about it, the next change might not be. Keep them in one store, and a single `set()` call can guarantee the rule holds.

The reverse isn't true, though: just because two pieces of state have no such rule doesn't mean they *must* be split apart. Related state can stay together in one store simply because it's convenient. Splitting into separate stores is the right call when the two pieces are genuinely independent — not just whenever there's no strict rule tying them together.

## A quick way to decide: who's actually keeping the rule true?

When you're unsure whether two values need to live in the same store, ask: **right now, what actually makes sure this rule holds?**

- **Nothing does yet.** That's a sign the state is in the wrong place. If nothing in your code stops `start` from ending up after `end`, don't reach for some way to update two stores together to paper over that — move both values into one store instead, so one `set()` call can guarantee it.
- **Something else already does.** Often that's a backend. For example, a shopping-cart store and a separate "items in stock" store, where the real source of truth is a transaction on the server. Here the two client-side stores are just caches of server state, and if they briefly disagree, that's a display-timing quirk, not a broken rule — the rule itself is already being enforced elsewhere, just not on the client.

## Ergo doesn't support updating multiple stores together

Ergo has no built-in way to make writes to two different stores happen as one unit — where either both updates go through, or neither does — and there are no plans to add one. If you find yourself wanting that, it usually means the two stores should be merged into one — see the rule above.

There's one real exception worth naming: two features owned by different teams can have a genuine correctness link (say, a cart summary and a checkout summary that must always agree) where merging the stores would be the technically cleaner answer, but merging code across a team-ownership line has its own real cost. Merging by default is still the right starting recommendation — but if that's not realistic today, treat keeping the stores separate as a deliberate, documented tradeoff, not a gap to quietly work around.

See the [FAQ](./faq.md#what-if-my-app-needs-to-update-two-stores-together) for the short version of this answer.

## Related pages

- [FAQ](./faq.md)
- [Store factories](./store-factories.md)
