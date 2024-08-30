/*
 * ------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * bloodstones implementation : © Miles Whiticker <miles.whiticker@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */
 
define(
	[
		"dojo",
		"dojo/_base/declare"
	],
	function (dojo, declare){
		var instance = declare("_tiledrag", null, {
			
			//put your functions here
			/*
			SetDraggableTile : function(tile)
			{
				var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
				var startX = 0, startY = 0;
				var old_z = "";
				tile.onmousedown = dragMouseDown;
				
				function dragMouseDown(e) {
					e = e || window.event;
					e.preventDefault();
					// get the mouse cursor position at startup:
					pos3 = e.clientX;
					pos4 = e.clientY;
					startX = dojo.style(tile, 'left');
					startY = dojo.style(tile, 'top');
					
					document.onmouseup = closeDragElement;
					// call a function whenever the cursor moves:
					document.onmousemove = elementDrag;
					
					//move above all other elements
					//GameLayerFloat() returns 9999
					old_z = dojo.style(tile, 'zIndex');
					dojo.style(tile, 'zIndex', window.gameui.GameLayerFloat());
				}

				function elementDrag(e) {
					e = e || window.event;
					e.preventDefault();
					// calculate the new cursor position:
					pos1 = pos3 - e.clientX;
					pos2 = pos4 - e.clientY;
					pos3 = e.clientX;
					pos4 = e.clientY;
					// set the element's new position:
					tile.style.top = (tile.offsetTop - pos2) + "px";
					tile.style.left = (tile.offsetLeft - pos1) + "px";
				}

				function closeDragElement() {
					// stop moving when mouse button is released:
					document.onmouseup = null;
					document.onmousemove = null;
					
					//reset these values
					dojo.style(tile, 'zIndex', old_z);
					tile.style.top = startY + "px";
					tile.style.left = startX + "px";
				}
			},
			*/
		});
		
		return instance;
	}
);