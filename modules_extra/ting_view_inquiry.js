var h = require('hyperscript')
var u = require('../util')
var pull = require('pull-stream')
var Scroller = require('pull-scroll')

exports.needs = {
  message_render: 'first',
  message_compose: 'first',
  ting_myskills: 'first',
  sbot_get: 'first',
  sbot_log: 'first'
}

exports.gives = {
  builtin_tabs: true,
  menu_items: true,
  screen_view: true
}

exports.create = function (api) {


  return {
    builtin_tabs: function () {
      return ['/inquiries']
    },

    menu_items: function () {
      return h('a', {href: '#/inquiries'}, '/inquiries')
    },

    screen_view: function (path, opts) {
      if (path !== '/inquiries') return

      function switchSkill(ev) {
        if (ev) ev.preventDefault()

        var selectedSkill = this

        var oldEL = document.getElementById("fetchMe");

        var content = h('div.scroller__content__filter#fetchMe')
        oldEL.parentNode.replaceChild(content, oldEL);

        function filterFn (msg) {
          if (typeof msg.value.content.type === 'undefined') return false
          if (!msg.value.content.type.match(/^ting-inquiry/)) return false
          if (typeof selectedSkill.key === 'undefined') return true
          return msg.value.content.skills.indexOf(selectedSkill.key) > -1
        }
          
 //       function nohatFn (msg) {
 //         if (typeof msg.value.content.type === 'undefined') return false
 //         if (!msg.value.content.type.match(/^ting-inquiry/)) return false
 //         if (typeof msg.value.content.hat === null) return true
 //         return msg.key > -1
 //       }

        pull(
          u.next(api.sbot_log, {old: false, limit: 100}),
          pull.filter(filterFn),
  //        pull.filter(nohatFn),
          Scroller(div, content, api.message_render, true, false)
        )

        pull(
          u.next(api.sbot_log, {reverse: true, limit: 100, live: false}),
          pull.filter(filterFn),
  //        pull.filter(nohatFn),
          Scroller(div, content, api.message_render, false, false)
        )
      }

      var self_id = require('../keys').id
      var skillSwitchers = h('div.skill-filter.float')
      api.ting_myskills(self_id, function(err, mySkills) {
        if (err) {throw error; return}
        mySkills = mySkills.map(function(msg) { return msg.value.content.sk0rg })
        mySkills.forEach(function(skID) {
          api.sbot_get(skID, function(err, skMsg) {
            if(err) { throw err; return}
            skMsg.key = skID
            skillSwitchers.appendChild( h('div.skill_object.float',
              h('a',{href:'#', onclick: switchSkill.bind(skMsg)}, skMsg.content.name)))
          })
        })
      })
      
      var content = h('div.scroller__content__filter#fetchMe')
      var div = h('div.column.scroller',
        {style: {'overflow': 'auto'}},
        h('div', h('div.profile_headline', 'filter by own skills:'), skillSwitchers),
                  
        h('div.scroller__wrapper', content)
      )

      // ugly hack because div needs to be returned first
      setTimeout(function() {
        switchSkill()
      }, 100)

      return div
    }
  }
}
