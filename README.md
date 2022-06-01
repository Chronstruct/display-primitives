# Display Primitives

Tasks To Do:

- [ ] Rename this repo
- [ ] Add other display values
- [ ] Remove opinionated primitives (except row and col)
- [ ] Update website to use this
- [ ] Add GH Issue about the generic default problem to make the component typecheck as its `$`
- [ ] Consider `<flex.row>` and `<flex.col>`
- [ ] Build new design that uses grid and an image, too
- [ ] Namespace our classnames with `de-`?
- [ ] Finish this readme

## What is this?

The browser gives us `<div/>` for `display: block;` and `<span/>` for `display: inline;`, but what about the other `display` values like `flex` and `grid`? This babel transform adds these missing tags/elements.e

NOTE: could also show before and after screenshots of code editor with red underlines for `<flex>` and such.

Before

```tsx
<div /> // display: block;
<span /> // display: inline;
<table /> // display: table;

// :x: These don't exist (notice the red squiglies)
<flex /> // display: flex;
<grid /> // display: grid;
```

After

```tsx
<div /> // display: block;
<span /> // display: inline;
<table /> // display: table;

// :checkmark: But we can make up their existence with a Babel Transform :smile: (notice absence of red squiglies)
<flex /> // display: flex;
<grid /> // display: grid;
```

| `display` value | html      | Display Elements |
| --------------- | --------- | ---------------- |
| `block`         | `<div>`   |                  |
| `inline`        | `<span>`  |                  |
| `inline-block`  | :x:       | `<inline-block>` |
| `flex`          | :x:       | `<flex>`         |
| `inline-flex`   | :x:       | `<inline-flex>`  |
| `grid`          | :x:       |                  |
| `inline-grid`   | :x:       |                  |
| `table`         | `<table>` |                  |

Also added for convenience: `Row` and `Column`. See [The Case for Row and Col]() for more.

For convenience, we've also added `<block>` and `<inline>`, even though div and span already exist.

## Getting Started

Install...

## API

| Prop | Type                                                 | Description                                                  |
| ---- | ---------------------------------------------------- | ------------------------------------------------------------ |
| `$`  | `"div" | "aside" | "main" ...etc` (Default: `"div"`) | The html tag that this element will become (at compile time) |
| Row2 |                                                      |                                                              |

## Limitations

`$` prop is used at compile time, so it can not be a variable. I.e. you can't have a wrapper component that passes in `$={props.as}`.

## Questions/Answers

### Why Babel? Why not just make components like `<Flex>`?

1. runtime perf (I assume)
2. no import needed
3. editor treats it (and colors it) like a normal html tag, which I like.
