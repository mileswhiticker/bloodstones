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
				//some sanity checks
				if(this.selected_army == null)
				{
					return null;
				}
				if(!this.DoesActivePlayerOwnArmy(this.selected_army))
				{
					return;
				}
				var moving_army = this.selected_army;
				
				//console.log("page::QueueArmyMove(" + target_province_name + ", " + moving_army.id_string + ")");
				const target_province_info = this.provinces_by_name[target_province_name];
				
				//did we click on the current province?
				if(target_province_info.name == moving_army.province_id)
				{
					//console.log("SANITY CHECK: QueueArmyMove() being called for the same province the army is in");
					return;
				}
				
				//check to see if there is a movement link to this province
				var already_queued = this.isProvinceQueuedMove(target_province_info, moving_army);
				var sea_transit_chain_steps = [];
				if(already_queued)
				{
					//silently fail, this is not something players would want to do
					return;
				}
				
				const start_province_info = this.provinces_by_name[moving_army.province_id];
				var can_move = false;
				if(this.AreProvincesLinked(start_province_info, target_province_info))
				{
					can_move = true;
				}
				else
				{
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
					
					if(check_prov.name == moving_army.province_id)
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
				}
				
				//console.log(target_province_info.move_info);
				if(target_province_info.move_info.army_impassable)
				{
					this.showMessage(this.GetProvinceEntryFailString(), 'error');
					return;
				}
				
				if(can_move)
				{
					if(!moving_army.IsMoving())
					{
						moving_army.StartQueuedMove();
						moving_army.SetMoving(true);
					}
					//this.lockArmyTileSelection();
					
					this.MoveArmy(moving_army, target_province_name, false);
					/*
					var army_planned_moves = this.queued_province_moves_by_army[moving_army.id_string];
					if(!army_planned_moves)
					{
						this.queued_province_moves_by_army[moving_army.id_string] = [];
						army_planned_moves = this.queued_province_moves_by_army[moving_army.id_string];
					}
						
					if(army_planned_moves.length == 0)
					{
						var move_step = {step_type: this.ACTION_MOVE, prov_name: start_province_info.name, sea_transit_chain: []};
						army_planned_moves.push(move_step);
					}
					var move_step = {step_type: this.ACTION_MOVE, prov_name: target_province_name.name, sea_transit_chain: []};
					army_planned_moves.push(move_step);
					*/
					//console.log(target_province_info.move_info);
					this.AddActionCostAmount(target_province_info.move_info.total_move_cost);
					//console.log("this.queued_province_moves_by_army:");
					//console.log(this.queued_province_moves_by_army);
					//for the server action processing
					
					var army_action_steps = this.queued_action_steps[moving_army.id_string];
					if(!army_action_steps)
					{
						this.queued_action_steps[moving_army.id_string] = [];
						army_action_steps = this.queued_action_steps[moving_army.id_string];
						var start_prov_id = this.GetProvinceIdFromName(start_province_info.name);
						var start_move_step = {step_type: this.ACTION_MOVE, prov_name: start_province_info.name, prov_id: start_prov_id, sea_transit_chain: sea_transit_chain_steps};
						//console.log(start_province_info);
						//console.log(move_step)
						army_action_steps.push(start_move_step);
					}
					var target_prov_id = this.GetProvinceIdFromName(target_province_name);
					var move_step = {step_type: this.ACTION_MOVE, prov_name: target_province_name, prov_id: target_prov_id, sea_transit_chain: sea_transit_chain_steps};
					army_action_steps.push(move_step);
					
					//console.log("this.queued_province_moves_by_army:");
					//console.log(this.queued_province_moves_by_army);
					
					//ui update
					this.RefreshMoveModeUI();
				}
			},
			
			isProvinceQueuedMove(target_province_info, moving_army)
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
			},
			
			QueueArmySplit : function(source_army, splitting_tile_ids, temp_army)
			{
				//console.log("page::QueueArmySplit(" + source_army.id_num + "," + splitting_tile_ids[0] + "," + temp_army.id_num + ")");
				//regular expression to extract the army id number from the node id string
				//var army_id_num = source_army.id_string.replace(/[^0-9]/g,"");
				
				//convert to JSON for passing to server
				//splitting_tiles_JSON = JSON.stringify(splitting_tile_ids);
				
				for(var i in splitting_tile_ids)
				{
					var cur_tile_id = splitting_tile_ids[i];
					var split_prov_id = this.GetProvinceIdFromName(source_army.province_id);
					var split_step = {step_type: this.ACTION_SPLIT, prov_name: source_army.province_id, prov_id: split_prov_id, tile_id: cur_tile_id, temp_army_id_num: temp_army.id_num};
					
					//this is what gets sent to the server for processing
					var army_action_steps = this.queued_action_steps[source_army.id_string];
					if(army_action_steps == null || army_action_steps == undefined)
					{
						this.queued_action_steps[moving_army.id_string] = [];
						army_action_steps = this.queued_action_steps[source_army.id_string];
					}
					army_action_steps.push(split_step);
					
					//this is a shortcut for our ui
					var army_split_step = {tile_id: cur_tile_id, source_army_id_num: source_army.id_num, temp_army_id_num: temp_army.id_num};
					this.queued_splitting_armies.push(army_split_step);
				}
			},

		});
		
		return instance;
	}
);