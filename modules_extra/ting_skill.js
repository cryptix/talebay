var h = require('hyperscript')
var u = require('../util')
var pull = require('pull-stream')
var obs = require('observable')

exports.needs = {
  markdown: 'first',
  ting_myskills: 'first',
  message_confirm:'first'
}

exports.gives = {
  message_content: true,
  message_action: true,
}

exports.create = function (api) {

  var self_id = require('../keys').id

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
        var unAdopt = obs('Adopt')
        var postVal = true

        api.ting_myskills(self_id, function(err, mySkills) {
          if(err) {throw err; return }
          mySkills = mySkills.map(function(msg) { return msg.value.content.sk0rg })

          if (mySkills.indexOf(msg.key) >= 0) {
            unAdopt("Unadopt")
            postVal = false
          }
        })


        var a = h('a', {href: '#', onclick: function (e) {
          e.preventDefault()
          api.message_confirm({
            "type": 'about', "about": self_id,
            "sk0rg":msg.key, "adopted": postVal,
          }, function (err, msg) {
            if(err) return alert(err)
            if(!msg) return
          })
        }}, unAdopt)
        return  a
      }
    }
  }
}
