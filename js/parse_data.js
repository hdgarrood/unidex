function parse_data(string) {
    var trie = make_trie()

    string.split("\n").forEach(function(line) {
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

    window.Unidex.trie = trie
}
