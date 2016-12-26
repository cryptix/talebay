
var h = require('hyperscript')
var u = require('../util')
var pull = require('pull-stream')
var obs = require('observable')

exports.needs = {
  markdown: 'first',
  message_link:'first'
}

exports.gives = {
  message_content: true
}

exports.create = function (api) {


  return {
    message_content: function (msg) {
      var c = msg.value.content
      if(c.type === 'ting-adopt') {
        var pos = obs()
        if (c.skill) {
          pos(api.message_link(c.skill))
        }

        if (c.hat) {
          pos("teh hat")
        }

        return h('div',
          h('h1', c.adopted ? 'adopted ': 'left ', pos, ' of ', api.message_link(c.inquiry))
        )
      }
    }
  }
}
