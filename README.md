# near-instant.page

> **Note** This is a slightly modified version of the [original instant.page script](https://www.npmjs.com/package/instant.page). The main differences are that configuration via `<body>` attributes has been removed and `mousedown=true` by default. 
>
> Disable preloading on individual links with `<a href="..." data-no-instant>…</a>`.

:information_source: Info is on [the website](https://instant.page).

:scroll: The original source is in [instantpage.js](https://github.com/instantpage/instant.page/blob/master/instantpage.js).

:star2: Star this repository to follow its development.

## Tests

With [Node](https://nodejs.org/), run:

`npm run test` (or `node test/app.js`)

And access http://127.0.0.1:8000/. Or specify another port with an argument after the filename.

## Minifying

To minify `instantpage.js` into `instantpage.min.js`, run `npm run minify`.
