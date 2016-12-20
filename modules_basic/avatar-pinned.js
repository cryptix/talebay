var h = require('hyperscript')
var obs = require('observable')
var pull = require('pull-stream')

exports.needs = {
  message_render: 'first',
  sbot_get: 'first',
  sbot_query: 'first'
}

exports.gives = {
  avatar_pinned: true
}

exports.create = function (api) {
  return {
    avatar_pinned: function (id) {
      var el = obs()
      pull(
        api.sbot_query({query: [
          {"$filter": { "value":{
            "author": id,
            "content": { "type":"about",
              "pinnedPost":{"$prefix":"%"}
            }
          }}}
        ], reverse: true, limit: 1}), // TOOD: "... older pins?"
        pull.collect(function(err, msgs) {
          if (err) throw err
          if (msgs.length > 0) {
            api.sbot_get(msgs[0].value.content.pinnedPost, function(err, msg) {
              if (err) throw err
              // TODO: dirty hack..
              // somehow message_render doesn't play nice with sbot_get..?
              var m = {}
              m.value = msg
              el(api.message_render(m))
            })
          }
        })
      )
      return el
    }
  }
}
