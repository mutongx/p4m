/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parser: require("@typescript-eslint/parser"),
        },
        ...require("@stylistic/eslint-plugin").configs.customize({
            indent: 4,
            quotes: "double",
            semi: true,
            jsx: true,
            arrowParens: true,
            braceStyle: "1tbs",
            blockSpacing: true,
            quoteProps: "consistent",
            commaDangle: "always-multiline",
        }),
    },
];
