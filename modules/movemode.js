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
		
		var instance = declare("_movemode", null, {
			//put your functions here
			
			TryQueueProvinceMove : function(target_province_name)
			{
				//console.log("page::TryQueueProvinceMove(" + target_province_name + ")");
				//some sanity checks
				if(this.GetSelectedProvinceName() == null)
				{
					//console.log("ERROR! No province selected");
					return false;
				}
				if(this.selected_province_main_army == null)
				{
					//console.log("ERROR! selected_province_main_army is null");
					return false;
				}
				
				const target_province_info = this.provinces_by_name[target_province_name];
				var moving_army = this.selected_province_main_army;
				
				//did we click on the current province?
				if(target_province_info.name == moving_army.prov_name)
				{
					console.log("ERROR! TryQueueProvinceMove() being called for the same province the army is in");
					return false;
				}
				
				//check to see if there is a movement link to this province
				/*var already_queued = this.isProvinceQueuedMove(target_province_info, moving_army);
				var sea_transit_chain_steps = [];
				if(already_queued)
				{
					//silently fail, this is not something players would want to do
					return;
				}*/
				
				const start_province_info = this.provinces_by_name[moving_army.prov_name];
				var can_move = false;
				if(this.AreProvincesLinked(start_province_info, target_province_info))
				{
					can_move = true;
				}
				else
				{
					//console.log("no move link found");
					/*
					//check if there is a link here via ships
					//console.log("checking movement chain...");
					var check_prov = target_province_info;
					//adj_province_info.movemode_iteration = this_movemode_iteration;
					
					//work backwards along the chain
					while(check_prov.move_prov_previous && check_prov.movemode_iteration == this.movemode_iteration && check_prov.move_prov_previous != undefined)
					{
						check_prov = check_prov.move_prov_previous;
						var prov_id = this.GetProvinceIdFromName(check_prov.name);
						sea_transit_chain_steps.push(prov_id);
						//console.log(check_prov.name);
					}
					
					if(check_prov.name == moving_army.prov_name)
					{
						can_move = true;
						
						//console.log("success! there is a chain linking that province to the army province");
						
						//todo: extra processing for movement chain
					}
					else
					{
						this.showMessage(this.GetMoveFailDistString(), 'error');
						return;
					}
					*/
				}
				
				//console.log(target_province_info.move_info);
				
				if(!target_province_info.move_info)
				{
					this.showMessage(this.GetProvinceDistFailString(), 'error');
					return false;
				}
				
				if(target_province_info.move_info.army_impassable)
				{
					this.showMessage(this.GetProvinceEntryFailString(), 'error');
					return false;
				}
				
				if(!can_move)
				{
					return false;
				}
				
				//console.log("success! now moving the main army..");
				
				//new system: there are no "armies" or moves in progress, only tiles
				//armies are still used as a helpful abstraction eg stacks and to minimise rewrites
				this.AddActionCostAmount(target_province_info.move_info.total_move_cost);
				
				//individually record the tile movements so it can be sent to the server at the end
				var moving_items = moving_army.getSelectedItems();
				//console.log(moving_items);
				var starting_prov_name = moving_army.prov_name;
				for(var i=0; i<moving_items.length; i++)
				{
					var cur_item = moving_items[i];
					this.QueueTileMove(cur_item.id, starting_prov_name, target_province_name);
				}
				
				//is there a pre-existing army in the target province?
				//now we just transfer tiles to a new stack instead of moving the existing one
				var destination_army = this.GetMainPlayerArmyInProvinceOrCreate(target_province_name, moving_army.player_id);
				
				//merge the tiles from the old army into the new army
				//console.log("transferring from " + moving_army.id_string + " to " + destination_army.id_string);
				this.TransferArmyTilesByStack(moving_army, destination_army, moving_army.getSelectedTileIds(), this.SELECT_ARMY_NONE, false);
				destination_army.selectAll();
				
				//do some cleanup here before we change province selection
				this.MergeReserveArmyBackIntoMain();
				
				//change province selection to the target province
				this.ForceSelectProvince(target_province_name);
				
				//finally clean up the left panel
				this.ClearReserveDisplay();
				
				//old system 
				/*
				if(!moving_army.IsMoving())
				{
					moving_army.StartQueuedMove();
					moving_army.SetMoving(true);
				}
				
				//update client
				this.MoveArmy(moving_army, target_province_name, false);
				this.AddActionCostAmount(target_province_info.move_info.total_move_cost);
				
				//now, prepare the info for the server
				
				//queue a move step for the first province
				//todo: why is this needed? the server will already have the info on the starting province
				if(!this.HasArmyMoveQueued(moving_army.id_string))
				{
					var start_prov_id = this.GetProvinceIdFromName(start_province_info.name);
					var start_move_step = {step_type: this.ACTION_MOVE, prov_name: start_province_info.name, prov_id: start_prov_id, sea_transit_chain: sea_transit_chain_steps};
					this.QueueArmyActionStep(start_move_step, moving_army.id_string);
				}
				var target_prov_id = this.GetProvinceIdFromName(target_province_name);
				var move_step = {step_type: this.ACTION_MOVE, prov_name: target_province_name, prov_id: target_prov_id, sea_transit_chain: sea_transit_chain_steps};
				this.QueueArmyActionStep(move_step, moving_army.id_string);
				
				//ui update
				this.RefreshMoveModeUI();
				*/
				return true;
			},
			
			QueueTileMove : function(moving_tile_id, start_prov_name, end_prov_name)
			{
				//console.log("page::QueueTileMove(" + moving_tile_id + "," + start_prov_name + "," + end_prov_name + ")");
				//prepare information to be sent to the server
				//this function doesnt care about legality
				
				var tile_move = {tile_id: moving_tile_id, start_prov_name: start_prov_name, end_prov_name: end_prov_name};
				//console.log(tile_move);
				var moving_tile_id_string = moving_tile_id.toString();
				this.queued_tile_moves_all.push(tile_move);
				
				var current_queued_tile_moves = this.queued_tile_moves_by_tile[moving_tile_id_string];
				if(!current_queued_tile_moves || current_queued_tile_moves == undefined)
				{
					current_queued_tile_moves = [];
					this.queued_tile_moves_by_tile[moving_tile_id_string] = current_queued_tile_moves;
				}
				
				current_queued_tile_moves.push(tile_move);
			},
			
			UndoAllTileMoves : function()
			{
				//console.log("page::UndoAllTileMoves()");
				//console.log(this.queued_tile_moves_by_tile);
				for(var tile_id_string in this.queued_tile_moves_by_tile)
				{
					//console.log("undoing moves by: " + tile_id_string);
					var current_queued_tile_moves = this.queued_tile_moves_by_tile[tile_id_string];
					//console.log(current_queued_tile_moves);
					var start_prov_name = null;
					var end_prov_name = null;
					for(var i=0; i<current_queued_tile_moves.length; i++)
					{
						var tile_move = current_queued_tile_moves[i];
						//console.log(tile_move.start_prov_name + "->" + tile_move.end_prov_name);
						//console.log(tile_move);
						end_prov_name = tile_move.end_prov_name;
						if(!start_prov_name)
						{
							start_prov_name = tile_move.start_prov_name;
						}
					}
					//console.log("returning tile: " + tile_id_string + ", start_prov_name: " + start_prov_name + ", end_prov_name: " + end_prov_name);
					if(start_prov_name == end_prov_name)
					{
						//console.log("start and end province for tile " + tile_id_string + " is the same, no undo needed");
						continue;
					}
					var start_army = this.GetMainPlayerArmyInProvinceOrCreate(start_prov_name, this.player_id);
					var end_army = this.GetMainPlayerArmyInProvinceOrCreate(end_prov_name, this.player_id);
					
					//TransferArmyTilesByStack : function(source_army, target_army, tile_ids, selection_flag = this.SELECT_ARMY_NONE, do_ui_update = true)
					this.TransferArmyTilesByStack(end_army, start_army, [tile_id_string], this.SELECT_ARMY_NONE, false);
				}
				this.queued_tile_moves_by_tile = {};
				this.queued_tile_moves_all = [];
			},
			
			TryUndoLastTileMove : function()
			{
				//todo
			},
			
			/*isProvinceQueuedMove(target_province_info, moving_army)
			{
				//check to see if this province is already queued for a move by this army
				//console.log("page::isProvinceQueuedMove(" + target_province_info.name + "," + moving_army.id_string + ")");
				var already_queued = false;
				var army_action_steps = this.queued_action_steps[moving_army.id_string];
				if(army_action_steps != null && army_action_steps != undefined)
				{
					for(var k in army_action_steps)
					{
						var move_step = army_action_steps[k];
						if(move_step.prov_name == target_province_info.name)
						{
							return true;
						}
					}
				}
				return false;
			},*/
			
			/*
			QueueArmySplit : function(source_army, splitting_tile_id)
			{
				//old army movement system, shouldnt be used
				console.log("WARNING! page::QueueArmySplit(" + source_army.id_num + "," + splitting_tile_id + ") this function is deprecated");
				
				//regular expression to extract the army id number from the node id string
				//var army_id_num = source_army.id_string.replace(/[^0-9]/g,"");
				
				var temp_split_army = this.GetQueuedSplitArmyProvinceOrCreate(source_army.prov_name, source_army.player_id);
				console.log(temp_split_army);
				
				//check if there is already a split action queued for this province
				//it will always be the latest action step
				var split_step = this.GetCurrentArmySplitSteporNull(source_army.id_string);
				if(split_step)
				{
					//add this tile to it
					split_step.tile_ids.push(splitting_tile_id);
					console.log("check1");
					console.log(split_step);
				}
				else
				{
					//create a new split step
					//todo: prov_name and prov_id being passed to server here is redundant
					//it's a partial update of the prov_id and prov_name change so i should finish it at some stage
					//the other change here is that tile_id (intval) became tile_ids (array)
					var split_prov_id = this.GetProvinceIdFromName(source_army.prov_name);
					split_step = {step_type: this.ACTION_SPLIT, prov_name: source_army.prov_name, prov_id: split_prov_id, tile_ids: [splitting_tile_id], temp_army_id_num: temp_split_army.id_num};
					console.log("check2");
					console.log(split_step);
					this.QueueArmyActionStep(split_step, source_army.id_string);
				}
				
				//now move the tiles over
				this.TransferArmyTiles(source_army.id_num, temp_split_army.id_num, [splitting_tile_id], this.SELECT_ARMY_SOURCE);
			},*/
			
			/*TryUndoTileSplit : function(moving_army, tile_id)
			{
				console.log("page::TryUndoTileSplit(" + moving_army.id_string + "," + tile_id + ")");
				
				//only allow the player to undo this tile split if it's in the same province
				var temp_split_army = this.GetQueuedSplitArmyProvinceOrNull(moving_army.prov_name);
				if(!temp_split_army)
				{
					console.log("Notice! split army does not exist for this province: " + moving_army.prov_name + " so the tile was probably left behind");
					return false;
				}
				var item = temp_split_army.getItemById(tile_id);
				if(!item)
				{
					console.log("NOTICE! that tile is in a different province and cannot be merged back in");
					return false;
				}
				
				//find the split action step, it should be the last one
				var action_step = this.GetCurrentArmySplitSteporNull(moving_army.id_string);
				if(action_step)
				{
					//remove the tile from the split step
					var new_tile_ids = [];
					for(var i=0; i<action_step.tile_ids.length; i++)
					{
						var cur_id = action_step.tile_ids[i];
						if(cur_id != tile_id)
						{
							new_tile_ids.push(cur_id);
						}
					}
					action_step.tile_ids = new_tile_ids;
					
					//do we cancel the entire split step?
					if(new_tile_ids.length == 0)
					{
						this.TryUnqueueLastArmyActionStep(moving_army.id_string);
					}
					
					//merge this tile back into the main army
					//console.log("transfering tiles back to main");
					//note: TransferArmyTiles() will automatically destroy the source army if it's empty of tiles
					this.TransferArmyTiles(temp_split_army.id_num, moving_army.id_num, [tile_id]);
					
					return true;
				}
				else
				{
					//sanity check
					console.log("ERROR! page::TryUndoTileSplit(" + moving_army.id_string + "," + tile_id + ") could not find current split step for that army");
					return false;
				}
			},*/
			
			/*HasArmyMoveQueued : function(army_id_string)
			{
				var army_action_steps = this.queued_action_steps[army_id_string];
				
				//are any action steps queued?
				if(army_action_steps == null || army_action_steps == undefined)
				{
					return false;
				}
				
				//loop through the queued steps and look for any move steps
				for(var i=0; i<army_action_steps.length; i++)
				{
					var action_step = army_action_steps[i];
					if(action_step.step_type == this.ACTION_MOVE)
					{
						return true;
					}
				}
				
				//nothing was found
				return false;
			},*/
			
			/*GetCurrentArmySplitSteporNull : function(army_id_string)
			{
				//are there any queued actions?
				var army_action_steps = this.queued_action_steps[army_id_string];
				if(army_action_steps == null || army_action_steps == undefined || army_action_steps.length == 0)
				{
					console.log("page::GetCurrentArmySplitSteporNull(" + army_id_string + ") returning null 1");
					return null;
				}
				
				//get the last action step
				var last_action_step = army_action_steps[army_action_steps.length - 1];
				
				//is it a split action?
				if(last_action_step.step_type == this.ACTION_SPLIT)
				{
					console.log("page::GetCurrentArmySplitSteporNull(" + army_id_string + ") returning last action_step");
					return last_action_step;
				}
				
				console.log("page::GetCurrentArmySplitSteporNull(" + army_id_string + ") returning null 2");
				return null;
			},*/
			
			/*TryUnqueueLastArmyActionStep : function(army_id_string)
			{
				console.log("page::TryUnqueueLastArmyActionStep(" + army_id_string + ")");
				var army_action_steps = this.queued_action_steps[army_id_string];
				console.log("army_action_steps:");
				console.log(army_action_steps);
				if(army_action_steps == null || army_action_steps == undefined)
				{
					console.log("ERROR! page::TryUnqueueArmyActionStep(" + moving_army.id_string + ") failed because there was no army_action_steps");
					return false;
				}
				var last_action_step = army_action_steps.pop();
				console.log("last_action_step:");
				console.log(last_action_step);
				if(last_action_step != undefined)
				{
					//success, now clear out the list
					if(army_action_steps.length == 0)
					{
						console.log("army_action_steps is finished so clearing it out...");
						delete this.queued_action_steps[army_id_string];
						
					}
					else
					{
						console.log("final army_action_steps.length:" + army_action_steps.length);
					}
					
					if(last_action_step.step_type == this.ACTION_SPLIT)
					{
						//special handling if it is a SPLIT type action step
						console.log("cleaning up split action");
						console.log(this.queued_split_armies_by_province);
						var army_id_num = this.GetArmyIdNumFromString(army_id_string);
						var army = this.GetArmyById(army_id_num);
						delete this.queued_split_armies_by_province[army.prov_name];
						console.log(this.queued_split_armies_by_province);
					}
					
					//this is probably redundant due to javascript garbage caching
					delete last_action_step;
					
					return true;
				}
				else
				{
					console.log("ERROR! page::TryUnqueueArmyActionStep(" + moving_army.id_string + ") pop() failed on army_action_steps");
					return false;
				}
				
				return false;
			},*/
			
			/*QueueArmyActionStep : function(action_step, army_id_string)
			{
				var army_action_steps = this.queued_action_steps[army_id_string];
				if(army_action_steps == null || army_action_steps == undefined)
				{
					this.queued_action_steps[army_id_string] = [];
					army_action_steps = this.queued_action_steps[army_id_string];
				}
				army_action_steps.push(action_step);
			},*/
			
			/*GetQueuedSplitArmyProvinceOrCreate : function(army_prov_name, army_player_id)
			{
				console.log("page::GetQueuedSplitArmyProvinceOrCreate(" + army_prov_name + "," + army_player_id + ")");
				var queued_split_army = this.GetQueuedSplitArmyProvinceOrNull(army_prov_name);
				if(!queued_split_army)
				{
					var temp_army_info = {army_id: this.getTempArmyId(), player_id: army_player_id, prov_name: army_prov_name, tiles: []};
					queued_split_army = this.CreateArmy(temp_army_info, null);
					queued_split_army.SetMoving(true);
					this.queued_split_armies_by_province[army_prov_name] = queued_split_army;
					console.log("page::GetQueuedSplitArmyProvinceOrCreate(" + army_prov_name + "," + army_player_id + ") creating new army");
				}
				else
				{
					console.log("page::GetQueuedSplitArmyProvinceOrCreate(" + army_prov_name + "," + army_player_id + ") army already exists");
				}
				console.log(queued_split_army);
				return queued_split_army;
			},
			
			GetQueuedSplitArmyProvinceOrNull : function(prov_name)
			{
				console.log("page::GetQueuedSplitArmyProvinceOrNull(" + prov_name + ")");
				console.log(this.queued_split_armies_by_province);
				var queued_split_army = this.queued_split_armies_by_province[prov_name];
				console.log(queued_split_army);
				if(queued_split_army != undefined)
				{
					return queued_split_army;
				}
				return null;
			},*/
			
			/*UndoLastActionStep : function(acting_army)
			{
				console.log("page::UndoLastActionStep() TODO");
				var army_action_steps = this.queued_action_steps[acting_army.id_string];
				if(army_action_steps == null || army_action_steps == undefined)
				{
					console.log("Warning! page::UndoLastActionStep(" + acting_army.id_string + ") but no action steps were queued");
					return;
				}
				
				var last_action_step = army_action_steps.pop();
				console.log("last_action_step in province " + last_action_step.prov_name);
				
				switch(last_action_step.step_type)
				{
					case this.ACTION_MOVE:
					{
						console.log("ACTION_MOVE");
						break;
					}
					case this.ACTION_SPLIT:
					{
						console.log("ACTION_SPLIT");
						//TryUndoTileSplit : function(moving_army, tile_id)
						while(last_action_step.tile_ids.length > 0)
						{
							var tile_id = last_action_step.tile_ids.pop();
							console.log("returning tile_id " + tile_id + ", " + last_action_step.tile_ids.length + " remaining");
							this.TryUndoTileSplit(acting_army, tile_id);
						}
						break;
					}
				}
			},*/
			
			HandleClickArmyOtherTileMovemode : function(clicked_tile_id)
			{
				//console.log("page::HandleClickArmyOtherTileMovemode(" + clicked_tile_id + ")");
				
				//some useful info
				var reserve_army = this.GetReservePlayerArmyOrCreate();
				
				//check if we can merge this back in 
				if(!reserve_army.getItemById(clicked_tile_id))
				{
					this.showMessage(_("Unable to select that tile for moving"), 'error');
					return;
				}
				
				//check if this tile is movable by the player
				var move_check_fail_string = this.CanCurrentPlayerMoveArmyTile(reserve_army, clicked_tile_id)
				if(move_check_fail_string)
				{
					this.showMessage(move_check_fail_string, 'error');
					return;
				}
				
				//some more useful info
				var main_army = this.selected_province_main_army;
				var main_army_display = this.selected_army_display_stack;
				var other_units_display = this.other_units_display_stack;
				
				var reserve_army_empty = false;
				if(reserve_army.GetNumItems() == 1)
				{
					reserve_army_empty = true;
				}
				
				//transfer it from the other units display -> selected army display
				//console.log("transferring from other_units_display to main_army_display");
				//todo: there is a really subtle bug here where the army tile wont slide from reserve army display -> main army dispay when clicked
				//however it correctly slides from main army display -> reserve army display when clicked
				//possibly related: ive noticed sometimes it recreates the tile back in main army display when it should only be in reserve army display
				this.TransferArmyTilesByStack(other_units_display, main_army_display, [clicked_tile_id]);
				
				//select the tile in the display stack
				main_army_display.selectItem(clicked_tile_id);
				
				//transfer it from other (reserve) army in the province -> the main army in the province
				//console.log("transferring from reserve_army to main_army");
				this.TransferArmyTilesByStack(reserve_army, main_army, [clicked_tile_id], this.SELECT_TARGET_TILES);
				if(reserve_army_empty)
				{
					this.selected_province_reserve_army = null;
				}
				
				//calculated battle strength if attacked here
				var translated = dojo.string.substitute( _("If attacked here, these ${num} tiles will have a +${strength} bonus in combat"), {
					num: main_army.items.length,
					strength: main_army.GetArmyDefensiveBonus()
					} );
				//var strength_text = dojo.place("<div class=\"ui_selected_text\" id=\"main_army_strength\">" + translated + "</div>", selection_container);
				var main_army_strength = dojo.byId("main_army_strength");
				main_army_strength.innerHTML = translated;
				
				//select the tile on the map
				main_army.selectItem(clicked_tile_id);
				
				//refresh the ui
				this.RefreshMoveModeUI();
			},
			
			CanCurrentPlayerMoveArmyTile : function(army_stack, tile_id)
			{
				if(army_stack.player_id != this.player_id)
				{
					return this.GetWrongOwnerMoveString();
				}
				var item_type = army_stack.getItemTypeById(tile_id);
				if(this.IsTileTypeCitadel(item_type) || this.IsTileTypeCastle(item_type))
				{
					return this.GetCantMoveString();
				}
				return null;
			},
			
			HandleClickArmySelectedTileMovemode : function(clicked_tile_id)
			{
				console.log("page::HandleClickArmySelectedTile(" + clicked_tile_id + ")");
				
				//toggle item selection
				var tile_is_selected = this.selected_army_display_stack.isSelected(clicked_tile_id);
				//console.log("initial isSelected:" + tile_is_selected);
				var do_ui_refresh = false;
				var selected_prov_name = this.GetSelectedProvinceName();
				var main_army = this.selected_province_main_army;
				if(tile_is_selected)
				{
					//console.log("check1");
					//console.log("is currently selected in");
					//we can't split off a tile if this is the last one
					if(main_army.IsLastItemSelected())
					{
						//console.log("last selected item clicked, ending early");
						return;
					}
					//console.log("splitting tile off to reserve army");
					//console.log(this.other_units_display_stack);
					
					//unselect it
					//main_army.unselectItem(clicked_tile_id);
					//this.selected_army_display_stack.unselectItem(clicked_tile_id);
					//this.selected_army_display_stack.ItemToBottom(clicked_tile_id);
					
					//transfer it from the selected army display -> other units display
					this.TransferArmyTilesByStack(this.selected_army_display_stack, this.other_units_display_stack, [clicked_tile_id], this.SELECT_ARMY_NONE);
					
					//we will now "separate" this tile from the main army so it doesnt move
					//console.log("transfering tiles to temp army");
					
					//transfer it from the main army in the province -> other (reserve) army in the province
					var reserve_army = this.GetReservePlayerArmyOrCreate();
					this.TransferArmyTilesByStack(main_army, reserve_army, [clicked_tile_id], this.SELECT_ARMY_NONE);
					
					//calculated battle strength if attacked here
					var translated = dojo.string.substitute( _("If attacked here, these ${num} tiles will have a +${strength} bonus in combat"), {
						num: main_army.items.length,
						strength: main_army.GetArmyDefensiveBonus()
						} );
					//var strength_text = dojo.place("<div class=\"ui_selected_text\" id=\"main_army_strength\">" + translated + "</div>", selection_container);
					var main_army_strength = dojo.byId("main_army_strength");
					main_army_strength.innerHTML = translated;
					
					this.RefreshMoveModeUI();
				}
			},
			
			MergeReserveArmyBackIntoMain : function()
			{
				console.log("page::MergeReserveArmyBackIntoMain()");
				//first, find the reserve army in this province
				if(!this.selected_province_reserve_army)
				{
					//reserve_stack will be null here if the player has not unselected any tiles from the main stack (intended behaviour)
					//console.log("WARNING! page::MergeReserveArmyBackIntoMain() but his.selected_province_reserve_army is null");
					return;
				}
				//console.log(this.selected_province_reserve_army);
				if(!this.selected_province_reserve_army.prov_name)
				{
					console.log("ERROR! page::MergeReserveArmyBackIntoMain() but his.selected_province_reserve_army.prov_name is null");
					return;
				}
				
				//which province is it in?
				var reserve_province_name = this.selected_province_reserve_army.prov_name;
				
				//what is the main army in this province we should merge it into?
				var main_stack = this.GetMainPlayerArmyInProvinceOrCreate(reserve_province_name, this.player_id);
				//console.log(main_stack);
				
				//move all tiles back on the map
				this.TransferArmyTilesByStack(this.selected_province_reserve_army, main_stack, [], this.SELECT_TARGET_TILES);
				
				//clear out the reserve army
				this.selected_province_reserve_army = null;
			},
			
			/*
			MergeReserveDisplayBackIntoMain : function()
			{
				//console.log("page::MergeReserveDisplayBackIntoMain()");
				if(this.other_units_display_stack)
				{
					//console.log("page::MergeReserveDisplayBackIntoMain() this.other_units_display_stack.items.length: " + this.other_units_display_stack.items.length);
					//move all tiles back on the ui display
					//todo: instead of all the units, need to selectively bring back the movable ones
					this.TransferArmyTilesByStack(this.other_units_display_stack, this.selected_army_display_stack, [], this.SELECT_ARMY_NONE, false);
				}
				else
				{
					console.log("WARNING page::MergeReserveDisplayBackIntoMain() this.other_units_display_stack is null");
				}
			},
			*/
			
			ClearReserveDisplay : function()
			{
				//console.log("page::ClearReserveDisplay()");
				if(this.other_units_display_stack)
				{
					//console.log(this.other_units_display_stack);
					//console.log("items.length: " + this.other_units_display_stack.items.length);
					this.other_units_display_stack.RemoveAllTilesFromStack();
				}
				else
				{
					console.log("WARNING page::ClearReserveDisplay() this.other_units_display_stack is null");
				}
			},
		});
		
		return instance;
	}
);