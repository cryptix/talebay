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

function countFields(ary,field) {
  var cntMap  = {}
  ary.forEach(function(msg) {
    var c = msg.value.content
    cntMap[c.sk0rg]={
      cnt:0,
      msg: msg,
    }
  })
  ary.forEach(function(msg) {
    var c = msg.value.content
    if (typeof c[field] === "boolean") {
      cntMap[c.sk0rg].cnt = c[field] ? cntMap[c.sk0rg].cnt + 1:cntMap[c.sk0rg].cnt - 1
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
              }}
            ]}),
            pull.collect(function(err, ary) {
              if(err) {throw err; return;}

              console.dir(ary)

              skillMatching[skillID](h('span',ary.map(function(adopt) {
                return api.avatar_link(adopt.value.author, api.avatar_name(adopt.value.author))
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
