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
				//check if this ui has already been created
				if(dojo.byId("centrepanel"))
				{
					return;
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
				var droppable_img = dojo.place("<img id=\"droppable_map\" class=\"droppable_map\" src=\"/img/blank.png\" usemap=\"#provinceclickareas\"></img>","centrepanel");
				
				//leftpanel children
				dojo.place("<div id=\"playercards\"></div>","leftpanel");
				dojo.place("<div id=\"selected_army\"></div>","leftpanel");
				dojo.place("<div id=\"bag\"></div>","leftpanel");	//this is probably unneeded but i'll leave it for now
				
				//gamemap children
				const canvas = dojo.place("<canvas id=\"province_overlay_canvas\" width=\"1039px\" height=\"1185px\"></canvas>","gamemap");
				
				//no longer using zindex here, i think it was over complicating this
				//dojo.style(gamewindow, 'zIndex', this.GameLayerDefault());
				//dojo.style(centrepanel, 'zIndex', this.GameLayerDefault());
				//dojo.style(gamemap, 'zIndex', this.GameLayerMap());
				//dojo.style(canvas, 'zIndex', this.GameLayerDefault());
				//dojo.style(provinceclickareas, 'zIndex', this.GameLayerProvinceInteract());
				
				//Setup the zindex layering so that click detection works properly
				//todo: where am i doing this now? does it need a refactoring pass?
				/*
				GameLayerArmy : function()
				GameLayerMovementRouteRender : function()
				GameLayerProvinceInteract : function()
				GameLayerProvinceOverlayRender : function()
				GameLayerBackgroundRender : function()
				GameLayerDefault : function()
				*/
				//dojo.style(gamemap, 'zIndex', this.GameLayerProvinceInteract());
				//dojo.style(canvas, 'zIndex', this.GameLayerProvinceOverlayRender());
				//dojo.style(canvas, 'zIndex', this.GameLayerBackgroundRender());
				//dojo.style(provinceclickareas, 'zIndex', this.GameLayerProvinceInteract());
				//dojo.style(leftpanel, 'zIndex', this.GameLayerDefault());
				
				//player input callbacks
				//dojo.connect(gamemap, "onkeydown ", dojo.hitch(this, this.onKeyDown));
				dojo.connect(gamemap, "click", dojo.hitch(this, this.onClickGamemap));
				dojo.connect(canvas, "click", dojo.hitch(this, this.onClickCanvas));
				dojo.connect(centrepanel, "click", dojo.hitch(this, this.onClickCentrepanel));
				//dojo.connect(provinceclickareas, "click", dojo.hitch(this, this.onClickProvinceAreas));
				
				//these are created programmatically because it's a little easier than having them as a block of strings
				this.CreateFactionTileStrings();
				
				//create the various UI elements
				this.SetupTopUI(canvas);
				this.SetupProvinces();
				this.SetupBackgroundMap(canvas);
				this.SetupProvinceUI(canvas);
				this.SetupArmies(gamedatas);
				this.SetupVillages(gamedatas);
				//this.SetupCitadels(gamedatas);
				this.SetupLeftUI(gamedatas);
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
				for(var army_id in gamedatas.armies)
				{
					var army_info = gamedatas.armies[army_id];
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
