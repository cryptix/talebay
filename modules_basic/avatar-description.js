var h = require('hyperscript')
var obs = require('observable')
var pull = require('pull-stream')

exports.needs = {
  markdown:'first',
  message_compose: 'first',
  message_render: 'first',
  sbot_query: 'first'
}

exports.gives = {
  avatar_description: true
}

exports.create = function (api) {
  return {
    avatar_description: function (id) {
      var md= obs()
      var curr
      pull(
        api.sbot_query({query: [
          {"$filter": { "value":{
            "author": id,
            "content": { "type":"about",
              "description":{"$prefix":""}
            }
          }}}
        ], reverse: true, limit: 1}), // TOOD: "... older pins?"
        pull.collect(function(err, msgs) {
          if (err) throw err
          if (msgs.length > 0) {
            curr = msgs[0].value.content.description
            md(api.markdown(curr))
          }
        })
      )
      var self_id = require("../keys").id
      return h("div",
        h('strong', 'description',
        (self_id === id) ? h('a', {href:"#", onclick: function(e) {
          e.preventDefault()

          md(api.message_compose(
            {type:"about"},
            {
              value: curr,
              prepublish: function(val) {
                var t = val.text
                val.description=t
                delete val.text
                return val
              },
            },
            function(err, msg) {
              if (err) throw err
              curr = msg.value.content.description
              md(api.markdown(curr))
            })

          )
        }}, " (edit)") : null),
        md)
    }
  }
}
