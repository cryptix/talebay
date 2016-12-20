var h = require('hyperscript')
var u = require('../util')
var pull = require('pull-stream')

exports.needs = { markdown: 'first' }

exports.gives = {
  message_content: true,
  message_action: true,
}

exports.create = function (api) {

  return {
    message_content: function (msg) {
      var c = msg.value.content
      if(c.type === 'sk0rg') {
        return h('div.sk0rg',
          h('h1', c.name),
          h('p', api.markdown(c.text))
        )
      }
    },

    message_action: function (msg) {
      if (msg.value.content.type === 'sk0rg') {
        var a = h('a', {href: '#', onclick: function (e) {
          e.preventDefault()
          // TODO: confirm adopt
        }}, "Adopt")
        return  a
      }
    }
  }
}
