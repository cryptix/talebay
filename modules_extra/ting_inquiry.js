var h = require('hyperscript')
var obs = require('observable')
var u = require('../util')
var pull = require('pull-stream')

exports.needs = {
  avatar_name: 'first',
  avatar_link: 'first',
  sbot_get: 'first',
  sbot_query: 'first',
  markdown: 'first',
  message_compose: 'first',
  message_confirm: 'first',
  ting_myskills: 'first',
  ting_inquiry_adopted: 'first'
}

exports.gives = { message_content: true }

exports.create = function (api) {

  var self_id = require("../keys").id

  return {
    message_content: function (msg) {
      var c = msg.value.content
      if(c.type === 'ting-inquiry') {
        var positions_el = h('div.inquiry_skills.float')

        var skillMatching = {}
        var currDescr = c.text
        var mdDescr = obs(api.markdown(currDescr))

        // convoluted - load text edits
        pull(
          api.sbot_query({query:[
            {"$filter": { "value": {
              "author": msg.value.author,
              "content": {
                "type":"ting-edit",
                "inquiry": msg.key
              }
            }}},
          ], "reverse": true, limit:1}),
          pull.drain(function (update) {
            currDescr = update.value.content.text
            mdDescr(api.markdown(update.value.content))
          })
        )

        // terribly convoluted - load (matching) skills
        api.ting_myskills(self_id, function(err, mySkills) {
          if(err) { throw err; return}
          mySkills = mySkills.map(function(msg) { return msg.value.content.sk0rg })

          c.skills.forEach(function(skillID) {
            skillMatching[skillID] = obs()
            api.ting_inquiry_adopted(msg.key, skillID, function(err, grouped) {
              skillMatching[skillID](h('div',
                Object.keys(grouped).map(function(author) {
                  if (grouped[author] > 0) {
                    var el = h("div.skill_object_inline.float", api.avatar_link(author, api.avatar_name(author)))
                    if (author == self_id) {
                      el.appendChild( h("a",{href:"#", onclick: function(ev) {
                        ev.preventDefault()
                        api.message_confirm({
                          "type": 'ting-adopt', "adopted": false,
                          "skill": skillID, "inquiry": msg.key,
                        }, function (err, msg) {
                          if(err) {throw err; return}
                          if(!msg) return
                        })
                      }}, " (-)"))
                    }
                    return el
                  }
                })
              ))
            })


            // adopt skills buttons
            api.sbot_get(skillID, function(err, skMsg) {
              if(err) { throw err; return}
              positions_el.appendChild(h('div.skill_object.float',
                 skMsg.content.name,
                (mySkills.indexOf(skillID) >= 0) ?
                  h("a",{href:"#", onclick: function(ev) {
                    ev.preventDefault()
                    api.message_confirm({
                      "type": 'ting-adopt', "adopted": true,
                      "skill": skillID, "inquiry": msg.key,
                    }, function (err, msg) {
                      if(err) {throw err; return}
                      if(!msg) return
                    })
                  }}, " (+)") : null,
                
                skillMatching[skillID]
              ))
            })
          })
        });

        pull(
          api.sbot_query({query: [
            {"$filter": {
              "value":{
                "content": {
                  "type":"ting-adopt",
                  "hat": {$prefix: '@'},
                  "inquiry": msg.key,
                }
              }
            }}
          ]}),
          pull.drain(function(msg) {
            lateHat(api.avatar_link(msg.value.author, api.avatar_name(msg.value.author)))
          })
        )
        var lateHat = obs(h("a",{href:"#", onclick: function(ev) {
          ev.preventDefault()
          api.message_confirm({
            "type": 'ting-adopt', "adopted": true,
            "hat": self_id, "inquiry": msg.key,
          }, function (err, msg) {
            if(err) {throw err; return}
            if(!msg) return
          })
        }}, "(Take it!)"))
        var el = h('div.inquiry',
          h('strong', 'description'),
          (self_id === msg.value.author) ? h('a', {href:"#", onclick: function(e) {
            e.preventDefault()

            mdDescr(api.message_compose(
              { type:"ting-edit", "inquiry": msg.key },
              { value: currDescr },
              function(err, msg) {
                if (err) throw err
                currDescr = msg.value.content.text
                mdDescr(api.markdown(msg.value.content))
              })
            )
          }}, "(edit)") : null,
          mdDescr,
          h('strong','Hat: ', c.hat ? api.avatar_link(c.hat, api.avatar_name(c.hat)) : lateHat),
          h('br'),
          h('div.profile_headline_short', 'skills needed:'),
          positions_el
        )
          /* TODO for v1.5: missing picker and queries..
        if (c.location && c.location.length == 4){
          el.appendChild( h('strong', 'location:'))
          el.appendChild( h("iframe", {
            "style": "width:100%",
            "frameborder":"0",
            "scrolling":"no",
            "src":"http://www.openstreetmap.org/export/embed.html?layer=mapnik&bbox="+encodeURIComponent(c.location.join(","))}))
        }
        */

        return el
      }
    }

  }
}
