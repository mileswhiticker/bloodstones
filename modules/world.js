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
		
		var instance = declare("_world", null, {
			//put your functions here
			
			SetupBackgroundMap : function(canvas)
			{
				//console.log("page::SetupBackgroundMap");
				const gamemap = dojo.byId("gamemap");
				
				//this.SetMapViewScale(1);
				//this.MoveCameraWorld(0,0);
				
				//<img id="droppable_map" class="droppable_map" usemap="#provinceclickareas"></img>
				var path_string = g_gamethemeurl + '/img/blank.png';
				//console.log("img src: " + path_string);
				var droppable_img = dojo.place("<img id=\"droppable_map\" class=\"droppable_map\" src=\"" + path_string + "\" usemap=\"#provinceclickareas\"></img>",
					"province_overlay_canvas","after");
				
				dojo.connect(droppable_map, "click", dojo.hitch(this, this.onClickDroppable_map));
				
				//setup the map click and drag
				gamemap.draggable = true;
				gamemap.ondragstart = window.gameui.MapDragStart;
				gamemap.ondrag = window.gameui.MapDrag;
				//gamemap.ondragend = window.gameui.MapDragEnd;
				//gamemap.ondrop = window.gameui.MapDragDrop;
				
				this.map_drag_prev_x = -1;
				this.map_drag_prev_y = -1;
				
			},
			
			MapDragStart : function(event)
			{
				//const gamemap = dojo.byId("gamemap");
				//event.dataTransfer.setData("text/plain", "gamemap");
				window.gameui.map_drag_prev_x = event.pageX;
				window.gameui.map_drag_prev_y = event.pageY;
			},
			
			MapDrag : function(event)
			{
				//pageX and pageY are set to 0 under certain conditions
				//if so, then deltaX and deltaY below will "reset" the whole drag movement
				//this is a hacky way to prevent that, but i think it should be safe
				if(event.pageX != 0 && event.pageY != 0)
				{
					var deltaX = window.gameui.map_drag_prev_x - event.pageX;
					var deltaY = window.gameui.map_drag_prev_y - event.pageY;
					//console.log("MapDrag() deltaX:" + deltaX + ", deltaY:" + deltaY);

					var coords = {x: window.gameui.camera_coords_world.x + deltaX, y: window.gameui.camera_coords_world.y + deltaY};
					coords = window.gameui.applyBoundedCoords(coords);
					
					//console.log(coords);
					//console.log(window.gameui.camera_coords_world);
					if(coords.x != window.gameui.camera_coords_world.x || coords.y != window.gameui.camera_coords_world.y)
					{
						window.gameui.MoveCameraWorld(coords.x, coords.y);
						//console.log("new camera: (" + coords.x + "," + coords.y + ")");
						//console.log(event);
						
						window.gameui.map_drag_prev_x = event.pageX;
						window.gameui.map_drag_prev_y = event.pageY;
					}
				}
			},
			
			/*
			MapDragEnd : function(event)
			{
				//
			},
			
			MapDragDrop : function(event)
			{
				//
			},
			*/
			
			SetMapViewScale : function(new_scale)
			{
				//percent_zoom is from 0..1 inclusive
				var old_scale = this.map_view_scale;
				this.map_view_scale = new_scale
				dojo.style(gamemap, "background-size", 100*this.map_view_scale + "%");
				
				//special handling for zooming out to reposition the map so that we dont reveal blank strips on the edge
				if(old_scale > new_scale)
				{
					//console.log("zooming out");
					
					//check if the x coordinate is off the edge of the map
					var newX = this.camera_coords_world.x;
					var maxX = this.getBoundsMaxX();
					if(newX > maxX)
					{
						newX = maxX;
						//console.log("repositioning due to maxX");
					}
					
					//check if the y coordinate is off the edge of the map
					var newY = this.camera_coords_world.y;
					var maxY = this.getBoundsMaxY();
					if(newY > maxY)
					{
						newY = maxY;
						//console.log("repositioning due to maxY");
					}
					
					//reposition the camera
					//console.log("newY:" + newY + ", maxY:" + maxY);
					if(this.camera_coords_world.x != newX || this.camera_coords_world.y != newY)
					{
						this.MoveCameraWorld(newX,newY);
					}
				}
				this.RegenerateMapUI();
			},
			
			MoveCameraWorld(world_x, world_y)
			{
				//note: when setting the background-position values, the anchor for coords is bottom right, so +x goes left and +y goes up
				this.camera_coords_world.x = world_x;
				this.camera_coords_world.y = world_y
				
				const gamemap = dojo.byId("gamemap");
				var background_coords = this.WorldToBackgroundCoords(world_x, world_y);
				dojo.style(gamemap, "background-position-x", background_coords.x + "px");
				dojo.style(gamemap, "background-position-y", background_coords.y + "px");
				
				this.RegenerateMapUI();
			},
			
			WorldToCanvasCoords : function(world_x, world_y)
			{
				var canvas_coords = {x:world_x,y:world_y};
				
				canvas_coords.x *= this.map_view_scale;
				canvas_coords.y *= this.map_view_scale;
				
				canvas_coords.x -= this.camera_coords_world.x;
				canvas_coords.y -= this.camera_coords_world.y;
				
				return canvas_coords;
			},
			
			WorldToBackgroundCoords : function(world_x, world_y)
			{
				var background_coords = {x:-world_x,y:-world_y};
				//background_coords.x = -(this.map_view_scale - 1) * (world_x/2);
				//background_coords.y = -(this.map_view_scale - 1) * (world_y/2);
				
				return background_coords;
			},
			
			CanvasToWorldCoords : function(canvas_x, canvas_y)
			{
				//todo
				world_coords = {x:canvas_x,y:canvas_y};
				return world_coords;
			},
			
			GetCameraScrollIncrement : function()
			{
				return this.map_view_scale * this.camera_scroll_increment;
			},
		});
		
		return instance;
	}
);