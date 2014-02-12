(function(global) {
    var Unidex = {}
    global.Unidex = Unidex

    function existy(x) {
        return x != null
    }

    function truthy(x) {
        return existy(x) && x
    }

    // **** DATA STRUCTURE ****
    // Creates a new trie.
    Unidex.make_trie = make_trie = function make_trie() {
        function setValue(obj, value) {
            obj['_$'] = value
        }

        function getValue(obj) {
            return obj['_$']
        }

        function hasValue(obj) {
            return existy(getValue(obj))
        }

        function isLeaf(obj) {
            return _.keys(obj).length === 1
        }

        function obj_insert(obj, key, value) {
            insert(obj, key.split(""), value)
        }

        function insert(obj, keyarr, value) {
            if (keyarr.length === 0) {
                setValue(obj, value)
            } else {
                var key = keyarr[0]
                if (!existy(obj[key])) obj[key] = {}
                insert(obj[key], keyarr.slice(1), value)
            }
        }

        function obj_retrieve(obj, key) {
            return retrieve(obj, key.split(""))
        }

        function retrieve(obj, keyarr) {
            if (!existy(obj))
                return null;

            if (keyarr.length === 0) {
                if (hasValue(obj))
                    return getValue(obj)
                else
                    return null;
            } else {
                var key = keyarr[0]
                return retrieve(obj[key], keyarr.slice(1))
            }
        }

        function obj_size(obj) {
            var total = 0
            _.keys(obj).forEach(function(key) {
                if (hasValue(obj[key]))
                    total += 1

                total += obj_size(obj[key])
            })
            return total
        }

        return {
            insert: function(key, value) {
                obj_insert(this.data, key, value)
            },

            retrieve: function(key) {
                return obj_retrieve(this.data, key)
            },

            size: function() {
                return obj_size(this.data)
            },

            data: { },
        }
    }

    // **** INITIALISATION ****
    // This should be called to initialise the data. Pass as the argument a
    // string containing all the data, in a 2 column CSV format: codepoint
    // (hex), English name. Optionally pass a callback, to be fired after
    // initialistation.
    Unidex.init = function init(string_data, callback) {
        var trie = make_trie()
        Unidex.trie = trie

        string_data.split("\n").forEach(function(line) {
            if (line === "") return;

            var codepointArr = line.split(","),
                codepoint = toCodepoint(codepointArr),
                words = codepoint.name.split(" ")

            words.forEach(function(word) {
                var result = trie.retrieve(word)

                if (existy(result)) {
                    result.push(codepointArr)
                } else {
                    trie.insert(word, [codepointArr])
                }
            })
        })

        if (existy(callback))
            callback()
    }

    Unidex.init_from_path = function init_from_path(path, callback) {
        var req = new XMLHttpRequest()

        req.overrideMimeType('text/plain')
        req.onload = function() { Unidex.init(this.responseText, callback) }
        req.open('GET', 'data/ExtractedData.csv')
        req.send()
    }

    // **** QUERYING ****
    function intersection(arr) {
        return _.intersection.apply(this, arr)
    }

    function union(arr) {
        return _.union.apply(this, arr)
    }

    function toCodepoint(arr) {
        return { name: arr[0], hexcode: arr[1] }
    }

    // Take a list of words, return a list of possible matches. Best first.
    Unidex.query = function query(words) {
        var result_sets = _.map(words, function(word) {
                return _.map(Unidex.trie.retrieve(word.toUpperCase()) || [],
                    toCodepoint)
            }),
            best_results = intersection(result_sets)

        if (best_results.length > 0) {
            return best_results
        } else {
            return union(result_sets)
        }
    }

    // **** RESULT RANKING ****
    // Each ranking mechanism is an object of two attributes:
    //   weight: How good this mechanism is for determining a good result.
    //           Higher is better.
    //   call: A function : (Codepoint, QueryWordList) -> [0,1]
    var ranking_mechanisms = {
        proportion_of_matched_words: {
            weight: 5,
            call: function(codepoint, words) {
            }
        }
    }

    // Given one codepoint from a query, give it a score for how well it
    // matches the query. Used to determine order of results.
    function rank(codepoint, query) {
    }

    // **** UI ****
    function displayResults(resultsElem, results) {
        removeAllChildNodes(resultsElem)
        var rows = _.map(results, toResultRow)
        rows.forEach(function(row) {
            if (existy(row))
                resultsElem.appendChild(row)
        })
    }

    function removeAllChildNodes(elem) {
        while (elem.hasChildNodes())
            elem.removeChild(elem.lastChild)
    }

    // Change a codepoint object into a HTMLTableRow element containing
    // information about it.
    function toResultRow(codepoint) {
        if (!existy(codepoint))
            return null;

       var char_name = codepoint[0],
           char_hex  = codepoint[1]

       var row = document.createElement('tr')

       var name_cell = document.createElement('td')
       var name_cell_text = document.createTextNode(char_name)
       name_cell.appendChild(name_cell_text)

       var char_cell = document.createElement('td')
       var char_cell_text = document.createTextNode(
                                String.fromCodePoint(parseInt(char_hex, 16)))
       char_cell.appendChild(char_cell_text)

       var hexcode_cell = document.createElement('td')
       var hexcode_cell_text = document.createTextNode("U+" + char_hex)
       hexcode_cell.appendChild(hexcode_cell_text)

       row.appendChild(name_cell)
       row.appendChild(char_cell)
       row.appendChild(hexcode_cell)
       return row
    }

    Unidex.attach = function attach(inputElem, resultsElem) {
        inputElem.addEventListener('keyup', function(e) {
            var results = Unidex.query(inputElem.value.split(" "))
            displayResults(resultsElem, results)
        })
    }
})(this);
