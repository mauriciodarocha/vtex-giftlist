;(function( $, window, document, undefined ) {
    jQuery.fn.vtex_giftlist = function(options){

      var button = jQuery(this);

      var vtex_giftlist_opts = $.extend({
        form: true,
        class_message: ".vgl-list-msg",
        login: "Clique aqui para logar.",
        label: "Lista:",
        class_alert: ".vgl-alert-msg",
        or: "<span>ou</span>"
      }, options);

      var vtex_giftlist = {
        list_button: ".vgl-list-button",
        input: ".vgl-list-name",
        skus: null,
        data: null,
        init: function()
        {
          if(!vtex_giftlist.check(button))
            return false;

          vtex_giftlist.load.vtex_get_skus();
        },
        load:
        {
          vtex_get_skus: function()
          {
            if(typeof jQuery.vtex_get_skus !== "function")
              jQuery.getScript("/arquivos/vtex_get_skus.js",function()
              {
                vtex_giftlist.load.vtex_popup();
              });
            else
              vtex_giftlist.load.vtex_popup();
          },
          vtex_popup: function()
          {
            if(typeof jQuery.fn.vtex_popup !== "function")
              jQuery.getScript("/arquivos/vtex_popup.js",function(){
                vtex_giftlist.set.skus();
              });
            else
              vtex_giftlist.set.skus();
          },
          form: function()
          {
            var _url = '/no-cache/GiftListInsertSku.aspx';
            var _sku = vtex_giftlist.skus[0].sku;
            var _data = {GiftListTypeIdLikeIt:0,GiftListTypeIdWishList:0,SkuId:_sku,h:Date()};

            jQuery.ajax({
              url:'/no-cache/GiftListInsertSku.aspx',
              data: _data,
              success: function(data){
                vtex_giftlist.data = data;
                vtex_giftlist.show.form();
              }
            });
          }
        },
        set:
        {
          skus: function()
          {
            vtex_giftlist.skus = jQuery.vtex_get_skus();
            if(typeof vtex_giftlist.skus !== "undefined" && vtex_giftlist.skus !== null && vtex_giftlist.skus.length>0)
              vtex_giftlist.set.event.add_list();
          },
          event: 
          {
            add_list: function()
            {
              if(jQuery(button).filter(".active").length>0) return false;

              jQuery(button).filter(":not('active')").addClass("active").click(function()
              {
                if(vtex_giftlist.logged()) 
                  vtex_giftlist.show.lists();
                else 
                  vtex_giftlist.show.not_logged();
              });
            },
            form: function()
            {
              jQuery(vtex_giftlist.list_button).click(function()
              {
                var name = jQuery(vtex_giftlist.input).val();
                name = name.replace(/^\s*([\S\s]*?)\s*$/, '$1');
                if(name!=="")
                  vtex_giftlist.add_list(name);
              });
            }
          }
        },
        add_list: function (name)
        {
          var giftlisturl = name.accentsTidy();
          var today = new Date();
          var dd = today.getDate()<10?"0"+today.getDate():today.getDate();
          var mm = (today.getMonth()+1)<10?"0"+(today.getMonth()+1):today.getMonth()+1;
          var yyyy = today.getFullYear();
          var current_date = dd+"/"+mm+"/"+yyyy;
          current_date = escape(current_date);
          var data = {
            giftlistpath:/lista/,
            giftlistid:"",
            giftlistfileid:"",
            giftlisttype:1,
            giftlistname:name,
            giftlistgifeted:".",
            giftlisteventdate:current_date,
            giftlisturl:giftlisturl,
            giftlistmessage:"+",
            giftlistisactive:"on"
          };

          var url = "/no-cache/list/save";
          var options = {
            url: url,
            type: "post",
            data: data,
            success: function ( data, textStatus, jqXHR )
            {
              if(!data)
              {
                vtex_giftlist.clear.error();
                vtex_giftlist.show.lists();
              }
              else
              {
                vtex_giftlist.show.error();
              }
            },
            error: function ( jqXHR, textStatus, errorThrown )
            {

            }
          };
          jQuery.ajax(options);

        },
        clear:
        {
          error: function () 
          {
            jQuery(vtex_giftlist_opts.class_alert).removeClass("error").text("");
          }
        },
        show:
        {
          error: function ()
          {
            jQuery(vtex_giftlist_opts.class_alert).addClass("error").text("Nome de lista já existente.");
          },
          lists: function()
          {
            vtex_giftlist.load.form();
          },
          form: function ()
          {
            var list = true;
            var div = jQuery("<div>").addClass("vgl-container");
            if(jQuery(vtex_giftlist.data).find("ul").length<=0)
            {
              list = false;
              vtex_giftlist.data="<p class='vgl-nolist'>Adicione uma lista abaixo.</p>";
            }

            jQuery(div).html(vtex_giftlist.data);

            if(!!vtex_giftlist_opts.or&&list)
            {
              var or = jQuery("<div>").addClass("vgl-or").html(vtex_giftlist_opts.or);
              jQuery(div).append(or);
            }

            if(vtex_giftlist_opts.form)
            {
              var form = jQuery("<div>").addClass("vgl-form");
              var label = jQuery("<label>").addClass("vgl-list-label").text(vtex_giftlist_opts.label);
              var span = jQuery("<span>").addClass(vtex_giftlist_opts.class_alert.substr(1));
              var input = jQuery("<input>",{type:"text"}).addClass(vtex_giftlist.input.substr(1));
              var button = jQuery("<a>").addClass(vtex_giftlist.list_button.substr(1)).text("Criar lista");
              jQuery(label).append(span);
              jQuery(form).append(label).append(input).append(button);
              jQuery(div).append(form);
              jQuery(div).vtex_popup({title:"Adicione a lista",callback:vtex_giftlist.set.event.form});
            }
            else
              jQuery(div).vtex_popup({title:"Adicione a lista"});
          },
          not_logged: function()
          {
            var url = document.location.pathname;
            var div = jQuery("<div>").addClass("not_logged");
            var message = jQuery("<p>").addClass(vtex_giftlist_opts.class_message.substr(1));
            var a = jQuery("<a>",{ href: "/Site/Login.aspx?ReturnUrl="+url }).text(vtex_giftlist_opts.login);
            jQuery(message).append(a);
            jQuery(div).append(message);
            jQuery(div).vtex_popup({title:"Adicione a lista"});
          }
        },
        logged: function()
        {
          return (new RegExp(/ISI=.*Apelido/)).test(document.cookie);
        },
        check: function(e)
        {
          var result = true;

          if(jQuery(e).length<=0) 
          {
            vtex_giftlist.log("A link or button must be provided to work.");
            result = false;
          }

          return result;
        },
        log: function(log)
        {
          if(typeof console=="undefined") return;

          console.log(log);
        }
      };

      return vtex_giftlist.init();

    };

})( jQuery, window, document );
String.prototype.accentsTidy = function(){
    var s = this;
    var r = s.toLowerCase();
    r = r.replace(/^\s*([\S\s]*?)\s*$/, '$1');
    r = r.replace(new RegExp(/\s/g),"-");
    r = r.replace(new RegExp(/[àáâãäå]/g),"a");
    r = r.replace(new RegExp(/æ/g),"ae");
    r = r.replace(new RegExp(/ç/g),"c");
    r = r.replace(new RegExp(/[èéêë]/g),"e");
    r = r.replace(new RegExp(/[ìíîï]/g),"i");
    r = r.replace(new RegExp(/ñ/g),"n");                
    r = r.replace(new RegExp(/[òóôõö]/g),"o");
    r = r.replace(new RegExp(/œ/g),"oe");
    r = r.replace(new RegExp(/[ùúûü]/g),"u");
    r = r.replace(new RegExp(/[ýÿ]/g),"y");
    r = r.replace(new RegExp(/\//g),"");
    r = r.replace(new RegExp(/--/g),"-")
    return r;
};