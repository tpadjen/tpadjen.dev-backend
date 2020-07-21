module.exports = {
  'env': {
    'commonjs': true,
    'es2020': true,
    'node': true,
    'jest': true,
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'ecmaVersion': 11
  },
  'rules': {
    'indent': [
      'error',
      2,
      { 'SwitchCase': 1 }
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single',
      { 'avoidEscape': true }
    ],
    'semi': [
      'error',
      'never'
    ],
    'no-unused-vars': ['warn', { 'args': 'all', 'argsIgnorePattern': '^_' }],
    'eqeqeq': 'error',
    'arrow-spacing': [
      'error', { 'before': true, 'after': true }
    ],
    'no-console': 0
  }
}
