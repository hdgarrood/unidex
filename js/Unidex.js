(function(global) {
    var Unidex = {}
    global.Unidex = Unidex

    // **** DATA STRUCTURE ****
    // Creates a new trie.
    Unidex.make_trie = make_trie = function make_trie() {
        function obj_insert(obj, key, value) {
            insert(obj, key.split(""), value)
        }

        function insert(obj, keyarr, value) {
            var key = keyarr[0]
            if (keyarr.length === 1) {
                obj[key] = { 'value': value }
            } else {
                if (obj[key] == null)
                    obj[key] = {}
                insert(obj[key], keyarr.slice(1), value)
            }
        }

        function obj_retrieve(obj, key) {
            return retrieve(obj, key.split(""))
        }

        function hasValue(obj) {
            return obj.value != undefined
        }

        function isLeaf(obj) {
            return _.keys(obj).length === 1
        }

        function retrieve(obj, keyarr) {
            if (obj == undefined)
                return null;

            if (keyarr.length === 0) {
                if (isLeaf(obj))
                    return obj.value;
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
    // (hex), English name.
    Unidex.init = function init(string_data) {
        var trie = make_trie()
        Unidex.trie = trie

        string_data.split("\n").forEach(function(line) {
            if (line === "") return;

            var arr = line.split(","),
                codepoint_hex = arr[0],
                codepoint_name = arr[1],
                // this goes into the trie.
                codepoint = { name: codepoint_name, hex: codepoint_hex },
                words = codepoint_name.split(" ")

            words.forEach(function(word) {
                var existing = trie.retrieve(word)

                if (existing == undefined) {
                    trie.insert(word, [codepoint])
                } else {
                    existing.push(codepoint)
                }
            })
        })
    }

    // **** QUERYING ****
    function intersection(arr) {
        return _.intersection.apply(this, arr)
    }

    function union(arr) {
        return _.union.apply(this, arr)
    }

    // Take a list of words, return a list of possible matches. Best first.
    Unidex.query = function query(words) {
        var result_sets = _.map(words, function(word) {
                return Unidex.trie.retrieve(word.toUpperCase())
            }),
            best_results = intersection(result_sets)

        if (best_results.length > 0) {
            return best_results
        } else {
            return union(result_sets)
        }
    }

    // **** UI ****
    function displayResults(resultsElem, results) {
        removeAllChildNodes(resultsElem)
        var rows = _.map(results, toResultRow)
        rows.forEach(function(row) {
            if (row != null)
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
        if (codepoint == null)
            return null;

       var row = document.createElement('tr')

       var name_cell = document.createElement('td')
       var name_cell_text = document.createTextNode(codepoint.name)
       name_cell.appendChild(name_cell_text)

       var char_cell = document.createElement('td')
       var char_cell_text = document.createTextNode(
                                String.fromCodePoint(parseInt(codepoint.hex, 16)))
       char_cell.appendChild(char_cell_text)

       var hexcode_cell = document.createElement('td')
       var hexcode_cell_text = document.createTextNode("U+" + codepoint.hex)
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
