A xbar plugin to show nordpool energy prices.

![Screenshot](/screenshot_1.png "Screenshot")

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

# Settings

- `THRESHOLD` The value under which the energy price is considered affordable. (Default: 8c/kWh)
- `COUNTRY` The country code for the market. (Default: FI)
