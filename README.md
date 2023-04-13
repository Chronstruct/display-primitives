# Display Primitives

Tasks To Do:

- [ ] Update website to use this
- [ ] Consider `<flex.row>` and `<flex.col>`
- [ ] Build new design that uses grid and an image, too
- [ ] Make importable `<Flex>` components with derived `$-` props
  - Auto-import or grobally available in tsconfig?
- [ ] Finish this readme
- [ ] Add Social Preview in Github settings
- [ ] Namespace our classnames with `dp-`?
- [ ] SWC plugin? https://swc.rs/docs/usage/plugins

## What is this?

The browser gives us `<div/>` for `display: block;` and `<span/>` for `display: inline;`, but what about the other [display](https://developer.mozilla.org/en-US/docs/Web/CSS/display) values like `flex` and `grid`? This babel transform adds these missing tags/elements.e

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

| `display=`       | html      | Display Elements |
| ---------------- | --------- | ---------------- |
| `"block"`        | `<div>`   | `<block>`        |
| `"inline"`       | `<span>`  | `<inline>`       |
| `"flex"`         | :x:       | `<flex>`         |
| `"grid"`         | :x:       | `<grid>`         |
| `"table"`        | `<table>` |                  |
| `"inline-block"` | :x:       | `<inlineblock>`  |
| `"inline-flex"`  | :x:       | `<inlineflex>`   |
| `"inline-grid"`  | :x:       | `<inlinegrid>`   |

Also added for convenience: `row` and `column`. See [The Case for Row and Col]() for more.

| css                                      | html | Display Elements |
| ---------------------------------------- | ---- | ---------------- |
| `display: flex; flex-direction: row;`    | :x:  | `<row>`          |
| `display: flex; flex-direction: column;` | :x:  | `<column>`       |

For convenience, we've also added `<block>` and `<inline>`, even though div and span already exist.

## Getting Started

Install...

## API

| Prop | Type                                                   | Description                                                  |
| ---- | ------------------------------------------------------ | ------------------------------------------------------------ |
| `$`  | `"div" \| "aside" \| "main" ...etc` (Default: `"div"`) | The html tag that this element will become (at compile time) |

## Limitations

`$` prop is used at compile time, so it can not be a variable. I.e. you can't have a wrapper component that passes in `$={props.as}`.

## Questions/Answers

### Why Babel? Why not just make components like `<Flex>`?

1. runtime perf (I assume)
2. no import needed
3. editor treats it (and colors it) like a normal html tag, which I like.
