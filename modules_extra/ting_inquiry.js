var h = require('hyperscript')
var obs = require('observable')
var u = require('../util')
var pull = require('pull-stream')

//render a message when someone follows someone,
//so you see new users

exports.needs = {
  avatar_name: 'first',
  avatar_link: 'first',
  sbot_get: 'first',
  sbot_query: 'first',
  markdown: 'first',
}

exports.gives = {
  message_content: true,
}

// similar to avatar-profile/countFields
function groupByNameAndCount(ary) {
  var cntMap  = {}
  ary.forEach(function(msg) {
    cntMap[msg.author]=0
  })
  ary.forEach(function(msg) {
    if (typeof msg.adopted === "boolean") {
      cntMap[msg.author] = msg.adopted ? cntMap[msg.author] + 1: cntMap[msg.author] - 1
    }
  })
  return cntMap
}

exports.create = function (api) {

  return {
    message_content: function (msg) {
      var c = msg.value.content
      if(c.type === 'ting-inquiry') {
        var positions_el = h('ul')


        var skillMatching = {}
        c.skills.forEach(function(skillID) {


          skillMatching[skillID] = obs()

          pull(
            api.sbot_query({query: [
              {"$filter": {
                "value":{
                  "content": {
                    "type":"ting-adopt",
                    "skill":skillID,
                    "inquiry": msg.key,
                  }
                }
              }},
              {"$map":{
                "author": ["value", "author"],
                "adopted": ["value", "content","adopted"]
              }}
            ]}),
            pull.collect(function(err, ary) {
              if(err) {throw err; return;}
              var grouped = groupByNameAndCount(ary)
              skillMatching[skillID](h('span', Object.keys(grouped).map(function(author) {
                if (grouped[author] > 0) {
                  return api.avatar_link(author, api.avatar_name(author))
                }
              })))
            })
          )

          api.sbot_get(skillID, function(err, skMsg) {
            if(err) { throw err; return}
            positions_el.appendChild(h('li', skMsg.content.name, skillMatching[skillID]))
          })
        });

        return h('div.inquiry',
          h('h1', c.title),
          h('strong','Hat: ',api.avatar_link(c.hat, api.avatar_name(c.hat))),
          h('p', api.markdown(c.text)),
          h('strong', 'skills needed:'),
          positions_el
          // TODO: location
        )
      }
    }

  }
}
