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
		"dojo/_base/declare",
		"dojo/_base/fx",
		"dojo/fx"	//coreFx contains some advanced helpers not in baseFx
	],
	function (dojo, declare, fx, coreFx){
		
		var instance = declare("_ui_army", null, {
			//put your functions here
			
			SelectArmyStack : function(new_selected_army)
			{
				//console.log("page::SelectArmyStack(" + new_selected_army.id_string + ")");
				//console.log(new_selected_army);
				if(window.gameui.selected_army != null)
				{
					console.log("ERROR: Trying to select army " + new_selected_army.id_num + " but already selected " + window.gameui.selected_army.id_num);
				}
				else if(new_selected_army != null)
				{
					//select it in the code, have it handle its own ui updates
					window.gameui.selected_army = new_selected_army;
					window.gameui.selected_army.selectStack();
					
					//is there already a selected army?
					var selected_army_display_stack = window.gameui.selected_army_display_stack
					if(selected_army_display_stack)
					{
						//sanity check
						console.log("ERROR: window.gameui.selected_army_display_stack already exists");
						console.log(selected_army_display_stack);
						return;
					}
					
					//setup the title text, replacing the old one if it exists
					dojo.query(".ui_stack_title").forEach(dojo.destroy);
					var title_div;
					var selected_army_div = dojo.byId("selected_army");
					if(new_selected_army.player_id == gameui.getCurrentPlayer())
					{
						title_div = dojo.place("<h1 class=\"ui_stack_title\">" + _("Your Army") + "</h1>", selected_army_div);
					}
					else
					{
						title_div = dojo.place("<h1 class=\"ui_stack_title\">" + _("Enemy Army") + "</h1>", selected_army_div);
					}
					
					//province info for this army
					var prov_id = this.GetProvinceIdFromName(new_selected_army.prov_name);
					var province_text = title_div = dojo.place("<div class=\"ui_selected_text\">" + this.GetProvinceNameUIString(prov_id) + "</div>", selected_army_div);
					
					//calculated battle strength if attacked here
					var translated = dojo.string.substitute( _("If attacked here, these ${num} tiles will have a +${strength} bonus in combat"), {
						num: new_selected_army.items.length,
						strength: new_selected_army.GetArmyDefensiveBonus()
						} );
					var strength_text = title_div = dojo.place("<div class=\"ui_selected_text\">" + translated + "</div>", selected_army_div);
					
					//useful hint for the player
					if(new_selected_army.player_id == gameui.getCurrentPlayer())
					{
						var hint_text = _("All units below will move. Click on units here to deselect them and leave them in place.");
						var hint_div = dojo.place("<div class=\"ui_selected_text\">" + hint_text + "</div>", selected_army_div);
					}
					
					//now show the tiles in this army
					selected_army_display_stack = new modules.TileStack();
					selected_army_display_stack.createAsArmySelection(this, "selected_army", new_selected_army);
					window.gameui.selected_army_display_stack = selected_army_display_stack;
					
					//highlight the province of the selected army
					this.UpdateCurrentOverlayMode();
				}
				else
				{
					//console.log("ERROR: Trying to select a null army");
				}
			},
			
			GetArmySelectionStackId : function()
			{
				return "army_selection_stack";
			},
			
			/*GetSelectedTileIdString : function(tile_id)
			{
				//this is unused but im leaving it here just in case
				return this.GetArmySelectionStackId() + "_item_" + tile_id;
			},*/
			
			GetSelectedTileImageIdString : function(tile_id)
			{
				return this.GetArmySelectionStackId() + "_item_" + tile_id;
			},
			
			/*GetTileIdFromImage : function(tile_image_id)
			{
				return tile_image_id.slice(20);
			},*/
			
			GetArmySelectedTileId : function(tile_image_id)
			{
				//console.log("page::GetArmySelectedTileId(" + tile_image_id + ")");
				
				//format: "army_selection_stack_item_XX" where XX is the tile id set by the Deck in php
				var tile_id = tile_image_id.slice(26);
				
				//if the tile is selected, then it will have "_selected" concatenated to the end of its node id string
				//check for this now
				if(tile_id.length > 9)
				{
					//remove the last 9 characters
					var keep_length = tile_id.length - 9;
					tile_id = tile_id.slice(0,keep_length);
				}
				return tile_id;
			},
			
			RefreshSelectArmyStack : function(target_army)
			{
				if(this.selected_army != null)
				{
					var selected_army = this.selected_army;
					this.UnselectArmyStack();
					this.SelectArmyStack(selected_army);
				}
				else
				{
					this.SelectArmyStack(target_army);
				}
			},
			
			ForceRefreshSelectArmyStack : function(target_army)
			{
				if(this.selected_army != null)
				{
					this.UnselectArmyStack();
				}
				this.SelectArmyStack(target_army);
			},
			
			UnselectArmyStack : function()
			{
				//console.log("page::UnselectArmyStack()");
				
				var old_selected_army = window.gameui.selected_army;
				if(old_selected_army != null)
				{
					//unselect it in code, have it handle its own ui updates
					window.gameui.selected_army.unselectStack();
					window.gameui.selected_army = null;
					
					//clean up the ui
					dojo.query(".ui_selected_text").forEach(dojo.destroy);
					
					dojo.destroy("army_selection_stack");
					//this.DestroyArmyByStack(window.gameui.selected_army_display_stack);
					window.gameui.selected_army_display_stack = null;
					
					//add a hint telling the player they can select an army there
					this.CreateArmySelectPanelTitle();
					this.UpdateCurrentOverlayMode();
				}
				else
				{
					//console.log("ERROR: UnselectArmyStack() but window.gameui.selected_army is null");
				}
				
				return old_selected_army;
			},
			
			CreateArmySelectPanelTitle : function()
			{
				dojo.query(".ui_stack_title").forEach(dojo.destroy);
				dojo.place("<p class=\"ui_stack_title selected_stack_element\">" + this.GetUnselectedArmyHintString() + "</p>", "selected_army");
			},
			
			TileSelectionUpdated : function()
			{
				//console.log("page::TileSelectionUpdated()");
				if(this.isCurrentPlayerMoveMode())
				{
					//console.log("check1");
					this.RefreshMoveModeUI();
				}
			},
			
			GetArmyIdString : function(army_id_num)
			{
				return "blstarmystack" + army_id_num;
			},
			
			GetArmyIdNumFromString : function(army_id_num)
			{
				var id_num = army_id_num.substring(13);
				return Number(id_num);
			},
			
			GetArmyById : function(id_num)
			{
				//console.log("page::GetArmyById(" + id_num + ")");
				if(id_num == null)
				{
					return undefined;
				}
				if(id_num == undefined)
				{
					console.log("WARNING: GetArmyById() but id_num is undefined");
					return undefined;
				}
				var army_id_string = this.GetArmyIdString(id_num);
				var army = this.armies_by_id_string[army_id_string];
				if(army == undefined)
				{
					//this is sometimes intended behaviour to not find an existing army
					//console.log("WARNING: GetArmyById() could not find army with id_num: " + id_num);
				}
				return army;
			},
			
			CreateArmy : function(army_info, from_div_id)	//army_id, starting_province_id, owner_player_id
			{
				//console.log("page::CreateArmy()");
				//console.log(army_info);
				
				//create the object
				var newArmy = new modules.TileStack();
				//todo: factionid is only needed here for spawning the test armies, it will get removed soon
				newArmy.createAsArmy(this, "centrepanel", army_info, from_div_id);	//node id formerly "gamemap"
				
				//set it to the desired collision layer
				//dojo.style(newArmy.container_div, 'zIndex', this.GameLayerArmy());
				
				//store it
				this.armies_by_id_string[newArmy.id_string] = newArmy;
				this.all_armies[this.all_armies.length] = newArmy;
				
				return newArmy;
			},
			
			DestroyArmy : function(source_army_id)
			{
					//clean it up
					//console.log("beginning cleanup of " + source_army_id_string + " ..." );
					var source_army = this.GetArmyById(source_army_id);
					if(source_army == undefined)
					{
						//create an empty army stack with everything except no tiles
						console.log("ERROR: could not find source army to split: \"" + source_army_id + "\"");
						return;
					}
					if(this.selected_army == source_army)
					{
						this.UnselectArmyStack();
					}
					var source_army_id_string = this.GetArmyIdString(source_army_id);
					
					//loop over provinces and find the old province zone
					var cur_province = this.provinces_by_name[source_army.prov_name];
					cur_province.zone.removeFromZone(source_army_id_string, false);
					
					//console.log("check1:");
					//console.log(this.armies_by_id_string);
					delete this.armies_by_id_string.source_army_id_string;
					//console.log(this.armies_by_id_string);
					
					//console.log("check2:");
					//console.log(this.all_armies);
					delete this.all_armies[source_army_id];
					//console.log(this.all_armies);
					
					//todo: clean up any extra circular references inside TileStack.js for proper garbage collection
					//
					
					dojo.destroy(source_army.container_div);
					
					//let the army handle any other custom cleanup it needs to do
					source_army.destroy_self();
			},
			
			MoveArmy : function(army_obj, dest_province_name, do_jump = false, ghost_move = false)
			{
				var moving_army = null;
				var army_id_string = "unknown_army";
				
				//did we pass in just the id number for the army?
				if(typeof army_obj === "number")
				{
					//grab the army object from our array
					army_id_string = this.GetArmyIdString(army_obj);
					moving_army = this.armies_by_id_string[army_id_string];
				}
				else if(army_obj.toString() === "ArmyTileStack")
				{
					//the type check here is redundant, making it a sanity check i guess
					moving_army = army_obj;
					army_id_string = army_obj.id_string;
				}
				else if(army_obj.toString() === "VillageTileStack")
				{
					//the type check here is redundant, making it a sanity check i guess
					moving_army = army_obj;
					army_id_string = army_obj.id_string;
				}
				else if(army_obj.toString() === "CitadelTileStack")
				{
					//the type check here is redundant, making it a sanity check i guess
					moving_army = army_obj;
					army_id_string = army_obj.id_string;
				}
				else
				{
					console.log("page.MoveArmy(" + army_obj + "," + dest_province_name + ") unknown army_obj type: " + army_obj.toString());
					return;
				}
				//console.log("MoveArmy(" + army_id_string + "," + dest_province_name + ")");
				
				//old method: slide it out directly to the target province
				//console.log("MoveArmy() " + "calling slideToObject(" + moving_army.container_div + "," + dest_province_name + ")");
				//console.log(moving_army);
				//var dojo_anim = this.slideToObject(moving_army.container_div, dest_province_name);
				//dojo_anim.play();
				
				//loop over provinces and find the old province zone
				if(moving_army.prov_name != "NA")
				{
					//console.log("check1 " + moving_army.prov_name);
					for(var i in this.provinces)
					{
						var cur_province = this.provinces[i];
						//console.log("check2 " + cur_province.name);
						if(cur_province.name == moving_army.prov_name)
						{
							cur_province.zone.instantaneous = do_jump;
							//console.log("removing army " + army_id_string + " from province zone " + moving_army.prov_name);
							cur_province.zone.removeFromZone(army_id_string, false, moving_army.prov_name);
							cur_province.zone.instantaneous = false;
							//console.log(cur_province.zone)
							break;
						}
					}
				}
				
				//loop over provinces and find the new province zone
				for(var i in this.provinces)
				{
					var cur_province = this.provinces[i];
					//console.log("check3 " + cur_province.name);
					if(cur_province.name == dest_province_name)
					{
						//console.log("jumping army to prov " + cur_province.name);
						//console.log(cur_province);
						cur_province.zone.instantaneous = do_jump;
						//console.log("adding army " + army_id_string + " to province zone " + dest_province_name);
						cur_province.zone.placeInZone(army_id_string);
						cur_province.zone.instantaneous = false;
						//console.log(cur_province.zone)
						break;
					}
				}
				
				if(ghost_move)
				{
					moving_army.SetMoving(true);
				}
				moving_army.prov_name = dest_province_name;
				//console.log(moving_army);
				//console.log(moving_army.container_div);
				//console.log(moving_army.container_div.parentNode);
			},
			
			TransferArmyTiles : function(source_army_id, target_army_id, tile_ids, selection_flag)
			{
				if(tile_ids == null)
				{
					tile_ids = [];
				}
				//console.log("page::TransferArmyTiles(" + source_army_id + "," + target_army_id + "," + tile_ids.toString() + "," + selection_flag + ")");
				//console.log("tile_ids:");
				//console.log(tile_ids);
				
				//grab this useful info about the source army stack
				var source_army = this.GetArmyById(source_army_id);
				if(source_army == undefined)
				{
					//create an empty army stack with everything except no tiles
					console.log("ERROR: could not find source army to split: \"" + source_army_id + "\"");
				}
				//console.log("source_army:");
				//console.log(source_army);
				
				//the target should already exist
				var target_army = this.GetArmyById(target_army_id);
				if(target_army == undefined)
				{
					//create an empty army stack with everything except no tiles
					console.log("ERROR: could not find or create target army to split: \"" + target_army_id + "\"");
				}
				//console.log("target_army:");
				//console.log(target_army);
				
				//next, find the tile infos about the tiles we are moving from the source 
				//if this is an empty or null list, then standard behaviour is to merge everything from source -> target
				var split_tile_infos;
				if(tile_ids.length > 0)
				{
					split_tile_infos = [];
					//console.log("identifying tiles to split...");
					for(var check_tile_id in source_army.tiles)
					{
						//console.log("check_tile_id: " + check_tile_id);
						//check this tile
						var checktile = source_army.tiles[check_tile_id];
						
						//loop over the tile ids we want to move
						for(var i in tile_ids)
						{
							var split_tile_id = tile_ids[i];
							//console.log("checking for match with split_tile_id: " + split_tile_id);
							//do we want this one?
							if(check_tile_id == split_tile_id)
							{
								//remember it for later
								//console.log("found match");
								//console.log("check3");
								split_tile_infos.push(checktile);
								break;
							}
						}
					}
				}
				else
				{
					//console.log("all tiles are transferring across");
					split_tile_infos = source_army.getTileInfos();
				}
				//console.log("split_tile_infos:");
				//console.log(split_tile_infos);
				
				//add items to new army
				var source_army_id_string = this.GetArmyIdString(source_army_id);
				target_army.SpawnTilesInStack(split_tile_infos, source_army_id_string);
				
				//console.log("removing items... ");
				
				//now move the tiles over to the new army
				var target_army_id_string = this.GetArmyIdString(target_army_id);
				source_army.RemoveTilesFromStack(split_tile_infos/*, target_army_id_string*/);
				//console.log("items remaining: " + source_army.items.length);
				//console.log(source_army);
				
				//unselect the old army
				//DONT do this, it breaks other code
				//var old_selected_army = this.UnselectArmyStack();
				
				//if the old army is completely empty?
				if(source_army.IsStackEmpty())
				{
					//console.log("army is empty... selecting new army");
					//select the new army we are merging into
					this.ForceRefreshSelectArmyStack(target_army);
					
					//console.log("destroying source army");
					this.DestroyArmy(source_army_id);
				}
				else if(source_army == window.gameui.selected_army)
				{
					//console.log("army is not empty... refreshing previously selected army");
					//was this army selected? special extra handling
					this.ForceRefreshSelectArmyStack(source_army);
				}
				
				//toggle stack selection to refresh the ui
				//this is a bit unweildy the way i was doing it... i'll do this a bit more cleanly above but i'll leave this here for now
				switch(selection_flag)
				{
					case this.SELECT_ARMY_NONE:
					{
						break;
					}
					case this.SELECT_ARMY_SOURCE:
					{
						this.SelectArmyStack(source_army);
						break;
					}
					case this.SELECT_ARMY_TARGET:
					{
						this.SelectArmyStack(target_army);
						break;
					}
				}
				
				if(this.isCurrentPlayerMoveMode())
				{
					this.RefreshMoveModeUI();
				}
			},
			
			onClickArmyStack : function(event, clicked_army)
			{
				//console.log("page::onClickArmyStack()");
				if(this.isCurrentPlayerUndeadState())
				{
					this.HandleUndeadStateArmyClicked(clicked_army);
				}
				else if(this.isCurrentPlayerBuildMode())
				{
					if(clicked_army.IsBuilding())
					{
						var div_id = event.target.id;
						var army_string_index = div_id.search("_");
						var tile_id_index = army_string_index + 6;
						let tile_id = div_id.substring(tile_id_index);
						this.TryCancelTileBuild(clicked_army, tile_id);
					}
				}
				else if(this.isCurrentPlayerMoveMode())
				{
					window.gameui.HandleMovemodeArmyClicked(clicked_army);
				}
				else if(this.isCurrentPlayerBattleMode())
				{
					//do we already have an army selected?
					if(window.gameui.selected_army != null)
					{
						//unselect it
						this.UnselectArmyStack();
					}
					
					//transfer selection to this army
					this.SelectArmyStack(clicked_army);
						
					if(window.gameui.battling_province_name == null)
					{
						//window.gameui.TryEnterBattle(clicked_army);
					}
				}
				else
				{
					//do we already have an army selected?
					if(window.gameui.selected_army == null)
					{
						//select this army
						this.SelectArmyStack(clicked_army);
					}
					else
					{
						//did we click on the currently selected army?
						var old_selected_army = window.gameui.selected_army;
						if(old_selected_army == clicked_army)
						{
							//toggle army selection
							this.UnselectArmyStack();
						}
						else
						{
							//transfer the army selection
							this.UnselectArmyStack();
							this.SelectArmyStack(clicked_army);
						}
					}
				}
			},
			
			SelectedArmySplitAnimation : function(sliding_tile_id, target_army_id)
			{
				//start a visual effect of the tile sliding to its destination
				//console.log("page::SelectedArmySplitAnimation(" + sliding_tile_id + "," + target_army_id + ")");
				
				//var tile_host_div_id = this.GetSelectedTileIdString(sliding_tile_id);
				var army_div_id = this.GetArmyIdString(target_army_id);
				var tile_image_div_id = this.GetSelectedTileImageIdString(sliding_tile_id);
				//console.log("sliding: " + tile_image_div_id + " | " + army_div_id);
				
				var gamewindow = dojo.byId("gamewindow");
				var tile_image_div = dojo.byId(tile_image_div_id);
				
				//var image_position = dojo.position(tile_image_div);
				var image_x = dojo.position(tile_image_div).x - dojo.position(gamewindow).x;
				var image_y = dojo.position(tile_image_div).y - dojo.position(gamewindow).y;
				
				//create a copy of the original tile image
				var sliding_image = tile_image_div.cloneNode(true);
				sliding_image.id += "_clone";
				//console.log(sliding_image);
				gamewindow.appendChild(sliding_image);
				
				//hide the original image
				dojo.style(tile_image_div, "opacity", "0");
				
				dojo.style(sliding_image, "z-index", this.GameLayerFloat());
				dojo.style(sliding_image, "position", "absolute");
				dojo.style(sliding_image, "left", image_x + "px");
				dojo.style(sliding_image, "top", image_y + "px");
				//console.log("(" + image_x + "," + image_y + ")");
				//dojo.style(sliding_image,"position", "absolute");
				
				var duration_ms = 300;
				var slideAnim = this.slideToObject(sliding_image, army_div_id, duration_ms);
				var fadeAnim = fx.fadeOut({
					node: sliding_image,
					duration: duration_ms,
					onEnd: function(){
						dojo.destroy(sliding_image);
						//console.log("finished");
				   }
				});
				
				coreFx.combine([fadeAnim, slideAnim]).play();
			},
			
			ServerArmyMove : function(moving_army, provinces_route)
			{
				//console.log("page::ServerArmyMove()");
				//console.log("page::ServerArmyMove(" + moving_army.id_string + ", " + provinces_route + ")_" + provinces_array_JSON);
				
				//is this move allowed?
				if(window.gameui.checkAction('action_tryArmyStackMove'))
				{
					//regular expression to extract the army id number from the node id string
					//var army_id_num = moving_army.id_string.replace(/[^0-9]/g,"");
					var army_id_num = moving_army.id_num;
					
					//grab the province names for the server
					var province_route_names = [];
					for(var i in provinces_route)
					{
						const check_province_info = provinces_route[i];
						province_route_names.push(check_province_info.name);
					}
					
					//convert to JSON for passing to server
					//console.log(province_route_names);
					provinces_array_JSON = JSON.stringify(province_route_names);
					
					//ajax call to pass the request back to php
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_tryArmyStackMove.html", {
						source_army_id: army_id_num,
						provinces_array: provinces_array_JSON,
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
			
			ServerArmySplit : function(splitting_army, splitting_tile_ids, select_new_army = false)
			{
				//console.log("page::ServerArmyTransfer()");
				//console.log(splitting_army);
				//console.log(splitting_tile_ids);
				
				//is this move allowed?
				if(window.gameui.checkAction('action_tryArmyStackSplit'))
				{
					//regular expression to extract the army id number from the node id string
					//var army_id_num = splitting_army.id_string.replace(/[^0-9]/g,"");
					var army_id_num = splitting_army.id_num;
					
					//convert to JSON for passing to server
					splitting_tiles_JSON = JSON.stringify(splitting_tile_ids);
					
					//ajax call to pass the request back to php
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_tryArmyStackSplit.html", {
						source_army_id: army_id_num,
						splitting_tiles: splitting_tiles_JSON,
						select_target: select_new_army,
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
			
			ServerArmyMerge : function(army_source, army_target, tile_ids_to_merge)
			{
				//console.log("page::ServerArmyMerge(" + army_source.id_string + "," + army_target.id_string + "," + tile_ids_to_merge.length + ")");
				
				//is this move allowed?
				if(window.gameui.checkAction('action_tryArmyStackMerge'))
				{
					//regular expression to extract the army id number from the node id string
					var army_id_source = army_source.id_string.replace(/[^0-9]/g,"");
					var army_id_target = army_target.id_string.replace(/[^0-9]/g,"");
					
					//if this is an empty or null list, then standard behaviour is to merge everything from source -> target
					/*if(!tile_ids_to_merge || tile_ids_to_merge == undefined || tile_ids_to_merge.length == 0)
					{
						tile_ids_to_merge = army_source.getSelectedTileIds();
					}*/
					var tile_list_JSON = JSON.stringify(tile_ids_to_merge);
					/*
					$source_army_id = self::getArg("source_army_id", AT_int, true);
					$target_army_id = self::getArg("target_army_id", AT_int, true);
					$tile_ids_JSON_stringified = self::getArg("splitting_tiles", AT_json, true);
					*/
					
					//ajax call to pass the request back to php
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_tryArmyStackMerge.html", {
						source_army_id: army_id_source,
						target_army_id: army_id_target,
						splitting_tiles: tile_list_JSON,
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
			
			DoesActivePlayerOwnArmy : function(army_stack)
			{
				var activePlayerId = this.getActivePlayerId();
				return this.DoesPlayerOwnArmy(army_stack, activePlayerId);
			},
			
			DoesPlayerOwnArmy : function(army_stack, player_id)
			{
				if(!army_stack)
				{
					return false;
				}
				return (player_id == army_stack.player_id);
			},
		});
		
		return instance;
	}
);