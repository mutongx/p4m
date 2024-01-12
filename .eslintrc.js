module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.js",
                "jest.config.js",
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "@stylistic",
        "@typescript-eslint"
    ],
    "rules": {
        "@stylistic/indent": [
            "error",
            4
        ],
        "@stylistic/linebreak-style": [
            "error",
            "unix"
        ],
        "@stylistic/quotes": [
            "error",
            "double"
        ],
        "@stylistic/semi": [
            "error",
            "always"
        ]
    }
};
