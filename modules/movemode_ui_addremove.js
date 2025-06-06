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
		
		var instance = declare("_movemode_ui_addremove", null, {
			//put your functions here
			
			AddMoveModeUI : function()
			{
				if(!this.IsAnyProvinceSelected())
				{
					//there is no map overlay to add if we have no province selected
					return;
				}
				
				//loop over each previously planned army movements
				var moving_army = this.selected_province_main_army;
				if(moving_army == null)
				{
					//this is intended behaviour eg if there is no army in a province
					//console.log("ERROR! page::AddMoveModeUI() selected province name: " + this.GetSelectedProvinceName() + " unable to find main army in province");
					return;
				}
				
				if(!this.DoesActivePlayerOwnArmy(moving_army))
				{
					console.log("ERROR! not your army!");
					//this.UnselectArmyStack();
					return;
				}
				
				if(moving_army.IsStackEmpty())
				{
					//this seems to occur periodically. it's most likely intended behaviour, but i cant quite figure out all the logic chains that would trigger it
					//so my instinct is that either there is unintended behaviour or i could potentially add some optimisations by removing redunadnt UI calls
					//i will leave it to silently end early for now because it isnt technically a bug
					//console.log("WARNING! page::AddMoveModeUI() selected province name: " + this.GetSelectedProvinceName() + " moving_army: " + moving_army.id_string + " but moving army is empty");
					return;
				}
				
				//console.log("page::AddMoveModeUI() selected province name: " + this.GetSelectedProvinceName() + " moving army: " + moving_army.id_string);
				
				//check the adjacent province links and add move cost overlays
				//basic army movement is 1 province at a time
				
				const start_province_info = this.provinces_by_name[this.GetSelectedProvinceName()];
				var this_movemode_iteration = ++this.movemode_iteration;
				start_province_info.move_prov_previous = null;
				//start_province_info.move_link_previous = null;
				start_province_info.move_cost_cumulative = 0;
				start_province_info.move_overlay_type = PROV_START;
				start_province_info.move_info = null;
				start_province_info.movemode_iteration = this_movemode_iteration;
				//console.log("starting adjacency checks for:");
				//console.log(start_province_info);
				
				//start with all provinces adjacent to the starting province
				const unchecked_provs = [];
				const checked_provs = [start_province_info];
				for(var i=0;i<start_province_info.linked_prov_ids.length; i++)
				{
					var linked_prov_id = start_province_info.linked_prov_ids[i];
					var adj_province_info = this.provinces[linked_prov_id];
					if(adj_province_info != start_province_info)
					{
						unchecked_provs.push(adj_province_info);
						adj_province_info.move_prov_previous = start_province_info;
						adj_province_info.movemode_iteration = this_movemode_iteration;
						//checked_provs.push(adj_province_info);
					}
				}
				
				//do we need to calculate movement by ship transport? only ships can't use ship movement
				var do_ship_movement = moving_army.CanArmyShipMove();
				//console.log("do_ship_movement:");
				//console.log(do_ship_movement);
				
				//loop over each adjacent province for unchecked provinces to see if this is a destination province OR a "ship movement" province
				while(unchecked_provs.length > 0)
				{
					//grab the oldest unchecked prov first
					var check_prov = unchecked_provs[0];
					unchecked_provs.splice(0, 1);
					//console.log("check_prov:")
					//console.log(check_prov);
					
					//get all the relevant info and checks from this army attempting to move into this province
					var move_info = this.GetProvinceMoveInfo(moving_army, check_prov);
					check_prov.move_info = move_info;
					check_prov.move_cost_cumulative = check_prov.move_prov_previous.move_cost_cumulative + move_info.total_move_cost;
					check_prov.move_overlay_type = move_info.overlay_type;
					//console.log("move_info:")
					//console.log(move_info);
					checked_provs.push(check_prov);
					
					//if we can use sea transit to move through this province, check for adjacent ones to move through
					//disable for now
					continue;
					if(move_info.sea_transit)
					{
						//console.log(check_prov.name + " sea_transit");
						//check adjacent provinces
						//console.log("check_prov:");
						//console.log(check_prov);
						for(var i=0;i<start_province_info.linked_prov_ids.length; i++)
						{
							var linked_prov_id = start_province_info.linked_prov_ids[i];
							var adj_province_info = this.provinces[linked_prov_id];
							
							if(!checked_provs.includes(adj_province_info))
							{
								//console.log("adding adjacent province: " + adj_province_info.name);
								unchecked_provs.push(adj_province_info);
								checked_provs.push(adj_province_info);
								adj_province_info.move_prov_previous = check_prov;
								adj_province_info.movemode_iteration = this_movemode_iteration;
								//adj_province_info.move_link_previous = move_link;
							}
						}
					}
				}
				
				//now, loop over all checked provinces and add a movement overlay
				//console.log("adding province overlays");
				for(var i in checked_provs)
				{
					var check_prov = checked_provs[i];
					//console.log("check_prov:");
					//console.log(check_prov);
					//console.log(check_prov.name);
					if(check_prov.move_cost_cumulative > 0)
					{
						this.SetProvinceOverlay(check_prov, check_prov.move_overlay_type, LABEL_MOVECOST, check_prov.move_cost_cumulative);
					}
					else
					{
						this.SetProvinceOverlay(check_prov, check_prov.move_overlay_type);
					}
					
					//add a movement link to this province
					if(check_prov.move_info && !check_prov.move_info.army_impassable)
					{
						//todo: something in this province isnt drawing the move link paths correctly
						//its a low priority bug though
						this.AddProvinceMoveLink(start_province_info, check_prov, check_prov.move_overlay_type);
					}
					
					//record it as a valid province to move to
					/*
					if(!check_prov.move_link_previous)
					{
						//console.log("WARNING: move_link_previous is null");
					}
					else if(!check_prov.move_prov_previous)
					{
						//console.log("WARNING: move_prov_previous is null");
					}
					else if(!check_prov.move_info)
					{
						//console.log("WARNING: move_info is null");
					}
					else if(!check_prov.move_info.army_impassable)
					{
						//this.AddProvinceMoveLink(start_province_info, adj_province_info, overlay_type);
						//this.AddProvinceMoveLinkPath(check_prov.move_link_previous.path_segments, check_prov.move_overlay_type, true)
					}
					*/
				}
				
				
				//does the selected army have any previously queued moves?
				const army_action_steps = this.queued_action_steps[moving_army.id_string];
				if(army_action_steps && army_action_steps != undefined)
				{
					//console.log("army_action_steps:");
					//console.log(army_action_steps);
					
					//loop over this army's old queued moves and override any previously applied movement overlays
					for(var k in army_action_steps)
					{
						//shade in the province a colour
						var action_step = army_action_steps[k];
						
						if(action_step.step_type != this.ACTION_MOVE)
						{
							continue;
						}
						
						//console.log(action_step);
						var cur_province_info = this.GetProvinceById(action_step.prov_id);
						this.SetProvinceOverlay(cur_province_info, PROV_QUEUED);
						
						if(k > 0)
						{
							//console.log("drawing move link");
							//draw a line between the provinces
							var prev_move_step = army_action_steps[k - 1];
							var prev_province_info = this.GetProvinceById(prev_move_step.prov_id);
							if(action_step.sea_transit_chain.length > 0)
							{
								//console.log("drawing sea chain");
								//loop over sea provinces and create a chain of links
								//var cur_chain_prov = prev_province_info;
								//var next_chain_prov = prev_province_info.move_prov_previous;
								//adj_province_info.movemode_iteration = this_movemode_iteration;
								for(var chain_index in action_step.sea_transit_chain)
								//while(cur_chain_prov.move_prov_previous && cur_chain_prov.movemode_iteration == this_movemode_iteration && cur_chain_prov.move_prov_previous != undefined)
								{
									var sea_prov_id = action_step.sea_transit_chain[chain_index];
									var sea_prov = this.provinces[sea_prov_id];
									var other_prov;
									if(chain_index == 0)
									{
										other_prov = cur_province_info;
									}
									else
									{
										var other_prov_id = action_step.sea_transit_chain[chain_index - 1];
										other_prov = this.provinces[other_prov_id];
									}
									//console.log("drawing sea link " + sea_prov.name + "->" + other_prov.name);
									this.AddProvinceMoveLink(sea_prov, other_prov, PROV_SEA);
									//cur_chain_prov = next_chain_prov;
									//next_chain_prov = next_chain_prov.move_prov_previous;
								}
							}
							else
							{
								//console.log("drawing regular movement link");
								this.AddProvinceMoveLink(cur_province_info, prev_province_info, PROV_QUEUED);
							}
						}
					}
				}
				else
				{
					//this will be undefined if the army has no currently queued moves
					//console.log("WARNING: army_action_steps is " + army_action_steps);
				}
			},
			
			RemoveMoveModeUI : function()
			{
				//console.log("page::RemoveMoveModeUI()");
				this.ClearCanvas();
				
				//clean up the ui
				dojo.query(".province_move_cost").forEach(function(node){dojo.destroy(node)});
			},
			
			RefreshMoveModeUI : function()
			{
				//console.log("page::RefreshMoveModeUI()");
				if(this.isCurrentPlayerMoveMode())
				{
					this.RemoveMoveModeUI();
					this.AddMoveModeUI();
				}
				else
				{
					//console.log("WARNING: trying to refresh move mode UI but not currently in move mode");
				}
			},
			
		});
			
		return instance;
	}
);
