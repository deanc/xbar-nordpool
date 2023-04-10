A xbar plugin to show nordpool energy prices for the Finnish market.

![Screenshot](/screenshot.png?raw=true "Screenshot")

# Setup

1. Clone the repo
2. `yarn` in the project root
3. Make sure the `nordpool.30m.js` file is executable (`chmod + x nordpool.30m.js`)
4. Symlink it:

```
// MacOS
ln -s /path/to/repo/nordpool.30m.js ~/Library/Application Support/xbar/plugins/nordpool.30m.js
```

5. If you want to run it more or less often just change the `30m` to `1d` for example in the symlink to run it once a day.

# Tweak

The threshold is hardcoded to 8c/kWh at the moment. You can edit the file as you see fit.

# Future enhancements and wishes

- Add a submenu "Tomorrow" as the first item and show tomorrow's data
  if possible to get with the plugin we're pulling the data from.
