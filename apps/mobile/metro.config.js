const { createMetroConfig } = require('@app/config/metro/createMetroConfig');

// Phone overrides: `Foo.mobile.tsx` wins over the TV-first `Foo.tsx` in this app only.
module.exports = createMetroConfig(__dirname, { platformExtensions: ['mobile'] });
