var h = require('hyperscript')
var obs = require('observable')
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
  sbot_whoami: 'first',
  message_confirm: 'first',
  message_compose: 'first',
  ting_allskills:'first',
  ting_myskills:'first'
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


    // this counts skill adopted:true and :false messages to see which ones are still valid
    function countAdopted(ary) {
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
        if (typeof c["adopted"] === "boolean") {
          cntMap[c.sk0rg].cnt = c["adopted"] ? cntMap[c.sk0rg].cnt + 1:cntMap[c.sk0rg].cnt - 1
        }
      })
      return cntMap
    }

    //  make sure the sk0rgs are only displayed for yourself
    var isMyself =false
    api.sbot_whoami(function (err, feed) {
      if (err) return console.error(err)
      isMyself=id === feed.id
      if (isMyself) {
        sk0rgsAdopter( h('form',
          h('span', 'Adopt existing:'),
          adoptSelector_el = combobox({
            style: {'max-width': '26ex'},
            read: pull(
              api.ting_allskills(),
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
          h('span', 'or add missing sk0rgs ',
            h('a', {href: "#/ting-sk0rg"}, 'here'))
        ))
      }
    })

    // fill sk0rgs list
    api.ting_myskills(id, function(err, aboutMsgArr) {
      if(err) { throw err; return}
      aboutMsgArr.forEach(function(aboutMsg) {

        var sk = aboutMsg.value.content.sk0rg
        api.sbot_get(sk, function(err, skMsg) {
          if(err) { throw err; return}

          var deleteLink = obs()
          if (isMyself) {
            deleteLink(h('a', {href: '#', onclick: function(e) {
              e.preventDefault()
              // copy msg and invert it
              var untrack = aboutMsg.value.content
              untrack.adopted = false
              api.message_confirm(untrack, function (err, msg) {
                if(err) return alert(err)
                if(!msg) return
              })
            }}, "(☢)"))
          }
          sk0rgs_el.appendChild(h('li',
            // TODO: don't link to individual message, link to feed with all inquiries for this skill
            h('a', {href: '#'+msgKey}, skMsg.content.name), ": " + skMsg.content.text,
            deleteLink
          ))
        })
      })
    })

    // followers
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

    // return the ui
    var adoptSelector_el
    var sk0rgsAdopter =obs() // observable because we have to wait for the whoami-callback...
    return h('div.column.profile',
      api.avatar_edit(id),
      api.avatar_description(id),
      h("strong", "pinned post"),
      api.avatar_pinned(id),
      api.avatar_action(id),
      h('div.profile__relationships.column',
        h('strong', 'sk0rgs'),
        sk0rgs_el,
        sk0rgsAdopter,
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

