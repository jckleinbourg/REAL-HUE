/*-------------
TWEAKABLE STUFF:
---------------*/

//frequency of your monitor or system, in Hz
const REFRESH_RATE = 60;

//time, in s
const ANIM1_STAY = 12;
const ANIM1_CHANGE = 8;

const ANIM2_STAY = 6;
const ANIM2_CHANGE = 4;

const ANIM3_STAY = 5;
const ANIM3_CHANGE = 10;

//times for each color to scroll out of the screen, in s
var SCROLL_TIMES = [false, 20, 10, 5];



//for later use:
var anim_stay = [null, ANIM1_STAY, ANIM2_STAY, ANIM3_STAY];
var anim_change = [null, ANIM1_CHANGE, ANIM2_CHANGE, ANIM3_CHANGE];



/*--------------

** HERE WE GO **
 
---------------*/

var __scroll_index = 0;
var __zone_index = 2;

startAnim(__zone_index);


//some timers
var __timer_jumper, __timer_change_frames, __wait_timer;

//controls
document.onkeydown = checkKey;
function checkKey(e) {
    e = e || window.event;
	
	//go fullscreen
	var element = document.body;
	if(element.requestFullscreen) {
		element.requestFullscreen();
	} else if(element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	} else if(element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	} else if(element.msRequestFullscreen) {
		element.msRequestFullscreen();
	}
	
	var old_zone = __zone_index;
	
	//detect keys
    if (e.keyCode == '38') {//up arrow
		__scroll_index++;
		if (__scroll_index >= SCROLL_TIMES.length){
			__scroll_index = SCROLL_TIMES.length-1;
		} else {
			go();
		}
    }
    else if (e.keyCode == '40') {//down arrow
        __scroll_index--;
		if (__scroll_index < 0){
			__scroll_index = 0;
		} else {
			go();
		}
    }
    else if (e.keyCode == '37') {//left arrow
       __zone_index--;
	   if (__zone_index < 1){
		   __zone_index = 1;
	   } else {
		   go();
	   }
    }
    else if (e.keyCode == '39') {//right arrow
       __zone_index++;
	   if (__zone_index >= document.body.childElementCount - 1){
		   __zone_index = document.body.childElementCount - 2;
	   } else {
		   go();
	   }
    }
	
	function go(){
		//reset stuff & restart
		document.getElementById("anim"+old_zone).style.display = "none";
		clearInterval(__timer_jumper);
		clearInterval(__timer_change_frames);
		clearInterval(__wait_timer);
		
		startAnim(__zone_index);
	}
}

/*-------------
 MAGIC IS HERE
---------------*/

function pickRandomColor(){
	var h = Math.floor(Math.random()*359);
	var s = 80+Math.floor(Math.random()*20);
	return "hsl("+h+" "+s+"% "+(50-((100-s)/2))+"%)";
}
function hslColorToValue(str){
	var h = parseInt(str.substr(4, str.indexOf(" ") - 4));
	var s = parseInt(str.substr(str.indexOf(" ")+1, str.indexOf("%") - str.indexOf(" ") -1));
	var l = parseInt(str.substr(str.lastIndexOf(" ")+1, str.lastIndexOf("%") - str.lastIndexOf(" ") -1));
	return [h, s, l];
}
function valuesToHslColor(arr){
	var h = Math.floor(arr[0]);
	var s = Math.floor(arr[1]);
	var l = Math.floor(arr[2]);
	return "hsl("+h+" "+s+"% 50%)";
}
function hslToRgb(arr){
	var h = arr[0] / 360;
	var s = arr[1] / 100;
	var l = arr[2] / 100;
	
    var r, g, b;

    if(s == 0){
        r = g = b = l;
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}



/*********************************
***** HUE COLOR ANIM GO GO GO ****
**********************************/
function startAnim(_zone){
	var _cols = document.getElementById("anim"+_zone).childElementCount;
	
	// -CSS GEAR-
	var duration;
	if (SCROLL_TIMES[__scroll_index]){
		
		duration = SCROLL_TIMES[__scroll_index]*1000;
		
		document.getElementById("anim" + _zone).animate(
			[
				{ transform: 'translateX(0px)' }, 
				{ transform: 'translateX('+(100/_cols)+'vw)' }
			],{
				duration: duration,
				iterations: Infinity
			}
		);
		
	} else {
		
		duration = 1000;
		
		document.getElementById("anim" + _zone).animate(
			[
				{ transform: 'none' }, 
				{ transform: 'none' }
			],{
				duration: duration,
				iterations: Infinity
			}
		);
	}

	var cycle_counter = 0;
	
	if (SCROLL_TIMES[__scroll_index]){
		__timer_jumper = setInterval(
			function(){
				cycle_counter++;
				if (cycle_counter == _cols){
					cycle_counter = 0;
				}
				var last_col = document.getElementById("anim"+_zone+"-zone"+_cols).style.backgroundColor;
				for (var i=_cols; i>1; i--){
					document.getElementById("anim"+_zone+"-zone"+i).style.backgroundColor = document.getElementById("anim"+_zone+"-zone"+(i-1)).style.backgroundColor;
				}
				document.getElementById("anim"+_zone+"-zone1").style.backgroundColor = last_col;
				document.getElementById("bg").style.backgroundColor = document.getElementById("anim"+_zone+"-zone"+_cols).style.backgroundColor;
				
			},
			duration
		);
	}
	
	document.getElementById("anim"+_zone).style.display = "grid";
	
	var color_current = [];
	var color_next = [];
	for (var i=1; i<=_cols; i++){
		color_current[i] = pickRandomColor();
		color_next[i] = pickRandomColor();
	}
	
	step1();
	
	//step1: pick and go
	function step1(){
		for (var i=1; i<=_cols; i++){
			
			var sj = scrollJump(i);
			document.getElementById("anim"+_zone+"-zone"+i).style.backgroundColor = color_current[sj];
			color_next[i] = pickRandomColor();
		}
		document.getElementById("bg").style.backgroundColor = document.getElementById("anim"+_zone+"-zone"+_cols).style.backgroundColor;
		
		//wait
		__wait_timer = setTimeout(step2, anim_stay[_zone]*1000);
	}
	
	//step2: change to next color
	function step2(){
		
		var nb_frames = anim_change[_zone] * REFRESH_RATE;
		
		var cc = [];
		var cn = [];
		var change_r_step = [];
		var change_g_step = [];
		var change_b_step = [];
		var c_r = [];
		var c_g = [];
		var c_b = [];
		
		for (i=1; i<=_cols; i++){
			
			cc[i] = hslToRgb(hslColorToValue(color_current[i]));
			cn[i] = hslToRgb(hslColorToValue(color_next[i]));
			
			change_r_step[i] = parseFloat((cn[i][0] - cc[i][0])) / nb_frames;
			change_g_step[i] = parseFloat((cn[i][1] - cc[i][1])) / nb_frames;
			change_b_step[i] = parseFloat((cn[i][2] - cc[i][2])) / nb_frames;
			
			c_r[i] = parseFloat(cc[i][0]);
			c_g[i] = parseFloat(cc[i][1]);
			c_b[i] = parseFloat(cc[i][2]);
		}
				
		var frame_counter = 0;
		
		__timer_change_frames = setInterval(waitNextFrame, parseInt(1000/REFRESH_RATE));
		
		// ~~~~ *COLOR* f r a m e t r a n s i t i o n ~~~~
		function waitNextFrame(){	
			var i;
			
			frame_counter++;
			
			//out?
			if (frame_counter > nb_frames){
				clearInterval(__timer_change_frames);
				for (i=1; i<=_cols; i++){
					color_current[i] = color_next[i];
				}
				step1();
			//no! :D
			} else {
				
				for (i=1; i<=_cols; i++){
					c_r[i] += change_r_step[i];
					c_g[i] += change_g_step[i];
					c_b[i] += change_b_step[i];
					
					var sj = scrollJump(i);
			
					document.getElementById("anim"+_zone+"-zone"+i).style.backgroundColor = "rgb("+Math.floor(c_r[sj])+","+Math.floor(c_g[sj])+","+Math.floor(c_b[sj])+")";
				}
				document.getElementById("bg").style.backgroundColor = document.getElementById("anim"+_zone+"-zone"+_cols).style.backgroundColor;
			}
		}
	}
	//scroll jump
	function scrollJump(val){
		
		val = val - cycle_counter;
		if (val < 1){
			val = val + _cols;
		}
		return val;
	}
}