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
        var positions_el = h('ul')

        var skillMatching = {}

        // terribly convoluted
        api.ting_myskills(self_id, function(err, mySkills) {
          if(err) { throw err; return}
          mySkills = mySkills.map(function(msg) { return msg.value.content.sk0rg })

          c.skills.forEach(function(skillID) {
            skillMatching[skillID] = obs()
            api.ting_inquiry_adopted(msg.key, skillID, function(err, grouped) {
              skillMatching[skillID](h('span',
                Object.keys(grouped).map(function(author) {
                  if (grouped[author] > 0) {
                    var el = h("span", api.avatar_link(author, api.avatar_name(author)))
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
                      }}, "(-)"))
                    }
                    return el
                  }
                })
              ))
            })


            api.sbot_get(skillID, function(err, skMsg) {
              if(err) { throw err; return}
              positions_el.appendChild(h('li',
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
                  }}, "(+)") : null,
                skMsg.content.name+": ",
                skillMatching[skillID]
              ))
            })
          })
        });

        return h('div.inquiry',
          h('p', api.markdown(c.text)),
          h('strong','Hat: ',api.avatar_link(c.hat, api.avatar_name(c.hat))),
          h('br'),
          h('strong', 'skills needed:'),
          positions_el,
          h('strong', 'location:'),
          h("iframe", {
            "style": "width:100%",
            "frameborder":"0",
            "scrolling":"no",
            "src":"http://www.openstreetmap.org/export/embed.html?layer=mapnik&bbox="+encodeURIComponent(c.location.join(","))})
        )
      }
    }

  }
}
