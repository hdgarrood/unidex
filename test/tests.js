var testData =
    [ "2203\tTHERE EXISTS"
    , "2204\tTHERE DOES NOT EXIST"
    , "1F431\tCAT FACE"
    , "0000\t<control>"
    ],
    testDataString = testData.join("\n")

Unidex.init(testDataString, function() {
    // tries
    test('trie insertion', function() {
        var trie = make_trie()
        trie.insert('hello', 5)

        var result = trie.retrieve('hello')

        strictEqual(result, 5, 'correct value retrieved')
    })

    test('trie size', function() {
        var trie = make_trie()
        trie.insert('lol', 3)
        trie.insert('lols', 6)
        trie.insert('hello', 12)

        strictEqual(trie.size(), 3, 'trie reports correct size')
    })

    test('trie traversal can abort early', function() {
        // Retrieves N values from the trie and then stops
        var retrieve = function(opts) {
            var max     = opts.max,
                results = opts.into,
                counter = 0
            return function(val) {
                counter++
                if (counter === max)
                    return false
                results.push(val)
            }
        }
        
        var trie = make_trie()
        trie.insert('lol', 3)
        trie.insert('lols', 6)
        trie.insert('hello', 12)

        var results = []
        trie.traverse(retrieve({max: 2, into: results}))

        strictEqual(results.length, 2,
            'traversal should abort early if callback returns true')
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

    test('querying', function() {
        var results = Unidex.query(['cat', 'face'])

        ok(results.length >= 1, 'should have at least one result')
        strictEqual(results[0].hexcode, '1F431', 'first result should be cat face')
    })

    test('creating result rows', function() {
        var catFace = Unidex.query(['cat', 'face'])[0]
        var row = Unidex.internal.toResultRow(catFace)

        ok(row instanceof HTMLTableRowElement, 'should return a <tr> element')
    })

    test('displaying results', function() {
        var resultsElem = document.createElement('table')
        resultsElem.id = 'results'
        var results = [ { name: 'cat face', hexcode: '1F431' }
                      , { name: 'dizzy face', hexcode: '1F635' }
                      ]

        displayResults(resultsElem, results)
        var immediateChildren = resultsElem.getElementsByTagName('tr')

        strictEqual(immediateChildren.length, results.length,
            'should have one result row for each result')
    })

    test('can search for chars with lowercase names', function() {
        var results = Unidex.query(['<control>'])

        ok(results.length >= 1, 'should have at least one result')
        strictEqual(results[0].hexcode, '0000', 'first result should be NUL')
    })
})
