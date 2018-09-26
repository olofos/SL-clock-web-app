module.exports = {
    "extends": "airbnb-base",
    "env": {
        "browser": true,
        "node": true,
    },
    "rules" : {
        "indent" : ["error" , 4],
        "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
        "no-console": "off",

        "no-restricted-syntax": ["error", "ForInStatement", "LabeledStatement", "WithStatement"],
    },

    "parser": "babel-eslint",
    "parserOptions": {
        "sourceType": "module",
        "allowImportExportEverywhere": true
    }
}
