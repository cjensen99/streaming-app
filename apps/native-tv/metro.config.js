const { createMetroConfig } = require('@app/config/metro/createMetroConfig');

// TV uses the default (TV-first) files; no platform overrides.
module.exports = createMetroConfig(__dirname);
