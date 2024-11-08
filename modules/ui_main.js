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
		
		var instance = declare("_ui_main", null, {
			//put your functions here
			
			AddMainWindow : function(gamedatas)
			{
				//console.log("page::AddMainWindow()");
				//check if this ui has already been created
				if(dojo.byId("centrepanel"))
				{
					return;
				}
				
				//convert some string values to int 
				for(var player_id in gamedatas.players)
				{
					//get the updated faction id for this player from the server
					var player_info = gamedatas.players[player_id];
					player_info.freebuildpoints = Number(player_info.freebuildpoints);
					//todo: any others that need to be converted to numbers here?
				}
				
				//create the basic framework of the window
				const gamewindow = dojo.byId("gamewindow");
				
				//gamewindow children
				const centrepanel = dojo.place("<div id=\"centrepanel\"></div>","gamewindow");
				const leftpanel = dojo.place("<div id=\"leftpanel\"></div>","gamewindow");
				
				//centrepanel children
				const gamemap = dojo.place("<div id=\"gamemap\"></div>","centrepanel");
				const toppanel = dojo.place("<div id=\"toppanel\"></div>","centrepanel");
				const provinceclickareas = dojo.place("<map id=\"provinceclickareas\" name=\"provinceclickareas\"></map>","centrepanel");
				blank_img_url = g_gamethemeurl + "/img/blank.png";
				var droppable_img = dojo.place("<img id=\"droppable_map\" class=\"droppable_map\" src=\"" + blank_img_url + "\" usemap=\"#provinceclickareas\"></img>","centrepanel");
				
				//leftpanel children
				dojo.place("<div id=\"playercards\"></div>","leftpanel");
				dojo.place("<div id=\"selected_army\"></div>","leftpanel");
				dojo.place("<div id=\"bag\"></div>","leftpanel");	//this is probably unneeded but i'll leave it for now
				
				//gamemap children
				const canvas = dojo.place("<canvas id=\"province_overlay_canvas\"></canvas>","gamemap");
				
				//a canvas element expects its height and width property to be set
				//so trying to set  height and width using CSS will mess up the scaling
				//here we do a little hack to properly set the dimensions so it will scale nicely
				
				//todo: this is a nice square layout but it could be more responsive if we scale to a rectangular layout on certain resolutions
				//this is not a small job so lets leave it at square for the moment and have empty space for those wide monitors
				var box = dojo.marginBox(canvas);
				//console.log(box);
				canvas.width = box.w;
				canvas.height = box.h;
				
				//Setup the zindex layering so that click detection works properly
				//todo: where am i doing this now? does it need a refactoring pass?
				//no longer using zindex here, i think it was over complicating this
				/*
				GameLayerArmy : function()
				GameLayerMovementRouteRender : function()
				GameLayerProvinceInteract : function()
				GameLayerProvinceOverlayRender : function()
				GameLayerBackgroundRender : function()
				GameLayerDefault : function()
				*/
				
				//dojo.style(gamewindow, 'zIndex', this.GameLayerDefault());
				//dojo.style(centrepanel, 'zIndex', this.GameLayerDefault());
				//dojo.style(gamemap, 'zIndex', this.GameLayerMap());
				//dojo.style(canvas, 'zIndex', this.GameLayerDefault());
				//dojo.style(provinceclickareas, 'zIndex', this.GameLayerProvinceInteract());
				dojo.style(leftpanel, 'zIndex', this.GameLayerLeftpanel());
				//dojo.style(gamemap, 'zIndex', this.GameLayerMap());
				
				//player input callbacks
				//dojo.connect(gamemap, "onkeydown ", dojo.hitch(this, this.onKeyDown));
				dojo.connect(gamemap, "click", dojo.hitch(this, this.onClickGamemap));
				dojo.connect(canvas, "click", dojo.hitch(this, this.onClickCanvas));
				dojo.connect(centrepanel, "click", dojo.hitch(this, this.onClickCentrepanel));
				//dojo.connect(provinceclickareas, "click", dojo.hitch(this, this.onClickProvinceAreas));
				
				centrepanel.onwheel = this.onMouseWheelZoom;
				
				//these are created programmatically because it's a little easier than having them as a block of strings
				this.CreateFactionTileStrings();
				
				//create the various UI elements
				this.SetupTopUI(canvas);
				this.SetupProvinces();
				this.SetupBackgroundMap(canvas);
				this.SetupProvinceUI(canvas);
				this.SetupArmies(gamedatas);
				this.SetupVillages(gamedatas);
				this.SetupCitadels();
				this.SetupLeftUI(gamedatas);
				this.SetupPlayerboards();
				this.SetUIProvinceSelectionEmpty();
				
				this.SetDefaultMapInteraction();
			},
			
			SetDefaultMapInteraction : function()
			{
				//map click interactions
				this.SetProvinceOverlayMode(this.OVERLAY_SELECT);
				this.on_select_map_overlay_callback = this.OnProvinceSelectDefaultMapOverlay;
				this.on_unselect_map_overlay_callback = this.OnProvinceUnselectDefaultMapOverlay;
			},
			
			SetupProvinces : function()
			{
				for (var i in this.provinces)
				{
					var cur_province = this.provinces[i];
					this.provinces_by_name[cur_province.name] = cur_province;
				}
			},
			
			SetupArmies : function(gamedatas)
			{
				//console.log("Creating armies...");
				//console.log(gamedatas.armies);
				
				//instead of handling selection here, simply have the player reselect an army if they refresh the window
				for(var army_id_string in gamedatas.armies_by_id_string)
				{
					//get the info on this army from the server
					var army_info = gamedatas.armies_by_id_string[army_id_string];
					//console.log("army_info:");
					//console.log(army_info);
					
					//split off any castles to make into a separate army stack in this province
					var castle_tile_infos = [];
					for(var tile_id in army_info.tiles)
					{
						var tile_info = army_info.tiles[tile_id];
						if(this.IsTileTypeCastle(tile_info.type_arg))
						{
							//console.log("found castle tile_info:");
							//console.log(tile_info);
							//remember this one for later
							castle_tile_infos[tile_id] = tile_info;
						}
					}
					
					//now remove them from the main army list of tiles
					var create_castle_army = false;
					for(var tile_id in castle_tile_infos)
					{
						//console.log("found castle tile_id: " + tile_id);
						create_castle_army = true;
						delete army_info.tiles[tile_id];
					}
					
					//now we shall create the castle army
					if(create_castle_army)
					{
						//console.log("creating castles army out of " + army_info.prov_name);
						var castle_army_info = {};
						
						//create a shallow copy of the army_info
						//as army_info is just a database export of basic datatypes, this is future proofing it for any changes i want to make to the db
						for(var property in army_info)
						{
							castle_army_info[property] = army_info[property];
						}
						
						//get the castle tile infos
						castle_army_info['tiles'] = castle_tile_infos;
						
						//create a temp id so it doesnt clash with the regular army
						castle_army_info['army_id'] = this.getTempArmyId();
						castle_army_info['army_id_string'] = this.GetArmyIdString(castle_army_info['army_id'], castle_army_info['player_id']);
						
						//create the army
						var castle_army_stack = this.CreateCastlesArmy(castle_army_info);
					}
					
					//create the remaining units into a regular army
					var army_stack = this.CreateArmy(army_info);
				}
			},
			
			RemoveMainWindow : function()
			{
				dojo.destroy("leftpanel");
				dojo.destroy("centrepanel");
			},
			
		});
		
		return instance;
	}
);
