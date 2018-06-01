var lastSearch='';
var initialSize=-1;

var typingTimer;
var doneTypingInterval = 300;
var $buscadorInput = $('#buscador');
var buscadorInput = document.getElementById("buscador");

var startFlying = false;

$buscadorInput.on('keyup', function () {
  	clearTimeout(typingTimer);
	var x = document.getElementById("buscador");
	if(initialSize == -1)
		initialSize = x.size;
       	x.size = ( x.value.length > initialSize ) ? x.value.length : initialSize;
  	typingTimer = setTimeout(buscar, doneTypingInterval);
});

function buscar() {
	clearTimeout(typingTimer);
	var x = document.getElementById("buscador");
    	x.value = x.value.toLowerCase();
	var busqueda = x.value;
	
	if(busqueda.length > 3){
		var expEsDominio = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
		var esDominio = new RegExp(expEsDominio);

		var expEsIp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
		var esIp = new RegExp(expEsIp);
		if (busqueda.match(esDominio)) {
			if(busqueda !== lastSearch){
    				x.className = "cargandoBuscador";
    				x.readOnly = true;
				lastSearch = busqueda;
			}
			$.ajax ({ 
				url: 'php/buscarDominio.php',
				data: {busqueda: busqueda},
				type: 'post'
			}).done(function(responseData) {
				getLonLatFromIP(nslookupToIP(responseData, busqueda, "insertarDominio"),busqueda);
    				x.readOnly = false;
			}).fail(function(fail) {
			    	console.log('Fallo encontrando Dominio!');
			}).complete(function(data) {
			});
		} else {
			if(busqueda.match(esIp)){
				if(busqueda !== lastSearch){
    					x.className = "cargandoBuscador";
    					x.readOnly = true;
					lastSearch = busqueda;
				}
				$.ajax ({ 
					url: 'php/buscarDominio.php',
					data: {busqueda: busqueda},
					type: 'post'
				}).done(function(responseData) {
					getLonLatFromIP(busqueda, nslookupToDomain(responseData, busqueda, "insertarDominio"));
	    				x.readOnly = false;
				}).fail(function(fail) {
				    	console.log('Fallo encontrando Dominio!');
				}).complete(function(data) {
				});
			} else {
				var x = document.getElementById("buscador");
				x.className = "";
			}
		}
	}
}
function nslookupToIP(responseData, busqueda, metodo){
	var lines = responseData.split('\n');
	for(var i = 0;i < lines.length;i++){
	    	if(lines[i].includes("Address")){
			var ip = lines[i].split("\t")[lines[i].split("\t").length-1].split(" ")[1];
			 if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)){  
				var parametros = { 
					"metodo": metodo, 
					"datos": {
						"dominio" : busqueda,
						"ip" : ip
					}
				};
				$.ajax ({ 
					url: 'php/db/conection.php',
					data: parametros,
					type: 'post',
					datatype: "json"
				}).done(function(responseData) {
					//console.log(responseData)
				}).fail(function(fail) {
				    	console.log(fail);
				}).complete(function(data) {
				});
				return ip;
			}
		}
	}
}
function nslookupToDomain(responseData, busqueda, metodo){
	var lines = responseData.split('\n');
	for(var i = 0;i < lines.length;i++){
	    	if(lines[i].includes("name = ")){
			var domain = lines[i].split("name = ")[lines[i].split("name = ").length-1];
			var parametros = { 
				"metodo": metodo, 
				"datos": {
					"dominio" : domain,
					"ip" : busqueda
				}
			};
			$.ajax ({ 
				url: 'php/db/conection.php',
				data: parametros,
				type: 'post',
				datatype: "json"
			}).done(function(responseData) {
				//console.log(responseData)
			}).fail(function(fail) {
			    	console.log(fail);
			}).complete(function(data) {
			});
			return domain;
		}
	}
}
function getLonLatFromIP(ip,busqueda){
	if(ip){
		$.ajax ({ 
			url: 'php/getLonLatFromIP.php',
			data: {ip: ip},
			type: 'post'
		}).done(function(responseData) {
			var datos = responseData.split(",");
			var lat = 0;
			var lon = 0;
			for(var i = 0;i < datos.length;i++){
				if(datos[i].includes("latitude")){
					lat = datos[i].split(":")[1];
				}
				if(datos[i].includes("longitude")){
					lon = datos[i].split(":")[1];
				}
			}
			if(!document.getElementById(busqueda)){
				var x = document.getElementById("buscador");
				setTimeout(function(){ x.select(); }, 100);
				
				var node = document.createElement("section");
				node.setAttribute("id", busqueda);
				node.setAttribute("class", "active");
				node.setAttribute("class", "fade");
				node.setAttribute("onClick", "setActiveChapter('"+busqueda+"')")

				var icono = document.createElement("img");
				icono.setAttribute("src", "http://www.google.com/s2/favicons?domain=" + busqueda);
				icono.innerHTML = busqueda;

				var h3=document.createElement("h3");
				h3.innerHTML = busqueda;

				var p=document.createElement("p");
				p.innerHTML = ip;

				node.appendChild(icono);
				node.appendChild(h3);
				node.appendChild(p);
		
				var elemento = document.getElementById("features");
				elemento.insertBefore(node, elemento.firstChild);
				x.className = "cargandoBuscador";

				if (typeof puntos === 'undefined')
					puntos = {};
				
				puntos[busqueda] = {
						bearing: 27,
						center: [lon, lat],
						zoom: 15,
						pitch: 20
				};

				setActiveChapter(busqueda);
				
				map.addMarkerToSource('markers', [lon,lat], busqueda, ip);
				
				startFlying = true;
				
				map.flyTo({
					center: [lon,lat],
					zoom: 14,
					bearing: 0,
					speed: 1.6,
					curve: 1.5,
					easing: function (t) {
					    return t;
					}
				});
				map.once('moveend', function(){
					var x = document.getElementById("buscador");
					x.className = "";
				});
			}
		}).fail(function() {
		    	console.log('Fallo encontrando Dominio!');
		});
	} else {
		var x = document.getElementById("buscador");
    		x.readOnly = false;
		x.className = "";
	}
}
$(document).keydown(function (e) {
    var keycode1 = (e.keyCode ? e.keyCode : e.which);
    if (keycode1 == 0 || keycode1 == 9) {
        e.preventDefault();
        e.stopPropagation();
    }
});
