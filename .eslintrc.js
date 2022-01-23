module.exports = {
    env: {
        browser: true,
        es2021: true,
        jest: true,
        es6: true,
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        // "plugin:@typescript-eslint/recommended",
        "plugin:react-hooks/recommended",
        "prettier",
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 13,
        "sourceType": "module"
    },
    // "parser": "@typescript-eslint/parser",
    // "parserOptions": {
    //     "ecmaFeatures": {
    //         "jsx": true
    //     },
    //     "ecmaVersion": 13,
    //     "sourceType": "module"
    // },
    "plugins": [
        "react",
        //"@typescript-eslint"
    ],
    "rules": {
        "no-unused-vars": [1, { "vars": "all", "args": "after-used", "ignoreRestSiblings": true }],
        "react/prop-types": "off",
    },
    "overrides": [
        {
            "files": ["**/*.{ts,tsx}"],
            "plugins": [
                "react",
                "@typescript-eslint"
            ],
            "extends": [
                "eslint:recommended",
                "plugin:react/recommended",
                "plugin:@typescript-eslint/recommended",
                "plugin:react-hooks/recommended",
                "prettier",
            ],
            "parser": "@typescript-eslint/parser",
            "parserOptions": {
                "ecmaFeatures": {
                    "jsx": true
                },
                "ecmaVersion": 13,
                "sourceType": "module"
            },
            "rules": {
                "@typescript-eslint/no-unused-vars": [1, { "vars": "all", "args": "after-used", "ignoreRestSiblings": true }],
                "react/prop-types": "off",
            },
        }

    ]
};
