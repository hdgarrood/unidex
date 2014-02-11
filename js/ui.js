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
    removeAllChildNodes(resultsElem);
    var rows = _.map(results, toResultRow)
    rows.forEach(function(row) { resultsElem.innerHtml += row })
}

function removeAllChildNodes(elem) {
    while (elem.hasChildNodes())
        elem.removeChild(elem.lastChild)
}

function toResultRow(codepoint) {

}

var inputElem = document.getElementById('input')
inputElem.addEventListener('keyup', function(e) {

})
