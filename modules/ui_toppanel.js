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
		
		var instance = declare("_ui_toppanel", null, {
			//put your functions here
			
			SetupTopUI : function(canvas)
			{
				//console.log("page::SetupTopUI()");
				//const toppanel = dojo.place("<div id=\"toppanel\"></div>","centrepanel");
				const toppanel = dojo.byId("toppanel");
				dojo.style(toppanel, 'zIndex', this.GameLayerUIOver());
				
				const button_zoomin = dojo.place("<div id=\"button_zoomin\"></div>","toppanel");
				dojo.addClass(button_zoomin, "blst_button topbutton");
				dojo.connect(button_zoomin, "click", dojo.hitch(this, this.onClickZoomIn));
				
				const button_zoomout = dojo.place("<div id=\"button_zoomout\"></div>","toppanel");
				dojo.addClass(button_zoomout, "blst_button topbutton");
				dojo.connect(button_zoomout, "click", dojo.hitch(this, this.onClickZoomOut));
				/*
				const button_spawnbattle = dojo.place("<div id=\"button_spawnbattle\"></div>","toppanel");
				dojo.addClass(button_spawnbattle, "blst_button topbutton");
				dojo.connect(button_spawnbattle, "click", dojo.hitch(this, this.spawnBattle));
				
				const button_debug = dojo.place("<div id=\"button_debug\"></div>","toppanel");
				dojo.addClass(button_debug, "blst_button topbutton");
				//dojo.connect(button_findbattle, "click", dojo.hitch(this, this.findBattle));
				dojo.connect(button_debug, "click", dojo.hitch(this, this.playerDebugAction));
				
				const button_cycle_hand = dojo.place("<div id=\"button_cycle_hand\"></div>","toppanel");
				dojo.addClass(button_cycle_hand, "blst_button topbutton");
				dojo.connect(button_cycle_hand, "click", dojo.hitch(this, this.playerCycleHand));
				
				const button_spawn = dojo.place("<div id=\"button_spawn\"></div>","toppanel");
				dojo.addClass(button_spawn, "blst_button topbutton");
				dojo.connect(button_spawn, "click", dojo.hitch(this, this.playerSpawnTestArmy));
				
				const button_up = dojo.place("<div id=\"button_up\"></div>","toppanel");
				dojo.addClass(button_up, "blst_button topbutton");
				dojo.connect(button_up, "click", dojo.hitch(this, this.onClickScrollUp));
				
				const button_down = dojo.place("<div id=\"button_down\"></div>","toppanel");
				dojo.addClass(button_down, "blst_button topbutton");
				dojo.connect(button_down, "click", dojo.hitch(this, this.onClickScrollDown));
				
				const button_left = dojo.place("<div id=\"button_left\"></div>","toppanel");
				dojo.addClass(button_left, "blst_button topbutton");
				dojo.connect(button_left, "click", dojo.hitch(this, this.onClickScrollLeft));
				
				const button_right = dojo.place("<div id=\"button_right\"></div>","toppanel");
				dojo.addClass(button_right, "blst_button topbutton");
				dojo.connect(button_right, "click", dojo.hitch(this, this.onClickScrollRight));
				*/
			},
			
			spawnBattle : function(event)
			{
				//console.log("page::spawnBattle()");
				//is this move allowed?
				if(window.gameui.checkAction("action_spawnBattle"))
				{
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_spawnBattle.html", { 
						lock: true
						}, 
						 window.gameui, function( result ) {
							
							// What to do after the server call if it succeeded
							// (most of the time: nothing)
							
						 }, function( is_error) {

							// What to do after the server call in anyway (success or failure)
							// (most of the time: nothing)
						}
					);
				}
			},
			
			findBattle : function(event)
			{
				//console.log("page::findBattle()");
				//is this move allowed?
				if(window.gameui.checkAction('action_findBattle'))
				{
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_findBattle.html", { 
						lock: true
						}, 
						 window.gameui, function( result ) {
							
							// What to do after the server call if it succeeded
							// (most of the time: nothing)
							
						 }, function( is_error) {

							// What to do after the server call in anyway (success or failure)
							// (most of the time: nothing)
						}
					);
				}
			},
			
			playerCycleHand : function(event)
			{
				//console.log("page::playerCycleHand()");
				
				//is this move allowed?
				if(window.gameui.checkAction('action_playerCycleHand'))
				{
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_playerCycleHand.html", { 
						lock: true
						}, 
						 window.gameui, function( result ) {
							
							// What to do after the server call if it succeeded
							// (most of the time: nothing)
							
						 }, function( is_error) {

							// What to do after the server call in anyway (success or failure)
							// (most of the time: nothing)
						}
					);
				}
			},
			
			onClickZoomIn : function(event)
			{
				//console.log("page::onClickZoomIn()");
				/*
				this.map_view_scale = 1.0;
				this.map_view_scale_min = 0.1;
				this.map_view_scale_max = 10;
				this.map_view_scale_increment = 0.1;
				*/
				var new_map_scale = this.map_view_scale;
				if(new_map_scale + this.map_view_scale_increment <= this.map_view_scale_max)
				{
					new_map_scale += this.map_view_scale_increment;
					this.SetMapViewScale(new_map_scale);
					//console.log("new scale: " + new_map_scale);
				}
			},
			
			onClickZoomOut : function(event)
			{
				//console.log("page::onClickZoomOut()");
				var new_map_scale = this.map_view_scale;
				if(new_map_scale - this.map_view_scale_increment >= this.map_view_scale_min)
				{
					new_map_scale -= this.map_view_scale_increment;
					this.SetMapViewScale(new_map_scale);
					//console.log("new scale: " + new_map_scale);
				}
			},
			
			onClickScrollUp : function(event)
			{
				//console.log("page::onClickScrollUp()");
				var new_pos = this.camera_coords_world.y - this.GetCameraScrollIncrement();
				var edge_pos = this.getBoundsMinY();
				if(new_pos < edge_pos)
				{
					new_pos = edge_pos;
					//console.log("cant go further: " + edge_pos);
				}
				if(new_pos != this.camera_coords_world.y)
				{
					this.MoveCameraWorld(this.camera_coords_world.x, new_pos);
					//console.log("new camera y: " + new_pos);
				}
			},
			
			onClickScrollDown : function(event)
			{
				//console.log("page::onClickScrollDown()");
				var new_pos = this.camera_coords_world.y + this.GetCameraScrollIncrement();
				var edge_pos = this.getBoundsMaxY();
				if(new_pos > edge_pos)
				{
					new_pos = edge_pos;
					//console.log("cant go further: " + edge_pos);
				}
				if(new_pos != this.camera_coords_world.y)
				{
					this.MoveCameraWorld(this.camera_coords_world.x, new_pos);
					//console.log("new camera y: " + new_pos);
				}
			},
			
			onClickScrollLeft : function(event)
			{
				//console.log("page::onClickScrollLeft()");
				var new_pos = this.camera_coords_world.x - this.GetCameraScrollIncrement();
				var edge_pos = this.getBoundsMinX();
				if(new_pos < edge_pos)
				{
					new_pos = edge_pos;
					//console.log("cant go further: " + edge_pos + ", camera x: " + this.camera_coords_world.x);
				}
				if(new_pos != this.camera_coords_world.x)
				{
					this.MoveCameraWorld(new_pos, this.camera_coords_world.y);
					//console.log("new camera x: " + new_pos);
				}
			},
			
			onClickScrollRight : function(event)
			{
				//console.log("page::onClickScrollRight()");
				var new_pos = this.camera_coords_world.x + this.GetCameraScrollIncrement();
				var edge_pos = this.getBoundsMaxX();
				if(new_pos > edge_pos)
				{
					new_pos = edge_pos;
					//console.log("cant go further: " + edge_pos + ", camera x: " + this.camera_coords_world.x);
				}
				if(new_pos != this.camera_coords_world.x)
				{
					this.MoveCameraWorld(new_pos, this.camera_coords_world.y);
					//console.log("new camera x: " + new_pos);
				}
			},
			
			getBoundsRect : function()
			{
				return {min_x: this.getBoundsMinX(), min_y: this.getBoundsMinY(), max_x: this.getBoundsMaxX(), max_y: this.getBoundsMaxY()}
			},
			
			applyBoundedCoords : function(coords)
			{
				var bounds_rect = this.getBoundsRect();
				if(coords.x < bounds_rect.min_x)
				{
					coords.x = bounds_rect.min_x;
				}
				if(coords.x > bounds_rect.max_x)
				{
					coords.x = bounds_rect.max_x;
				}
				if(coords.y < bounds_rect.min_y)
				{
					coords.y = bounds_rect.min_y;
				}
				if(coords.y > bounds_rect.max_y)
				{
					coords.y = bounds_rect.max_y;
				}
				
				return coords;
			},
			
			getBoundsMaxX : function()
			{
				//var edgepos = this.viewmax_x;
				var edgepos = (this.map_view_scale - 1) * (this.viewmax_x/2);
				return edgepos;
			},
			getBoundsMaxY : function()
			{
				//return this.world_maxy;
				//var edgepos = this.viewmax_x;
				var edgepos = (this.map_view_scale - 1) * (this.viewmax_y/2);
				return edgepos;
			},
			getBoundsMinX : function()
			{
				return 0;//-(this.map_view_scale - 1) * (this.viewmax_x/2);
			},
			getBoundsMinY : function()
			{
				return 0;//-(this.map_view_scale - 1) * (this.viewmax_y/2);
			},
			
			playerSpawnTestArmy : function(event)
			{
				//console.log("page::onClickPlayerHandTile()");
				
				//is this move allowed?
				if(window.gameui.checkAction('action_playerSpawnTestArmy'))
				{
					//pick a random province and spawn a new army stack there
					//as provinces are only stored client side, we have to pick a random province here
					//var province_id = window.gameui.provinces[Math.floor((Math.random() * window.gameui.provinces.length))].name;
					//console.log("Clicked on " + event.target.id + " now spawning army at " + province_div_name);
					
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_playerSpawnTestArmy.html", { 
						lock: true
						}, 
						 window.gameui, function( result ) {
							
							// What to do after the server call if it succeeded
							// (most of the time: nothing)
							
						 }, function( is_error) {

							// What to do after the server call in anyway (success or failure)
							// (most of the time: nothing)
						}
					);
				}
			},
			
			playerDebugAction : function(event)
			{
				console.log("page::playerDebugAction()");
				//is this move allowed?
				if(window.gameui.checkAction('action_playerDebug'))
				{
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_playerDebug.html", { 
						lock: true
						}, 
						 window.gameui, function( result ) {
							
							// What to do after the server call if it succeeded
							// (most of the time: nothing)
							
						 }, function( is_error) {

							// What to do after the server call in anyway (success or failure)
							// (most of the time: nothing)
						}
					);
				}
			},
			
		});
		
		return instance;
	}
);
