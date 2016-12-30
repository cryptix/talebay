
var signifier = require('../plugs').first(exports.signifier = [])
var h = require('hyperscript')

exports.needs = { signifier: 'first' }

exports.gives = {
  avatar_name: true,
  aboutself: true
}


exports.create = function (api) {

  return{
    avatar_name:  function name (id) {
      var n = h('span', id ? id.substring(0, 10) : "")

      //choose the most popular name for this person.
      //for anything like this you'll see I have used sbot.links2
      //which is the ssb-links plugin. as you'll see the query interface
      //is pretty powerful!
      //TODO: "most popular" name is easily gameable.
      //must come up with something better than this.

      api.signifier(id, function (_, names) {
        if(names.length) n.textContent = names[0].name
      })

      return n
    },

    aboutself:  function about (id) {
      var a = h('span', id.substring(0, 10))

      api.signifier(id, function (_, names) {
        if(names.length) a.textContent = names[0].about
      })

      return a
    }
  }
}


