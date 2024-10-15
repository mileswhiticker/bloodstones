/*
 * ------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * bloodstones implementation : © Miles Whiticker <miles.whiticker@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */

/*
const BATTLE_NONE = 0;
const BATTLE_START = 1;
const BATTLE_TILE = 2;
const BATTLE_WAIT = 3;
*/
define(
	[
		"dojo",
		"dojo/_base/declare"
	],
	function (dojo, declare){
		
		//this is a helper class for passing around and modifying colour values, as well as converting between them;
		dojo.declare("Colour", null, {
			constructor: function(r,g,b,a){
				this.r = r;
				this.g = g;
				this.b = b;
				this.a = a;
			},

			componentToHex : function(c) {
				var hex = c.toString(16);
				return hex.length == 1 ? "0" + hex : hex;
			},

			rgbToHex : function(r, g, b, a) {
				return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b) + this.componentToHex(a);
			},
			
			rgba : function(){
				return "rgb(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
			},
			
			hex : function(){
				return this.rgbToHex(this.r,this.g,this.b,this.a);
			},
			
			addRGB(new_colour)
			{
				this.r += new_colour.r;
				if(this.r > 255)
				{
					this.r = this.r - 255;
				}
				this.g += new_colour.g;
				if(this.g > 255)
				{
					this.g = this.g - 255;
				}
				this.b += new_colour.b;
				if(this.b > 255)
				{
					this.b = this.b - 255;
				}
			},
			
			copy : function()
			{
				return Colour(this.r, this.g, this.b, this.a);
			}
			
		});
		
		var instance = declare("_ui", null, {
			//put your functions here

			RegenerateMapUI : function(do_debug)
			{
				var canvas = this.getProvinceOverlayCanvas();
				var context = canvas.getContext("2d");
				this.ClearCanvas();
				
				for (let i in this.provinces)
				{
					//grab the next province object
					let province = this.provinces[i];
					this.RegenerateProvinceUI(province, context, null, do_debug);
				}
				this.UpdateCurrentOverlayMode();
			},

			// onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
			//                        action status bar (ie: the HTML links in the status bar).
			//        
			onUpdateActionButtons: function( stateName, args )
			{
				//console.log( 'onUpdateActionButtons: '+stateName );
				//console.log(args);
				
				
				//reset the current player battle stage
				//var new_battle_stage = this.current_player_battle_stage;
				
				//!this.isSpectator
				//if(this.isCurrentPlayerActive())
				switch( stateName )
				{
/*               
				 Example:
 
				 case 'myGameState':
					
					// Add 3 action buttons in the action status bar:
					
					this.addActionButton( 'button_1_id', _('Button 1 label'), 'onMyMethodToCall1' ); 
					this.addActionButton( 'button_2_id', _('Button 2 label'), 'onMyMethodToCall2' ); 
					this.addActionButton( 'button_3_id', _('Button 3 label'), 'onMyMethodToCall3' ); 
					break;
*/
					/*
					case 'battleTile':
					{
						new_battle_stage = BATTLE_TILE;
						break;
					}
					
					case 'battleWait':
					{
						new_battle_stage = BATTLE_WAIT;
						break;
					}
					*/
				}
				
			},
			
			///////////////////////////////////////////////////
			//// Game & client states
			
			// onEnteringState: this method is called each time we are entering into a new game state.
			//                  You can use this method to perform some user interface changes at this moment.
			//
			onEnteringState: function( stateName, args )
			{
				var active_player = this.gamedatas.players[this.getActivePlayerId()];
				if(active_player != null)
				{
					console.log( 'Entering state: '+stateName + " " + active_player.name + " " + active_player.id );
				}
				else
				{
					console.log( 'Entering state: '+stateName );
				}
				console.log(args);
				
				switch( stateName )
				{
					case("factionSelect"):
					{
						this.AddFactionSelectUI(this.gamedatas);
						break;
					}
					case("initNewGame"):
					{
						this.ResetPlayerInfo(args.args.players);
						this.AddMainWindow(this.gamedatas);
						break;
					}
					case 'citadelPlacement':
					{
						if(this.isCurrentPlayerActive())
						{
							this.possible_citadel_provinces = args.args.possible_citadel_provinces;
							this.UIStateCitadelPlacement(args);
							this.BeginCitadelState();
							this.SetProvinceOverlayMode(this.OVERLAY_CITADEL);
						}
						else
						{
							this.SetProvinceOverlayMode(this.OVERLAY_SELECT);
						}
						break;
					}
					case("freeBuild"):
					{
						if(this.getCurrentPlayerFactionId() != this.FACTION_CHAOSHORDE)
						{
							var current_player_id = this.getCurrentPlayer();
							var current_player_info = this.getCurrentPlayerInfo();
							if(current_player_info.freebuildpoints > 0)
							{
								this.buildable_provinces = args.args.buildable_provinces[current_player_id];
								this.AddFreeBuildUI();
								
								//5 free build points
								this.AddActionPaidAmount(current_player_info.freebuildpoints);
								this.SetProvinceOverlayMode(this.OVERLAY_BUILD);
							}
							else
							{
								this.SetProvinceOverlayMode(this.OVERLAY_SELECT);
							}
						}
						else
						{
							this.SetProvinceOverlayMode(this.OVERLAY_SELECT);
						}
						break;
					}
					case("freeBuild_chaosHorde"):
					{
						if(this.getCurrentPlayerFactionId() == this.FACTION_CHAOSHORDE)
						{
							var current_player_id = this.getCurrentPlayer();
							this.buildable_provinces = args.args.buildable_provinces[current_player_id];
							this.buildable_provinces_backup = args.args.buildable_provinces[current_player_id];
							
							//5 free build points
							//todo: what if the chaos horde player has none left? 
							//mabye a sanity check because the state should have progressed...
							var current_player_info = this.getCurrentPlayerInfo();
							if(current_player_info.freebuildpoints > 0)
							{
								this.AddFreeBuildUI();
								this.AddActionPaidAmount(current_player_info.freebuildpoints);
								this.SetProvinceOverlayMode(this.OVERLAY_BUILD);
							}
							else
							{
								this.SetProvinceOverlayMode(this.OVERLAY_SELECT);
							}
						}
						else
						{
							this.SetProvinceOverlayMode(this.OVERLAY_SELECT);
						}
						break;
					}
					case 'nextPlayer':
					{
						//only 1 capture action allowed per player per turn so reset this value
						this.gamedatas.village_captures_available = 1;
						break;
					}
					case 'playerCapture':
					{
						if(this.isCurrentPlayerActive())
						{
							this.possible_capture_infos = args.args.possible_capture_infos;
							//console.log(args.args.possible_capture_infos);
							this.UIStatePlayerCapture(args);
							this.BeginCaptureState();
							this.SetProvinceOverlayMode(this.OVERLAY_CAPTURE);
						}
						else
						{
							this.SetProvinceOverlayMode(this.OVERLAY_SELECT);
						}
						break;
					}
					case 'playerUndead':
					{
						if(this.isCurrentPlayerActive())
						{
							this.UIStatePlayerUndead(args);
							this.BeginUndeadState();
							this.SetProvinceOverlayMode(this.OVERLAY_UNDEAD);
						}
						else
						{
							this.SetProvinceOverlayMode(this.OVERLAY_SELECT);
						}
						break;
					}
					case 'playerMain':
					{
						if(this.isCurrentPlayerActive())
						{
							//this is needed for chaos horde
							this.possible_capture_infos = args.args.possible_capture_infos;
							
							this.buildable_provinces = args.args.buildable_provinces;
							this.UIStatePlayerMain(this.STATE_MAIN_DEFAULT);
						}
						else
						{
							this.SetProvinceOverlayMode(this.OVERLAY_SELECT);
						}
						break;
					}
					case 'chooseWithdraw':
					{
						this.retreat_prov_options = args.args.retreat_prov_options;
						this.UIStateChooseWithdraw(args);
						if(this.isCurrentPlayerActive())
						{
							this.SetProvinceOverlayMode(this.OVERLAY_WITHDRAWRETREAT);
						}
						else
						{
							this.SetProvinceOverlayMode(this.OVERLAY_BATTLE);
							this.UpdateCurrentOverlayMode();
						}
						break;
					}
					case 'setupBattle':
					{
						//hide the action button bar
						this.DestroyBottomPanel();
						break;
					}
					case 'battleTile':
					{
						//update the battle tiles
						this.SetProvinceOverlayMode(this.OVERLAY_BATTLE);
						this.UIStateBattleTile(args);
						break;
					}
					case 'battleEnd':
					{
						//update the titles
						this.SetProvinceOverlayMode(this.OVERLAY_BATTLE);
						this.UIStateBattleEnd(args);
						break;
					}
					
					case 'retreat':
					{
						this.retreat_prov_options = args.args.retreat_prov_options;
						this.UIStateBattleRetreat(args);
						if(this.isCurrentPlayerActive())
						{
							this.SetProvinceOverlayMode(this.OVERLAY_WITHDRAWRETREAT);
						}
						else
						{
							this.SetProvinceOverlayMode(this.OVERLAY_SELECT);
						}
						break;
					}
					case 'battleCleanup':
					{
						this.UIStateBattleCleanup(args);
						break;
					}
					case 'playerVillages':
					{
						if(this.isCurrentPlayerActive())
						{
							this.buildable_province_names = args.args.possible_village_provinces;
							this.UIStatePlayerVillages(args);
							this.BeginVillageState();
							this.SetProvinceOverlayMode(this.OVERLAY_VILLAGE);
						}
						else
						{
							this.SetProvinceOverlayMode(this.OVERLAY_SELECT);
						}
						break;
					}
					case("gameOver"):
					{
						//todo: some kind of scorescreen here
						break;
					}
				}
			},
			
			// onLeavingState: this method is called each time we are leaving a game state.
			//                 You can use this method to perform some user interface changes at this moment.
			//
			onLeavingState: function( stateName )
			{
				var active_player = this.gamedatas.players[this.getActivePlayerId()];
				if(active_player != null)
				{
					console.log( 'Leaving state: '+stateName + " " + active_player.name + " " + active_player.id );
				}
				else
				{
					console.log( 'Leaving state: '+stateName );
				}
				
				switch(stateName)
				{
				
					/* Example:
					
					case 'myGameState':
					
						// Hide the HTML block we are displaying only during this game state
						dojo.style( 'my_html_block_id', 'display', 'none' );
						
						break;
					*/
					
					case("freeBuild_chaosHorde"):
					{
						this.buildable_provinces_backup = null;
						break;
					}
					
					case('playerCapture'):
					{
						this.possible_capture_infos = [];
						break;
					}
					
					case('factionSelect'):
					{
						this.RemoveFactionSelectUI();
						break;
					}
					
					case('playerVillages'):
					{
						this.DestroyBottomPanel();
						break;
					}
				}
				
				/*if(this.battle_states.includes(stateName))
				{
					this.LeaveBattleState(args);
				}*/
			},

			///////////////////////////////////////////////////
			//// Player's action
			
			/*
			
				Here, you are defining methods to handle player's action (ex: results of mouse click on 
				game objects).
				
				Most of the time, these methods:
				_ check the action is possible at this game state.
				_ make a call to the game server
			
			*/
			
			//can't use "this" keyword in callbacks because they will have the global context (?)
			//todo: use bind() or call() instead of the global variable
			//see https://www.w3schools.com/js/js_function_bind.asp
			
			//todo: use jquery data() function to pass info in stacks and buttons etc
			//trying to pass around data by concatenating to the end of the id string is dumb
			//see https://www.geeksforgeeks.org/jquery-data-with-examples/
			
			//some other helpful functions from bga wiki that i might need:
			/*
			checkPossibleActions(action: string): boolean
			checkLock(nomessage?: boolean): boolean
			*/
			
			onKeyDown : function(event)
			{
				//console.log(event.key);
				//todo: something is not correctly triggering here
				switch(event.key)
				{
					case 'w':
					{
						event.stopPropagation();
						this.ScrollGamewindowVertical(1);
						break;
					}
					case 's':
					{
						event.stopPropagation();
						this.ScrollGamewindowVertical(-1);
						break;
					}
					case 'a':
					{
						event.stopPropagation();
						this.ScrollGamewindowHorizontal(-1);
						break;
					}
					case 'd':
					{
						event.stopPropagation();
						this.ScrollGamewindowHorizontal(1);
						break;
					}
					default:
					{
						break;
					}
				}
			},
			
			onMouseWheelZoom : function(ev)
			{
				//console.log("page::onMouseWheelZoom()");
				//console.log(ev);
				
				//stop the page from scrolling
				ev.preventDefault();
				
				if(ev.deltaY > 0)
				{
					gameui.MapZoomOut();
				}
				else if(ev.deltaY < 0)
				{
					gameui.MapZoomIn();
				}
				
			},
			
			MapZoomIn : function()
			{
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
			
			MapZoomOut : function()
			{
				var new_map_scale = this.map_view_scale;
				if(new_map_scale - this.map_view_scale_increment >= this.map_view_scale_min)
				{
					new_map_scale -= this.map_view_scale_increment;
					this.SetMapViewScale(new_map_scale);
					//console.log("new scale: " + new_map_scale);
				}
			},
			
			onClickCentrepanel : function(event)
			{
				//console.log("page::onClickCentrepanel()");
				
				if(window.gameui.selected_army != null)
				{
					//this.UnselectArmyStack();
				}
			},
			
			onClickCanvas : function(event)
			{
				//console.log("page::onClickCanvas()");
			},
			
			onClickDroppable_map : function(event)
			{
				//console.log("page::onClickDroppable_map()");
			},
			
			onClickGamemap : function(event)
			{
				//console.log("page::onClickGamemap()");
			},
			
			//most of this functionality has now been moved to page::ServerSkipAction()
			/*onClickEndTurnButton : function(event)
			{
				//console.log("page::onClickEndTurnButton()");
				
				if(!this.isCurrentPlayerActive())
				{
					//sanity check, this shouldnt happen
					return;
				}
				
				//is this move allowed?
				if(window.gameui.checkAction('action_playerEndTurn'))
				{
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_playerEndTurn.html", {
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
			},*/
			
			onClickBuildVillagesButton : function(event)
			{
				//is this move allowed?
				if(window.gameui.checkAction('action_beginBuildVillages'))
				{
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_beginBuildVillages.html", {
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
			
			onClickUndeadButton : function(event)
			{
				//is this move allowed?
				if(window.gameui.checkAction('action_playerUndead'))
				{
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_playerUndead.html", {
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
			
			//returns z values to populate the zindex of game elements
			//these getters are ordered by height, with each successive function adding +1 to the layer before
			//the default starting layer is in negatives eg -20, with the highest possible layer being -1 as z=0 is the bga z depth which must always be above the game
			//this way lets me easily reshuffle them while the game is still in development
			//todo: replace these with macro defines?
			
			GameLayerFloat : function()
			{
				//above everything else
				return 9999;
			},
			
			GameLayerTopPanel : function()
			{
				return this.GameLayerBattlewindow() + 1;
			},
			
			GameLayerPaywindow : function()
			{
				return this.GameLayerLeftpanel() + 1;
			},
			
			GameLayerLeftpanel : function()
			{
				return this.GameLayerBattlewindow() + 1;
			},
			
			GameLayerBattlewindow : function()
			{
				return this.GameLayerBottomPanel() + 1;
			},
			
			GameLayerBottomPanel : function()
			{
				return this.GameLayerProvinceInteract() + 1;
			},
			
			GameLayerDialogBase : function()
			{
				return this.GameLayerProvinceInteract() + 1;
			},
			
			GameLayerProvinceInteract : function()
			{
				return this.GameLayerArmy() + 1;
			},
			
			GameLayerArmy : function()
			{
				return this.GameLayerArmyZone() + 1;
			},
			
			GameLayerArmyZone : function()
			{
				return this.GameLayerCanvas() + 1;
			},
			
			GameLayerCanvas : function()
			{
				return this.GameLayerMap() + 1;
			},
			
			GameLayerMap : function()
			{
				return this.GameLayerDefault() -1;
			},
			
			GameLayerDefault : function()
			{
				return 0;
			},
			
			EnableButton : function(button_id)
			{
				var my_button = dojo.byId(button_id);
				
				var current_player = this.gamedatas.players[this.getActivePlayerId()];
				my_button.style.color = this.faction_strings[current_player.factionid].fontColour;
				my_button.style.removeProperty("box-shadow");	//revert to the css box shadow
				//console.log("EnableButton(" + button_id + ")");
				//console.log(my_button.style);
				//dojo.addClass('end_turn_button', 'disabled');		//for bga button helper
			},
			
			DisableButton : function(button_id)
			{
				var my_button = dojo.byId(button_id);
				my_button.style.color = "black";
				my_button.style.boxShadow = "0px 0px 0px 0px";
				//dojo.addClass('end_turn_button', 'disabled');
			},
			
			ClearCanvas : function()
			{
				//console.log("page::RemoveMoveModeUI()");
				var canvas = dojo.byId("province_overlay_canvas");
				var context = canvas.getContext("2d");
				
				context.clearRect(0, 0, canvas.width, canvas.height);
			},
			
			getProvinceOverlayCanvas : function()
			{
				return dojo.byId("province_overlay_canvas");
			},
			
			getNextCycleColour : function()
			{
				this.next_debug_colour.addRGB(this.colour_cycle);
				var next_colour = this.next_debug_colour.copy();
				return next_colour;
			},
			
			getProvinceDebugColour : function(province_info)
			{
				var prov_id = Number(province_info.name.substring(4));
				//console.log("page::getProvinceDebugColour(" + prov_id + ")");
				
				//three components, each component is 0-255
				//there are 75 provinces
				var base = prov_id-15;
				var max = 75;
				var r = 0;
				var g = 0;
				var b = 0;
				if(base > 40)
				{
					r = 255*(base+30)/max;
				}
				else if(base > 20)
				{
					g = 255*(base+30)/max;
				}
				else
				{
					b = 255*(base+30)/max;
				}
				var new_colour = Colour(r,g,b,255);
				//console.log(new_colour);
				return new_colour;
				
				//for simplicity
				return this.getNextCycleColour();
			},
			
			setArmyUIScale : function(newScale)
			{
				//console.log("page::setArmyUIScale(" + newScale + ")");
				this.army_tile_scale = newScale;
				dojo.query(".map_army_transformable").style("transform", "scale(" + newScale + ")");
				
				for(var i=0; i<this.all_army_zones.length; i++)
				{
					var cur_zone = this.all_army_zones[i];
					cur_zone.updateDisplayNewDimensions(this.army_tile_scale * this.zone_item_width_base, this.army_tile_scale * this.zone_item_height_base);
				}
			},
			
			UIActiveTitle : function(div_id)
			{
				dojo.removeClass(div_id, "blst_button");
				dojo.removeClass(div_id, "blst_button_disabled");
				dojo.removeClass(div_id, "inactive_phase");
			},
			
			UIInactiveTitle : function(div_id)
			{
				dojo.removeClass(div_id, "blst_button");
				dojo.removeClass(div_id, "blst_button_disabled");
				dojo.addClass(div_id, "inactive_phase");
			},
			
			UIActiveButton : function(div_id)
			{
				dojo.addClass(div_id, "blst_button");
				dojo.removeClass(div_id, "blst_button_disabled");
				dojo.removeClass(div_id, "inactive_phase");
			},
			
			UIInactiveButton_smallPhases : function()
			{
				//console.log("page::UIInactiveButton_smallPhases()");
				this.UIInactiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_CAPTURE));
				this.UIInactiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_BUILD));
				this.UIInactiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_MOVE));
				this.UIInactiveButton(this.GetSmallPhaseButtonDivId(gameui.STATE_MAIN_BATTLE));
			},
			
			UIInactiveButton : function(div_id)
			{
				dojo.addClass(div_id, "blst_button");
				dojo.addClass(div_id, "blst_button_disabled");
				dojo.addClass(div_id, "inactive_phase");
			},
			
		});
		
		return instance;
	}
);