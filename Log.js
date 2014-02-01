//TODO ajouter le ctrl click pour fermer/ouvrir toute les sous sections !
//
//
//
//
window.Log = (function(){

function Log(){
	this.initStyle();
	this.initNodes();
	
	//a fast access on every sections and values
	this.section = {};
	
	//just need a virtual parent
	this.container = {value: {}, node: this.logNode, name: 'Log'};
	this.logNode.section = this.container;
	this.logNode.Log = this;
	
	this.eventStat = {enable: 0, drag: false, posX: 0, posY: 0, x: 'right', y: 'top'};
	
	this.bindLog();
	
	this.lastTimeError = 0;
	this.lastError = "";
	this.disableError = false;

	if(document.readyState === "complet")
		this.bindLog();	

	else{
		var self = this;
		window.addEventListener('load', function(){ self.bindLog(); }, false);
	}
}

Log.prototype = {
	/**[EN] onload => append the 'logNode' element *
	  *[FR] onload => ajoute l'element 'logNode'   */
	bindLog : function(){
		document.body.appendChild(log.logNode);
	},
	
	/**[EN] Create a CSSStyleSheet object added to head of the document. If you want rules access use 'log.sheet', an easier access to the 'div#Log' rule with 'log.style' *
	  *[FR] Cree un objet CSSStyleSheet ajoute au head du document. Si vous voulez l'acces aux regles utilisez 'log.sheet, un acces simplifie a 'div#Log' avec 'log.style' */
	initStyle : function(){
		var style = document.createElement('style');
		document.head.appendChild(style);
		this.sheet = style.sheet;
		
		this.sheet.insertRule("div#Log{",
				"position:fixed;"+
				"min-height:100px;"+
				"min-width:100px;"+

				"cursor: default;"+
				
				"color:white;"+
				"background-color:rgba(0,0,0,.6);"+
				
				"font-size:10px;"+
				"overflow-y:scroll;"+
				"text-align:justify;"+
				"z-index:200;}", 0);
		
		this.sheet.insertRule("div.LogObject{"+
				"overflow:hidden;"+
				"box-shadow:-1px -1px 0px 0px;"+
				"margin-left:1px;"+
				"padding-left:7px;}", 1);
		
		this.sheet.insertRule("div.LogValue{"+
				"overflow:hidden;"+
				"box-shadow:5px -1px 0px;"+
				"padding-left:8px;}", 2);
		
		this.style = this.sheet.cssRules[0].style;
	},
	
	/**[EN] Create all nodes needed for add/edit the values/sections by the 'cloneNode' method                      *
	  *[FR] Cree toutes les nodes necessaires pour ajouter/modifier les valeurs/sections par la methode 'cloneNode' */
	initNodes : function(){
		this.logNode = document.createElement('div');
		this.logNode.id = 'Log';
		var s = this.logNode.style;
		s.height = "300px";
		s.width = "200px";
		s.right = s.top = "0px";
		
		this.logNode.addEventListener('mousedown', this.containerEvent, false);
		this.logNode.addEventListener('mouseup', this.containerEvent, false);
		this.logNode.addEventListener('mousemove', this.containerMoveEvent, false);
		this.logNode.addEventListener('mouseout', this.containerMoveEvent, false);
		
		this.nodeObject = document.createElement('div');
		this.nodeObject.className = 'LogObject';
		this.nodeObject.innerHTML = "<span></span>";
		
		this.nodeValue = document.createElement('div');
		this.nodeValue.className = 'LogValue';
		this.nodeValue.innerHTML = "<span></span> ";
	},
	
	add : function(section, value, process, overwrite, event){
		if(this.section[section] !== undefined && !overwrite)
			return this.logError("["+ section +"] use overwrite boolean for an existing section.");
		
		var index = section.lastIndexOf('.');
		var parent, name;
		
		if(index == -1){
			var name = section;
			var parent = this.container;
			
		}else{
			parent = this.section[section.slice(0,index)];
			if(parent === undefined || !(parent.value instanceof Object))
				return;
			
			name = section.slice(index - section.length + 1);
		}

		this.addOnTree(section, parent, name, value, process);
	},
	
	addOnTree : function(section, parent, name, value, process){
		var node, sec;

		if(this.section[section] === undefined)
			if(value instanceof Object){
				node = this.nodeObject.cloneNode(true);
				node.firstChild.addEventListener('click', this.nodeEvent, false);
				node.firstChild.innerHTML = name;
				
				parent.node.appendChild(node);
				parent.value[name] = value;
				
				sec = {value: {}, node: node, name: name, disable: false};
				node.lastChild.section = sec;	
				this.section[section] = sec;	
				
				for(key in value)
					this.addOnTree(section +'.'+ key, sec, key, value[key], process);
				
			}else{
				node = this.nodeValue.cloneNode(true);
				node.firstChild.innerHTML = name +": ";
				node.firstChild.addEventListener('click', this.nodeEvent, false);
				node.lastChild.data = value;
				
				node.style.height =  parseInt(this.style.fontSize)*1.2 + 'px';
				
				sec = {value: value, node: node.lastChild, name: name, parent: parent};
				if(process != null){
					sec.sendValue = sec.value;
					sec.process = process;
				}
				
				node.firstChild.section = sec;
				this.section[section] = sec;
				
				parent.node.appendChild(node);
				parent.value[name] = value;
			}
		
		else{
			var sec = this.section[section];
			
			if(value instanceof Object){
				if(sec.parent !== undefined){
					this.clear(section);
					this.addOnTree(section, parent, name, value, process);
					
				}else
					for(key in value)
						this.addOnTree(section +'.'+ key, sec, key, value[key], process);
				
			}else if(sec.parent === undefined){
					this.clear(section);
					this.addOnTree(section, parent, name, value, process);
					
			}else{
				sec.process = process;
				sec.value = value;
				sec.node.data = value;
				sec.parent.value[name] = value;
			}
		}
	},
	
	update : function(section, value, forceAdd){
		var sec = this.section[section];
		if(sec === undefined && forceAdd){
			if(section.indexOf('.') === -1)
				this.add(section, value);
			
			return;	
		}
		
		if(value instanceof Object){
			if(sec.parent !== undefined)
				return this.logError("["+ section +"] is a value section.");
			
			else if(!sec.disable)
				for(key in sec.value)
					if(value[key] !== undefined)
						this.update(section +'.'+ key, value[key]);

		}else
			if(sec.parent === undefined)
				return this.logError("["+ section +"] is an object section.");
		
			else{
				if(sec.process === undefined){
					sec.value = value;
					sec.node.data = sec.value;
					
				}else{
					sec.value = sec.process(value, sec.value);
					sec.sendValue = value;
					sec.node.data = sec.value+' \n('+value+')';
				}

				sec.parent.value[sec.name] = sec.value;
			}
	},
	
	clear : function(section){
		var sec = this.section[section];
		if(sec === undefined)
			return;
		
		var parent;
		if(sec.parent === undefined){
			parent = sec.node.parentNode;
			parent.removeChild(sec.node);
			
		}else{
			parent = sec.node.parentNode.parentNode;
			parent.removeChild(sec.node.parentNode);
		}
		
		if(parent.section !== undefined)
			delete parent.section.value[sec.name];
		
		this.clearOnTree(section);
	},
	
	clearOnTree : function(section){
		var sec = this.section[section];
		if(sec === undefined)
			return;
		
		if(sec.parent === undefined){
			for(key in sec.value)
				this.clearOnTree(section +"."+ key);
			
			delete this.section[section];
			
		}else
			delete this.section[section];
	},
	
	nodeEvent : function(e){
		if(this.parentNode.style.height === ""){
			this.parentNode.style.height = parseInt(Log.style.fontSize)*1.2 + 'px';
			
			if(this.section.disable !== undefined)
				this.section.disable = true;
			
		}else{
			this.parentNode.style.height = "";
			
			if(this.section.disable !== undefined)
				this.section.disable = false;
		}
	},
	
	
	containerEvent : function(e){
		var stat = this.Log.eventStat;
		var node = this;
		
		var offX = e.clientX - node.offsetLeft;
		var offY = e.clientY - node.offsetTop;

		stat.posX = offX;
		stat.posY = offY;
		
		switch(e.type){
			case 'mousedown':
					offX = Math.abs(stat.posX - node.clientWidth/2);
					offY = Math.abs(stat.posY - node.clientHeight/2);
					
					if(offX < node.clientWidth/4 && offY < node.clientHeight/4)
						stat.enable = 1;
						
					else if(offX > node.clientWidth/2-100 && offY > node.clientHeight/2-100)
						if(stat.posX < node.clientWidth/2)
							if(stat.posY < node.clientHeight/2)
								stat.enable = 2;
							else
								stat.enable = 3;
					
						else
							if(stat.posY < node.clientHeight/2)
								stat.enable = 4;
							else
								stat.enable = 5;
					
				break;
			case 'mouseup':
					stat.enable = 0;
					stat.drag = false;
					
				break;
		}
	},
	
	/**@since Called when the LogNode is moved to update position and hooked side                   *
	  *  [FR] Appelé quand le LogNode est déplacé pour mettre à jour la position et le côtè accroché*/
	containerMoveEvent : function(e){
		var stat = this.Log.eventStat;
		if(stat.enable === 0)
			return;
		
		var node = document.getElementById('Log');
		
		var offX = e.clientX - node.offsetLeft;
		var offY = e.clientY - node.offsetTop;
		
		var x = parseInt(node.style[stat.x]),
			y = parseInt(node.style[stat.y]),
			h = node.offsetHeight,
			w = node.offsetWidth,
			r = 50,
			side = {x:false, y:false};
		
		if(stat.enable === 1){
			x = stat.x==='left'? e.clientX - (stat.posX) : (document.body.clientWidth - e.clientX) - (w-stat.posX);
			y = stat.y==='top'? e.clientY - (stat.posY): (document.body.clientHeight - e.clientY) - (h-stat.posY);
			
		}else{
			switch(stat.enable+ (stat.x === 'right' ? 4 : 0)){
				case 2: case 3:
						x -= (r - offX);
						w += (r - offX);
						side.x = true;
						
					break;
				case 4: case 5:
						w += (offX - w+r);
					
					break;
				case 6: case 7:
						w += (r - offX);
					
					break;
				case 8: case 9:
						x += (w - offX - r);
						w -= (w - offX - r);
						side.x = true;
						
					break;
			}
			switch(stat.enable + (stat.y === 'bottom' ? 4 : 0)){
				case 2: case 4:
						y -= (r - offY);
						h += (r - offY);
						side.y = true;
						
					break;
				case 3: case 5: 
						h += (offY - h+r);
						
					break;
				case 6: case 8:
						h += (r - offY);
						
					break;
				case 7: case 9:
						y += (h - offY - r);
						h -= (h - offY - r);
						side.y = true;
						
					break;
			}
		}
		
		if(document.body.clientWidth<w)
			w = document.body.clientWidth;
		var maxX = document.body.clientWidth - w;
		
		if(document.body.clientHeight<h)
			h = document.body.clientHeight;
		var maxY = document.body.clientHeight - h;
		
		if(x<0)
			x=0;
		else if(x>maxX)
			x=maxX;
			
		else{
			if(w<100){
				if(side.x)
					x -= (100-w);
				w = 100;
			}
			node.style.width = w +'px';
		}
		node.style[stat.x] = x +'px';
		
		if(y<0)
			y=0;
		else if(y>maxY)
			y=maxY;
		
		else{
			if(h<100){
				if(side.y)
					y -= 100-h;
				h = 100;
			}
			node.style.height = h +'px';
		}
		node.style[stat.y] = y +'px';

		if(x === maxX)
			if(stat.x === 'left'){
				stat.x = "right";
				node.style.right = "0px";
				node.style.left = "";

			}else{
				stat.x = "left";
				node.style.left = "0px";
				node.style.right = "";
			}

		if(y === maxY)
			if(stat.y === 'top'){
				stat.y = "bottom";
				node.style.bottom = "0px";
				node.style.top = "";
				
			}else{
				stat.y = "top";
				node.style.top = "0px";
				node.style.bottom = "";
			}
	},
	
	trunc : function(value){
		return Math.round(value*1000)/1000;
	},

	/**@since Not a really usefull function, just a quik acces to hide the LogNode			  	 *
	  *  [FR] Une fonction pas vraiment utile, simplement un accés rapide pour cacher la LogNode */
	hide : function(){
		this.style.display = "none";
	},
	
	/**@since Not a really usefull function, just a quik acces to display the LogNode			   *
	  *  [FR] Une fonction pas vraiment utile, simplement un accés rapide pour afficher la LogNode */
	show : function(){
		this.style.display = "";
	},
	
	/**@since The good way to set the fontSize property					   *
	  *  [FR] La bonne marche à suivre pour modifier la propriété fontSize */
	setFontSize : function(size){
		if(size === undefined)
			size = 10;
		
		this.style.fontSize = size+"px";
		
		var nodes = this.container.node.childNodes;
		for(var i=0; i<nodes.length; i++)
			this.updateFontSize(nodes[i], size);
	},
	
	/**@since A recursive function to set the 'fontSize' of all nodes				  *
	  *  [FR] Une fonction récursive pour modifier le 'font-size' de toutes les nodes */
	updateFontSize : function(node, size){
		var nodes = node.childNodes;
		for(var i=0; i<nodes.length; i++)
			this.updateSize(nodes[i], size);
		
		if(node.style && node.style.height !== "")
			node.style.height = size*1.2 +'px';
	},
	
	/**@since Restrictive errors log (to do not spam the same error too often) 			 *
	  *  [FR] Un log d'erreurs restrain (pour ne pas spammer la méme erreur trop souvent) */
	logError : function(text){
		if(this.disableError)
			return false;

		var date = new Date();
		now = date.getTime();
		if(now - this.lastTimeError <1000 || this.lastError === text && now - this.lastTimeError <10000)
			return false;
		
		this.lastError = text;
		this.lastTimeError = now;
		console.error("[Log]: "+ text +"("+ date.getUTCMinutes() +":"+ date.getUTCSeconds() +"."+ date.getUTCMilliseconds() +")");
		return true;
	}
};})();