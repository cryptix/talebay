var h = require('hyperscript')
var u = require('../util')
var pull = require('pull-stream')
var pullSort = require('pull-sort')
var Scroller = require('pull-scroll')

exports.needs = {
  message_render: 'first',
  message_compose: 'first',
  ting_myskills: 'first',
  sbot_get: 'first',
  sbot_query: 'first',
  avatar_profile: 'first',
  avatar_name:"first",
  avatar_link: "first",
  ting_allskills: "first",
  avatar_description: "first"
}

exports.gives = {
  menu_items: true, screen_view: true
}

exports.create = function (api) {
  return {
    menu_items: function () {
      return h('a', {href: '#/collaborators'}, '/collaborators')
    },

    screen_view: function (path, opts) {
      if (path !== '/collaborators') return



      function switchUser(ev) {
        if (ev) ev.preventDefault()

        var selectedUser = this

        var oldEL = document.getElementById("fetchMe2");

        var content = h('div.scroller__content__filter#fetchMe2')
        oldEL.parentNode.replaceChild(content, oldEL);



        pull(
          api.sbot_query({query: [
            {"$filter": {
              "value":{
                "content": {
                  "sk0rg": selectedUser.key,
                  //  "adopted": true    TODO henry
                }
              }
            }},
            {"$map": {
              "author": ["value","author"]
            }}
          ]}),
          pull.unique("author"),
          pull.drain(function(msg) {
            content.appendChild(h('div.message_inquiry.userfilter_wrapper', h("div.userfilter_author",api.avatar_link(msg.author, api.avatar_name(msg.author))),  h("div.userfilter_description", api.avatar_description(msg.author))))
          })
        )



      }

      var self_id = require('../keys').id
      var skillSwitchers = h('div')

      var skillFields2 = h('div.skill_wrapper')
      pull(
        api.ting_allskills(),
        pull.filter(function(obj) { return obj.value.content.type === "sk0rg" }),
        pullSort(function(a, b){
          var a = a.value.content.name.toLowerCase()
          var b = b.value.content.name.toLowerCase()
          if(a < b) return -1;
          if(a > b) return 1;
          return 0;
        }),
        pull.drain(function(skMsg) {
          skillFields2.appendChild(
            h('div.skill_object.float',
              h('a',{href:'#', onclick: switchUser.bind(skMsg)}, skMsg.value.content.name)
            )
          )
        })
      )

      //     api.ting_myskills(self_id, function(err, mySkills) {//
      //
      //        if (err) {throw error; return}
      //
      //      mySkills = mySkills.map(function(msg) { return msg.value.content.sk0rg })
      //
      //
      //      mySkills.forEach(function(skID) {
      //
      //          api.sbot_get(skID, function(err, skMsg) {
      //          if(err) { throw err; return}
      //
      //          skMsg.key = skID
      //          skillSwitchers.appendChild( h('div.skill_object.float',
      //            h('a',{href:'#', onclick: switchUser.bind(skMsg)}, skMsg.content.name)))
      //        })
      //      })
      //    })

      var content = h('div.scroller__content__filter#fetchMe2')
      var div = h('div.column.scroller',
        {style: {'overflow': 'auto'}},
        h('div',
          h('div.profile_headline.float.clear', 'skill filter:'),
          skillFields2),

        h('div.scroller__wrapper', content)
      )

      // ugly hack because div needs to be returned first
      setTimeout(function() {
        switchUser()
      }, 100)

      return div
    }
  }
}
