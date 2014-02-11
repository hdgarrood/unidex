function make_trie() {
    function insert_to_obj(obj, key, value) {
        insert(obj, key.split(""), value)
    }

    function insert(obj, keyarr, value) {
        var key = keyarr[0]
        if (keyarr.length === 1) {
            obj[key] = { 'end': true, 'value': value }
        } else {
            if (obj[key] == null)
                obj[key] = {}
            insert(obj[key], keyarr.slice(1), value)
        }
    }

    function retrieve_from_obj(obj, key) {
        return retrieve(obj, key.split(""))
    }

    function retrieve(obj, keyarr) {
        if (obj == undefined)
            return null;

        if (keyarr.length === 0) {
            if (obj.end === true)
                return obj.value;
            else
                return null;
        } else {
            var key = keyarr[0]
            return retrieve(obj[key], keyarr.slice(1))
        }
    }

    return {
        insert: function(key, value) {
            insert_to_obj(this.data, key, value)
        },

        retrieve: function(key) {
            return retrieve_from_obj(this.data, key)
        },

        data: { },
    }
}
