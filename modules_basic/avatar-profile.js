var h = require('hyperscript')
var pull = require('pull-stream')
var cat = require('pull-cat')
var combobox = require('hypercombo')

exports.needs = {
  avatar_image_link: 'first',
  avatar_action: 'map',
  avatar_description: 'first',
  avatar_edit: 'first',
  avatar_pinned: 'first',
  follows: 'first',
  followers: 'first',
  sbot_get: 'first',
  sbot_query: 'first',
  message_confirm: 'first',
  message_compose: 'first'
}

exports.gives = 'avatar_profile'

exports.create = function (api) {

  function image_link (id) {
    return api.avatar_image_link(id, 'thumbnail')
  }


  return function (id) {


    var sk0rgs_el = h('ul')
    var follows_el = h('div.profile__follows.wrap')
    var friends_el = h('div.profile__friendss.wrap')
    var followers_el = h('div.profile__followers.wrap')
    var a, b

    function adoptSkillForm() {
      var adoptSelector_el;
      var sk0rgName_el;
      var form = h('form',
        h('strong', 'Adopt existing:'),
        adoptSelector_el = combobox({
          style: {'max-width': '26ex'},
          read: pull(
            api.sbot_query({query:
              [{"$filter": {"value": { "content":{ "type":"sk0rg" }}}}]
            }),
            // filter unadopted ones
            pull.map(function (sk) {
              var t = sk.value.content.text
              if (t.length > 70) t = t.substr(0, 70) + '…'
              return h('option', {value: sk.key},
                sk.value.content.name + ": " + t
              )
            }))
        }),
        h('button', {onclick: function (e) {
          e.preventDefault()
          api.message_confirm({
            "type": 'about', "about": id,
            "sk0rg":adoptSelector_el.value, "adopted": true,
          }, function (err, msg) {
            if(err) return alert(err)
            if(!msg) return
          })
        }}, "Adopt"),
        h('br'),
        h('strong', 'Add missing sk0rg:'),
        sk0rgName_el=h('input', {placeholder: "sk0rg name"}),
        api.message_compose(
          {type: 'sk0rg' },
          function (value) {
            value.name = sk0rgName_el.value
            return value
          },
          function (err, sk) {
            if(err) return alert(err)
            if(!sk) return
            var title = sk.value.content.text
            if(title.length > 70) title = title.substr(0, 70) + '…'
            sk0rgs_el.appendChild(h('li',
              h('a', {href: '#'+id}, sk.content.name),
              ": " + sk.content.text))
          }
        )
      )
      return form
    }

    // this counts skill adopted:true and :false messages to see which ones are still valid
    function countAdopts(ary) {
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
        if (typeof c.adopted === "boolean") {
          cntMap[c.sk0rg].cnt = c.adopted ? cntMap[c.sk0rg].cnt + 1:cntMap[c.sk0rg].cnt - 1
        }
      })
      return cntMap
    }

    // fill sk0rgs list
    pull(
      api.sbot_query({query: [
        {"$filter": {
          "value":{
            "author": id,
            "content": {"type":"about", "sk0rg":{"$prefix":""}}
          }
        }}
      ]}),
      pull.collect(function(err, ary) {
        if(err) {throw err; return;}
        var adoptCnt = countAdopts(ary)
        Object.keys(adoptCnt).forEach(function(msgKey) { // deduplicate the array
          var aboutMsg = adoptCnt[msgKey].msg
          if (adoptCnt[msgKey].cnt > 0) { // only add adopted themes
            var sk = aboutMsg.value.content.sk0rg
            api.sbot_get(sk, function(err, skMsg) {
              sk0rgs_el.appendChild(h('li',
                h('a', {href: '#'+msgKey}, skMsg.content.name), ": " + skMsg.content.text,

                h('a', {href: '#', onclick: function(e) {
                  e.preventDefault()
                  // copy msg and invert it
                  var untrack = aboutMsg.value.content
                  untrack.adopted = false
                  api.message_confirm(untrack, function (err, msg) {
                    if(err) return alert(err)
                    if(!msg) return
                  })
                }}, "(☢)")
              ))
            })
          }
        })
      })
    )

    pull(api.follows(id), pull.unique(), pull.collect(function (err, ary) {
      a = ary || []; next()
    }))
    pull(api.followers(id), pull.unique(), pull.collect(function (err, ary) {
      b = ary || {}; next()
    }))



    function next () {
      if(!(a && b)) return
      var _c = [], _a = [], _b = []

      a.forEach(function (id) {
        if(!~b.indexOf(id)) _a.push(id)
        else               _c.push(id)
      })
      b.forEach(function (id) {
        if(!~_c.indexOf(id)) _b.push(id)
      })
      function add (ary, el) {
        ary.forEach(function (id) { el.appendChild(image_link(id)) })
      }

      add(_a, follows_el)
      add(_c, friends_el)
      add(_b, followers_el)
    }


    return h('div.column.profile',
      api.avatar_edit(id),
      api.avatar_description(id),
      h("strong", "pinned post"),
      api.avatar_pinned(id),
      api.avatar_action(id),
      h('div.profile__relationships.column',
        h('strong', 'sk0rgs'),
        sk0rgs_el,
        h('div', h('a', {href: '#', onclick: function (e) {
          e.preventDefault()
          this.parentNode.replaceChild(adoptSkillForm(id), this)
        }}, 'Adopt Sk0rg…')),
        h('strong', 'follows'),
        follows_el,
        h('strong', 'friends'),
        friends_el,
        h('strong', 'followers'),
        followers_el
      )
    )
  }

}

