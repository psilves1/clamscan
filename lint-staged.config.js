module.exports = {
    '**/*.json': ['prettier --write', 'git add'],
    '**/*.md': ['prettier --write', 'git add'],
    '**/*.js': ['prettier --write', 'git add'],
    '**/*.yaml': ['prettier --write', 'git add'],
};
