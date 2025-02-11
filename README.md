# Image to Ansi
Converts any image file into Ansi

## instructions
clone this repository, run `npm i --force` and then call index.js as `node index.js file_path [ rescale_width [ "x" rescale_height ] ]` where
- `file_path` is the path to the image you wish to convert.
- `rescale_width` is an optional property setting what the image width (in characters) will be scaled to.
- `rescale_height` is an optional property (must be prepended with rescale_width) setting what the image height (in characters) will be.
- `"x"` is the character `x`.

to change the colors used by the converter run `node generator.js` or copy the code between the two comments and paste into a browser to get the raw string. when running in node it will output the current terminals color table (left) and the colors from the given `colors.png` file (right) then write to the file `colors.json` a json array of pairs with the rgb color code from `colors.png` and the ansi escape code for generating that color.