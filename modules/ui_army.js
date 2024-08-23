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
				//console.log("page::SelectArmyStack(" + new_selected_army.id_num + ")");
				if(gameui.selected_army != null)
				{
					console.log("ERROR: Trying to select army " + new_selected_army.id_num + " but already selected " + gameui.selected_army.id_num);
				}
				else if(new_selected_army != null)
				{
					//select it in the code, have it handle its own ui updates
					gameui.selected_army = new_selected_army;
					gameui.selected_army.selectStack();
					
					//console.log(gameui.selected_army);
					
					//update the ui to show more info about this selected army stack
					var selected_army_div = dojo.byId("selected_army");
					
					//title
					var title_div = dojo.place("<h1>Selected Army</h1>", selected_army_div);
					dojo.addClass(title_div, "ui_stack_title");
					dojo.addClass(title_div, "selected_stack_element");
					
					/*
					//for debugging
					//player owner
					var player_div = dojo.place("<div>Player: <i>" + this.gamedatas.players[new_selected_army.player_id].name + "</i></div>", selected_army_div);
					//dojo.addClass(player_div, "selected_stack_element");
					
					//province location
					var province_div = dojo.place("<div>Location: <i>" + new_selected_army.province_id + "</i></div>", selected_army_div);
					//dojo.addClass(province_div, "selected_stack_element");
					*/
					
					//we need to set absolute and calculated positions here in order to do the stack split animation effect 
					//the "Selected army" title is 34px
					//add in 10px top padding
					var current_height_offset = 44;
					
					//name of the tile
					var tile_title_height = 19;
					
					//image of the tile
					var tile_image_height = 72;
					
					//add a ui element for each tile in the army stack
					for(var tile_id in new_selected_army.tiles)
					{
						//grab the info for this tile
						var tile = new_selected_army.tiles[tile_id];
						//console.log(tile);
						var tile_strings = this.all_tile_strings[tile.type_arg];
						
						//create it and some initial styling
						var tile_div = dojo.place("<div></div>", selected_army_div);
						tile_div.id = this.GetSelectedTileIdString(tile_id);
						dojo.addClass(tile_div, "ui_stack_tile");
						dojo.addClass(tile_div, "selected_stack_element");
						dojo.style(tile_div,"top", current_height_offset + "px");
						
						//for debugging
						//tile_div.style.border = "solid";
						//tile_div.style.borderColor = "green";
						
						//name and type of tile
						dojo.place("<b>" + tile_strings.name + "</b>", tile_div);
						
						//tile image
						var host_image_div = dojo.place("<div style=\"height: 72px\"></div>", tile_div);
						
						var image_div = dojo.place("<div class=\"ui_stack_tile_image\"></div>", host_image_div);
						image_div.id = this.GetSelectedTileImageIdString(tile_id);
						dojo.connect(image_div, "click", dojo.hitch(this, this.onClickStackTileUI));
						
						//for debugging
						//image_div.style.border = "solid";
						//image_div.style.borderColor = "blue";
						
						//grab the image from the stock item
						var stock_item_div = $(new_selected_army.getItemDivId(tile_id));
						//console.log(stock_item_div);
						var stock_item = new_selected_army.getItemById(tile_id);
						//console.log(stock_item);
						var type = new_selected_army.item_type[stock_item.type];
						//console.log(type);
						
						var borderwidth = 12;
						dojo.style(image_div, 'background-image', 'url(' + type.image + ')');
						dojo.style(image_div, 'background-size', new_selected_army.backgroundSize);
						dojo.style(image_div, "background-position", stock_item_div.style.backgroundPosition);
						//dojo.style(image_div, 'padding', '10px');
						
						//create a selection overlay div
						/*
						var selected_div = dojo.place("<div class=\"ui_stack_tile_selected\"></div>", image_div);
						selected_div.id = "selected_tile_" + tile_id;
						tile.selected = 1;	//automatically reselect all tiles in the stack
						dojo.style(selected_div, 'opacity', tile.selected);
						*/
						
						//tile desc
						var tile_desc = dojo.place("<div>" + tile_strings.desc + "</div>", tile_div);
						//tile_desc.style.width = "190px";
						
						//move down the page
						var new_offset = dojo.position(tile_div).h;
						//console.log(tile_strings.name + " tile height:" + new_offset);
						current_height_offset += new_offset + 10;	//10px bottom margin
						//console.log("success");
					}
				}
				else
				{
					//console.log("ERROR: Trying to select a null army");
				}
			},
			
			GetSelectedTileIdString : function(tile_id)
			{
				return "selected_army_uitile_" + tile_id;
			},
			
			GetSelectedTileImageIdString : function(tile_id)
			{
				return "selected_tile_image_" + tile_id;
			},
			
			GetTileIdFromImage : function(tile_image_id)
			{
				return tile_image_id.slice(20);
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
			
			UnselectArmyStack : function()
			{
				//console.log("page::UnselectArmyStack()");
				/*var test_obj;
				test_obj.forceerror();*/
				var old_selected_army = gameui.selected_army;
				if(old_selected_army != null)
				{
					//unselect it in code, have it handle its own ui updates
					gameui.selected_army.unselectStack();
					gameui.selected_army = null;
					
					//clean up the ui
					dojo.query(".selected_stack_element").forEach(dojo.destroy);
				}
				else
				{
					//console.log("ERROR: UnselectArmyStack() but gameui.selected_army is null");
				}
				
				return old_selected_army;
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
					var cur_province = this.provinces_by_name[source_army.province_id];
					cur_province.zone.removeFromZone(source_army_id_string, false);
					/*
					for(var i in this.provinces)
					{
						var cur_province = this.provinces[i];
						if(cur_province.name == source_army.province_id)
						{
							//console.log("removing army " + army_id_string + " from province zone " + moving_army.province_id);
							cur_province.zone.removeFromZone(source_army_id_string, false);
							break;
						}
					}
					*/
					
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
					
					//todo: i dont think this does anything? also unnecessary due to javascript GC
					//delete source_army;
					source_army.destroy();
			},
			
			MoveArmy : function(army_obj, dest_province_id, do_jump = false, ghost_move = false)
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
					console.log("page.MoveArmy(" + army_obj + "," + dest_province_id + ") unknown army_obj type: " + army_obj.toString());
					return;
				}
				//console.log("MoveArmy(" + army_id_string + "," + dest_province_id + ")");
				
				//old method: slide it out directly to the target province
				//console.log("MoveArmy() " + "calling slideToObject(" + moving_army.container_div + "," + dest_province_id + ")");
				//console.log(moving_army);
				//var dojo_anim = this.slideToObject(moving_army.container_div, dest_province_id);
				//dojo_anim.play();
				
				//loop over provinces and find the old province zone
				if(moving_army.province_id != "NA")
				{
					//console.log("check1 " + moving_army.province_id);
					for(var i in this.provinces)
					{
						var cur_province = this.provinces[i];
						//console.log("check2 " + cur_province.name);
						if(cur_province.name == moving_army.province_id)
						{
							cur_province.zone.instantaneous = do_jump;
							//console.log("removing army " + army_id_string + " from province zone " + moving_army.province_id);
							cur_province.zone.removeFromZone(army_id_string, false, moving_army.province_id);
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
					if(cur_province.name == dest_province_id)
					{
						//console.log("jumping army to prov " + cur_province.name);
						//console.log(cur_province);
						cur_province.zone.instantaneous = do_jump;
						//console.log("adding army " + army_id_string + " to province zone " + dest_province_id);
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
				moving_army.province_id = dest_province_id;
				//console.log(moving_army);
				//console.log(moving_army.container_div);
				//console.log(moving_army.container_div.parentNode);
			},
			
			TransferArmyTiles : function(source_army_id, target_army_id, tile_ids, selection_flag)
			{
				//console.log("page::TransferArmyTiles(" + source_army_id + "," + target_army_id + "," + tile_ids.toString() + ", " + selection_flag + ")");
				//console.log(tile_ids);
				
				//grab this useful info about the source army stack
				var source_army = this.GetArmyById(source_army_id);
				if(source_army == undefined)
				{
					//create an empty army stack with everything except no tiles
					console.log("ERROR: could not find source army to split: \"" + source_army_id + "\"");
				}
				
				//the target should already exist
				var target_army = this.GetArmyById(target_army_id);
				if(target_army == undefined)
				{
					//create an empty army stack with everything except no tiles
					console.log("ERROR: could not find or create target army to split: \"" + target_army_id + "\"");
				}
				
				//next, find the tile infos about the tiles we are moving from the source 
				var split_tile_infos = [];
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
				var old_selected_army = this.UnselectArmyStack();
				
				//if the old army is completely empty?
				if(source_army.items.length == 0)
				{
					this.DestroyArmy(source_army_id);
				}
				
				//toggle stack selection to refresh the ui
				switch(selection_flag)
				{
					case SELECT_ARMY_NONE:
					{
						break;
					}
					case SELECT_ARMY_SOURCE:
					{
						this.SelectArmyStack(source_army);
						break;
					}
					case SELECT_ARMY_TARGET:
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
					gameui.HandleMovemodeArmyClicked(clicked_army);
				}
				else if(this.isCurrentPlayerBattleMode())
				{
					//do we already have an army selected?
					if(gameui.selected_army != null)
					{
						//unselect it
						this.UnselectArmyStack();
					}
					
					//transfer selection to this army
					this.SelectArmyStack(clicked_army);
						
					if(gameui.battling_province_name == null)
					{
						//gameui.TryEnterBattle(clicked_army);
					}
				}
				else
				{
					//do we already have an army selected?
					if(gameui.selected_army == null)
					{
						//select this army
						this.SelectArmyStack(clicked_army);
					}
					else
					{
						//did we click on the currently selected army?
						var old_selected_army = gameui.selected_army;
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
				
				/*old code from this point on*/
				/*
				if(gameui.selected_army == null)
				{
					//have we already selected an army stack?
					//enter move mode if it's our army and we are able to
					if(this.isCurrentPlayerMainPhase() && !this.isCurrentPlayerMoveMode())
					{
						this.EnterMoveMode();
					}
					
					//select this army
					this.SelectArmyStack(clicked_army);
					this.RefreshMoveModeUI();
				}
				else
				{
					var old_selected_army = gameui.selected_army;
					
					//toggle army selection
					if(old_selected_army == clicked_army)
					{
						this.UnselectArmyStack();
						if(this.isCurrentPlayerMoveMode())
						{
							this.RefreshMoveModeUI();
						}
					}
					else if(this.isCurrentPlayerMoveMode())
					{
						//are the armies in the same province?
						if(old_selected_army.province_id == clicked_army.province_id)
						{
							//is it owned by the player?
							if(old_selected_army.player_id == clicked_army.player_id)
							{
								//does this army have queued moves?
								if(!old_selected_army.IsMoving())
								{
									//merge the selected units into the target army
									var selected_tile_ids = old_selected_army.getSelectedTileIds();
									this.ServerArmyMerge(old_selected_army, clicked_army, selected_tile_ids);
									
									this.RefreshMoveModeUI();
								}
								else
								{
									this.showMessage(_('You must finish your move before merging armies.'), 'error');
								}
							}
							else
							{
								//no error message, it should be obvious to the player
							}
						}
						else
						{
							//change the selected army
							this.UnselectArmyStack();
							this.SelectArmyStack(clicked_army);
							this.RefreshMoveModeUI();
						}
					}
				}
				*/
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
				if(gameui.checkAction('action_tryArmyStackMove'))
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
					gameui.ajaxcall( "/bloodstones/bloodstones/action_tryArmyStackMove.html", {
						source_army_id: army_id_num,
						provinces_array: provinces_array_JSON,
						lock: true
						},
						 gameui, function( result ) {
							
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
				if(gameui.checkAction('action_tryArmyStackSplit'))
				{
					//regular expression to extract the army id number from the node id string
					//var army_id_num = splitting_army.id_string.replace(/[^0-9]/g,"");
					var army_id_num = splitting_army.id_num;
					
					//convert to JSON for passing to server
					splitting_tiles_JSON = JSON.stringify(splitting_tile_ids);
					
					//ajax call to pass the request back to php
					gameui.ajaxcall( "/bloodstones/bloodstones/action_tryArmyStackSplit.html", {
						source_army_id: army_id_num,
						splitting_tiles: splitting_tiles_JSON,
						select_target: select_new_army,
						lock: true
						},
						 gameui, function( result ) {
							
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
				if(gameui.checkAction('action_tryArmyStackMerge'))
				{
					//regular expression to extract the army id number from the node id string
					var army_id_source = army_source.id_string.replace(/[^0-9]/g,"");
					var army_id_target = army_target.id_string.replace(/[^0-9]/g,"");
					var tile_list_JSON = JSON.stringify(tile_ids_to_merge);
					/*
					$source_army_id = self::getArg("source_army_id", AT_int, true);
					$target_army_id = self::getArg("target_army_id", AT_int, true);
					$tile_ids_JSON_stringified = self::getArg("splitting_tiles", AT_json, true);
					*/
					
					//ajax call to pass the request back to php
					gameui.ajaxcall( "/bloodstones/bloodstones/action_tryArmyStackMerge.html", {
						source_army_id: army_id_source,
						target_army_id: army_id_target,
						splitting_tiles: tile_list_JSON,
						lock: true
						},
						 gameui, function( result ) {
							
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