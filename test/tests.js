// tries
test('trie insertion', function() {
    var trie = make_trie()
    trie.insert('hello', 5)

    var result = trie.retrieve('hello')

    strictEqual(result, 5, 'correct value retrieved')
})

test('trie counting', function() {
    var trie = make_trie()
    trie.insert('lol', 3)
    trie.insert('lols', 6)
    trie.insert('hello', 12)

    strictEqual(trie.size(), 3, 'trie reports correct size')
})

test('no trie clobbering forwards', function() {
    var trie = make_trie()
    trie.insert('lol', 62)
    trie.insert('lols', 63)

    strictEqual(trie.retrieve('lol'), 62, 'retrieves correct value')
    strictEqual(trie.retrieve('lols'), 63, 'retrieves correct value')
})

test('no trie clobbering backwards', function() {
    var trie = make_trie()
    trie.insert('lols', 63)
    trie.insert('lol', 62)

    strictEqual(trie.retrieve('lols'), 63, 'retrieves correct value')
    strictEqual(trie.retrieve('lol'), 62, 'retrieves correct value')
})
