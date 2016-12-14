var h = require('hyperscript')
var u = require('../util')
var pull = require('pull-stream')

//render a message when someone follows someone,
//so you see new users

exports.needs = {
  markdown: 'first',
}

exports.gives = {
  message_content: true,
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
  }
  }


}
