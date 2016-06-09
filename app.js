(function(){
   "use strict";

   var Poesk2ik = function(){

     // SEE ON SINGLETON PATTERN
     if(Poesk2ik.instance){
       return Poesk2ik.instance;
     }
     //this viitab Poesk2ik fn
     Poesk2ik.instance = this;

     this.routes = Poesk2ik.routes;
     // this.routes['home-view'].render()

     console.log('moosipurgi sees');

     // KÕIK muuutujad, mida muudetakse ja on rakendusega seotud defineeritakse siin
     this.click_count = 0;
     this.currentRoute = null;
     console.log(this);

     // hakkan hoidma kõiki purke
     this.jars = [];

     // Kui tahan Moosipurgile referenci siis kasutan THIS = MOOSIPURGI RAKENDUS ISE
     this.init();
   };

   window.Poesk2ik = Poesk2ik; // Paneme muuutja külge

   Poesk2ik.routes = {
     'home-view': {
       'render': function(){
         // käivitame siis kui lehte laeme
         console.log('>>>>avaleht');
       }
     },
     'list-view': {
       'render': function(){
         // käivitame siis kui lehte laeme
         console.log('>>>>loend');

         //simulatsioon laeb kaua
        

       }
     },
     'manage-view': {
       'render': function(){
         // käivitame siis kui lehte laeme
       }
     }
   };

   // Kõik funktsioonid lähevad Moosipurgi külge
   Poesk2ik.prototype = {

     init: function(){
       console.log('Rakendus läks tööle');

       //kuulan aadressirea vahetust
       window.addEventListener('hashchange', this.routeChange.bind(this));

       // kui aadressireal ei ole hashi siis lisan juurde
       if(!window.location.hash){
         window.location.hash = 'home-view';
         // routechange siin ei ole vaja sest käsitsi muutmine käivitab routechange event'i ikka
       }else{
         //esimesel käivitamisel vaatame urli üle ja uuendame menüüd
         this.routeChange();
       }

       //saan kätte purgid localStorage kui on
       if(localStorage.jars){
           //võtan stringi ja teen tagasi objektideks
           this.jars = JSON.parse(localStorage.jars);
           console.log('laadisin localStorageist massiiivi ' + this.jars.length);

           //tekitan loendi htmli
           this.jars.forEach(function(jar){

               var new_jar = new Jar(jar.id, jar.title, jar.ingredients);

               var li = new_jar.createHtmlElement();
               document.querySelector('.list-of-jars').appendChild(li);

           });

       }


       // esimene loogika oleks see, et kuulame hiireklikki nupul
       this.bindEvents();

     },

     bindEvents: function(){
       document.querySelector('.add-new-jar').addEventListener('click', this.addNewClick.bind(this));
    },
    deletejar: function(event){
      //millele vajutati
      console.log(event.target);
      //tema parent ehk mille see ta on (li)
      console.log(event.target.parentNode);
      //mille sees omakorda see on (ul)
      console.log(event.target.parentNode.parentNode);
      //ID
      console.log(event.target.dataset.id);

      var c = confirm("Oled kindel?");
      //kui ei ole kindel
      if(!c){return;}
      //Kustutan
      console.log('kustutan');

      //Kustutan Html'i
      var ul = event.target.parentNode.parentNode;
      var li = event.target.parentNode;
      ul.removeChild(li);
      var delete_id = event.target.dataset.id;

      //Kustutan ka massiivist ja uuendan LocalStoraget
      for(var i=0; i<this.jars.length; i++){
        if(this.jars[i].id == delete_id){
          //kustutan kohal [i]
          this.jars.splice(i, 1);
          break;
        }
      }
	localStorage.setItem('jars', JSON.stringify(this.jars));
    },
    editEntry: function(event){
      var selected_id = event.target.dataset.id;
      var clicked_li = event.target.parentNode;
      $("#ModalEdit").modal({backdrop: true});

      for(var i=0; i<this.jars.length; i++){
        if(this.jars[i].id == selected_id){

          document.querySelector('.EditTitle').value = this.jars[i].title;
          document.querySelector('.EditIngredients').value = this.jars[i].ingredients;
          

          break;
        }
      }
       //kuulan trükkimist otsikastis
       document.querySelector('#search').addEventListener('keyup', this.search.bind(this));

     },

     search: function(event){
         //otsikasti väärtus
         var needle = document.querySelector('#search').value.toLowerCase();
         console.log(needle);

         var list = document.querySelectorAll('ul.list-of-jars li');
         console.log(list);

         for(var i = 0; i < list.length; i++){

             var li = list[i];

             // ühe listitemi sisu tekst
             var stack = li.querySelector('.content').innerHTML.toLowerCase();

             //kas otsisõna on sisus olemas
             if(stack.indexOf(needle) !== -1){
                 //olemas
                 li.style.display = 'list-item';

             }else{
                 //ei ole, index on -1, peidan
                 li.style.display = 'none';

             }

         }
     },
	 
	 

     addNewClick: function(event){
       //salvestame purgi
       //console.log(event);

       
	   var title = document.querySelector('.title').value;
       var ingredients = document.querySelector('.ingredients').value;
	   var id = guid();

       //console.log(title + ' ' + ingredients);
       //1) tekitan uue Jar'i
       var new_jar = new Jar(id, title, ingredients);

       //lisan massiiivi purgi
       this.jars.push(new_jar);
       console.log(JSON.stringify(this.jars));
       // JSON'i stringina salvestan localStorage'isse
       localStorage.setItem('jars', JSON.stringify(this.jars));

       // 2) lisan selle htmli listi juurde
       var li = new_jar.createHtmlElement();
       document.querySelector('.list-of-jars').appendChild(li);


     },

     routeChange: function(event){

       //kirjutan muuutujasse lehe nime, võtan maha #
       this.currentRoute = location.hash.slice(1);
       console.log(this.currentRoute);

       //kas meil on selline leht olemas?
       if(this.routes[this.currentRoute]){

         //muudan menüü lingi aktiivseks
         this.updateMenu();

         this.routes[this.currentRoute].render();


       }else{
         /// 404 - ei olnud
       }


     },

     updateMenu: function() {
       //http://stackoverflow.com/questions/195951/change-an-elements-class-with-javascript
       //1) võtan maha aktiivse menüülingi kui on
       document.querySelector('.active-menu').className = document.querySelector('.active-menu').className.replace('active-menu', '');

       //2) lisan uuele juurde
       //console.log(location.hash);
       document.querySelector('.'+this.currentRoute).className += ' active-menu';

     },
	 

   }; // MOOSIPURGI LÕPP
   
   

   var Jar = function(new_id, new_title, new_ingredients){
     this.id = new_id;
	 this.title = new_title;
     this.ingredients = new_ingredients;
     console.log('created new jar');
   };
   

   Jar.prototype = {
     createHtmlElement: function(){

       // võttes title ja ingredients ->
       /*
       li
        span.letter
          M <- title esimene täht
        span.content
          title | ingredients
       */

       var li = document.createElement('li');

       var span = document.createElement('span');
       span.className = 'letter';

       var letter = document.createTextNode(this.title.charAt(0));
       span.appendChild(letter);

       li.appendChild(span);

       var span_with_content = document.createElement('span');
       span_with_content.className = 'content';

       var content = document.createTextNode(this.title + ' | ' + this.ingredients);
       span_with_content.appendChild(content);

       li.appendChild(span_with_content);

       //Delete nupp
      var span_delete = document.createElement('span');
      span_delete.style.color = "red";
      span_delete.style.cursor = "pointer";

      //Panen kaasa ID
      span_delete.setAttribute("data-id", this.id);
      span_delete.innerHTML = " Delete";
      li.appendChild(span_delete);

      span_delete.addEventListener("click", Poesk2ik.instance.deletejar.bind(Poesk2ik.instance));

	   
	   return li;

     }
   };
   
   
   
   //HELPER
    function guid(){
      var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
    }

   // kui leht laetud käivitan Moosipurgi rakenduse
   window.onload = function(){
     var app = new Poesk2ik();
   };

})();