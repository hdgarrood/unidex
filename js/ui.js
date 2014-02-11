function intersection(arr) {
    return _.intersection.apply(this, arr)
}

function union(arr) {
    return _.union.apply(this, arr)
}

// Take a list of words, return a list of possible matches. Best first.
window.Unidex.query = function query(words) {
    var result_sets = _.map(words, function(word) {
            return Unidex.trie.retrieve(word.toUpperCase())
        }),
        best_results = intersection(result_sets),
        other_results = _.difference(union(result_sets), best_results)

    return _.uniq(best_results.concat(other_results))
}


var resultsElem = document.getElementById('results')
function displayResults(results) {
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

function toResultRow(codepoint) {
    if (codepoint == null)
        return null;

   var row = document.createElement('tr')

   var name_cell = document.createElement('td')
   var name_cell_text = document.createTextNode(codepoint.name)
   name_cell.appendChild(name_cell_text)
   
   var char_cell = document.createElement('td')
   var char_cell_text = document.createTextNode("&#" + codepoint.hex + ";")
   char_cell.appendChild(char_cell_text)

   var hexcode_cell = document.createElement('td')
   var hexcode_cell_text = document.createTextNode(codepoint.hex)
   hexcode_cell.appendChild(hexcode_cell_text)

   row.appendChild(name_cell)
   row.appendChild(char_cell)
   row.appendChild(hexcode_cell)
   return row;
}

var inputElem = document.getElementById('input')
inputElem.addEventListener('keyup', function(e) {
    var results = Unidex.query(inputElem.value.split(" "))
    displayResults(results)
})
