var h = require('hyperscript')
var u = require('../util')
var pull = require('pull-stream')
var obs = require('observable')

exports.needs = {
  message_link:'first'
}

exports.gives = {
  message_content: true
}

exports.create = function (api) {


  return {
    message_content: function (msg) {
      var c = msg.value.content
      if(c.type !== 'ting-edit') return

      return h('div',
        h('h1', 'edited the description of ', api.message_link(c.inquiry))
      )
    }
  }
}
