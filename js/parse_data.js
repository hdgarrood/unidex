function parse_data(string) {
    var trie = make_trie()

    string.split("\n").forEach(function(line) {
        if (line === "") return;

        var arr = line.split(","),
            codepoint_value = arr[0],
            codepoint_name = arr[1],
            words = codepoint_name.split(" ")

        words.forEach(function(word) {
            var existing = trie.retrieve(word, codepoint_value)

            if (existing == undefined) {
                trie.insert(word, [codepoint_value])
            } else {
                existing.push(codepoint_value)
            }
        })
    })

    window.Unidex.trie = trie
}
