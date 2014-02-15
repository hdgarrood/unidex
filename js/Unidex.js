(function(global) {
    "use strict";

    var Unidex = {}
    Unidex.internal = {}
    global.Unidex = Unidex

    function existy(x) {
        return x != null
    }

    // **** DATA STRUCTURE ****
    // Creates a new trie.
    var makeTrie = Unidex.internal.makeTrie = function makeTrie() {
        var valueKey = '_$'

        function setValue(obj, value) {
            obj[valueKey] = value
        }

        function getValue(obj) {
            return obj[valueKey]
        }

        function children(obj) {
            var allKeys = _.keys(obj),
                index = allKeys.indexOf(valueKey)

            if (index >= 0)
                allKeys.splice(index, 1)

            return allKeys
        }

        function hasValue(obj) {
            return existy(getValue(obj))
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

        function obj_traverse(obj, cb) {
            var result = _.find(children(obj), function(key) {
                if (hasValue(obj[key])) {
                    if (cb(obj[key]) === false)
                        return true // break
                }

                obj_traverse(obj[key], cb)
            })

            return (existy(result) ? true : undefined)
        }

        return {
            insert: function(key, value) {
                obj_insert(this.data, key, value)
            },

            retrieve: function(key) {
                return obj_retrieve(this.data, key)
            },

            // Iterate over the whole structure with a callback, calling
            // the callback once for each value in the trie.
            //
            // If the callback returns false, stop traversing.
            traverse: function(cb) {
                obj_traverse(this.data, cb)
            },

            size: function() {
                var total = 0;
                this.traverse(function(val) {
                    total += 1
                })
                return total
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
        var trie = makeTrie()
        Unidex.internal.trie = trie

        string_data.split("\n").forEach(function(line) {
            if (line === "") return;

            var codepointArr = line.split("\t"),
                codepoint = toCodepoint(codepointArr),
                words = codepoint.name.split(" ")

            words.forEach(function(word) {
                var upcaseWord = word.toUpperCase(),
                    result = trie.retrieve(upcaseWord)

                if (existy(result)) {
                    result.push(codepointArr)
                } else {
                    trie.insert(upcaseWord, [codepointArr])
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
        req.open('GET', path)
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
        return { hexcode: arr[0], name: arr[1] }
    }

    // Take a list of words, return a list of possible matches. Best first.
    Unidex.query = function query(words) {
        var result_sets = _.map(words, function(word) {
                return _.map(
                    Unidex.internal.trie.retrieve(word.toUpperCase()) || [],
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
                var codepoint_words = codepoint.name.split(" "),
                    matched_words = _.filter(words, function(w) {
                        return _.contains(codepoint_words, w)
                    })
                return matched_words.length / codepoint_words.length
            }
        }
    }

    // Given one codepoint from a query, give it a score for how well it
    // matches the query. Used to determine order of results.
    function rank(codepoint, words) {
        return ranking_mechanisms.proportion_of_matched_words
            .call(codepoint, words)
    }

    // **** UI ****
    var displayResults = Unidex.internal.displayResults =
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
    var toResultRow = Unidex.internal.toResultRow =
    function toResultRow(codepoint) {
        if (!existy(codepoint))
            return null;

       var row = document.createElement('tr')

       var name_cell = document.createElement('td')
       var name_cell_text = document.createTextNode(codepoint.name)
       name_cell.appendChild(name_cell_text)

       var char_cell = document.createElement('td')
       var char_cell_text = document.createTextNode(
            String.fromCodePoint(parseInt(codepoint.hexcode, 16)))
       char_cell.appendChild(char_cell_text)

       var hexcode_cell = document.createElement('td')
       var hexcode_cell_text = document.createTextNode(
            "U+" + codepoint.hexcode)
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
