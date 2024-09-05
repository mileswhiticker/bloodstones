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
		
		var instance = declare("_undead_ui", null, {
			//put your functions here
			
			RefreshUndeadStateUI : function()
			{
				if(this.isCurrentPlayerUndeadState())
				{
					this.RemoveUndeadStateUI();
					this.AddUndeadStateUI();
				}
			},
			
			AddUndeadStateUI : function()
			{
				if(this.selected_army != null)
				{
					var moving_army = this.selected_army;
					//we dont need to draw anything if we dont own this army
					if(!this.DoesActivePlayerOwnArmy(moving_army))
					{
						return;
					}
					
					//any non-undead in this army means it cant move during this state
					if(moving_army.DoesArmyContainNonUndead())
					{
						//console.log("army contains non-undead");
						return;
					}
					
					if(!moving_army.DoesArmyContainUndead())
					{
						//sanity check
						console.log("WARNING! pageAddUndeadStateUI() but selected army contains neither undead or not-undead. Most likely outcome is this is an empty army");
						console.log(moving_army);
						return;
					}
					
					//console.log("page::AddUndeadStateUI()");
					this.SetActionCost(moving_army.UndeadMovesRemaining());
					
					const start_province_info = this.provinces_by_name[moving_army.prov_name];
					var checked_provinces = [];
					checked_provinces[start_province_info.id_string] = start_province_info;
					
					//does this undead have moves queued?
					if(this.queued_undead_moves[moving_army.id_string])
					{
						var army_queued_undead_moves = this.queued_undead_moves[moving_army.id_string];
						//console.log("undead has moves queued:" + army_queued_undead_moves.length);
						//console.log(army_queued_undead_moves);
						var prev_prov_info;
						for(var i in army_queued_undead_moves)
						{
							var province_name = army_queued_undead_moves[i];
							var prov_info = this.provinces_by_name[province_name];
							checked_provinces[prov_info.id_string] = prov_info;
							this.SetProvinceOverlay(prov_info, PROV_QUEUED);
							if(prev_prov_info)
							{
								//this.SetProvinceOverlay(prov_info, PROV_MOVE1, LABEL_MOVECOST, 1);
								this.AddProvinceMoveLink(prov_info, prev_prov_info, PROV_QUEUED);
							}
							else
							{
								//this.SetProvinceOverlay(prov_info, PROV_START, LABEL_MOVECOST, 1);
							}
							prev_prov_info = prov_info;
						}
					}
					else
					{
						this.SetProvinceOverlay(start_province_info, PROV_START);
					}
					
					//does this army have moves left?
					var moves_left = moving_army.UndeadMovesRemaining();
					if(moves_left > 0)
					{
						//console.log("undead has moves_left:" + moves_left);
						for(var i in start_province_info.movement_link_paths)
						{
							var move_link = start_province_info.movement_link_paths[i];
							//console.log("move_link:");
							//console.log(move_link);
							var adj_province_info = move_link.target_prov;
							//console.log("checking prov_info:");
							//console.log(adj_province_info);
							if(!checked_provinces.includes(adj_province_info.name))
							{
								var move_info = this.GetProvinceMoveInfo(moving_army, adj_province_info);
								adj_province_info.move_info = move_info;
								this.SetProvinceOverlay(adj_province_info, move_info.overlay_type);
								if(!this.move_info_provinces.includes(adj_province_info.name))
								{
									this.move_info_provinces[adj_province_info.name] = adj_province_info;
								}
							}
						}
					}
				}
			},
			
			RemoveUndeadStateUI : function()
			{
				this.ClearCanvas();
			},
			
			FinishUndeadStateUI : function(success)
			{
				//console.log("page::UIFinishBuildVillages()");
				this.RemoveUndeadStateUI();
				if(success)
				{
					//the pay window will get destroyed later when we get confirmation from the server that the player action was processed
					this.LockPaymentBucket();
				}
				else
				{
					this.DestroyPayWindow();
				}
			},
			
			HandleUndeadStateArmyClicked : function(clicked_army)
			{
				//is this our army?
				if(clicked_army.player_id == this.getCurrentPlayer())
				{
					//do we already have an army selected?
					var do_select = false;
					if(this.selected_army == null)
					{
						//select this army
						do_select = true;
					}
					else if(this.selected_army == clicked_army)
					{
						//unselect this army
						this.UnselectArmyStack();
						this.SetPaymodeUndeadUnselect();
						this.RefreshUndeadStateUI();
					}
					else if(this.selected_army.prov_name == clicked_army.prov_name)
					{
						//does the other army have queued moves?
						if(!clicked_army.IsMoving())
						{
							//does this army have queued moves?
							if(!this.selected_army.IsMoving())
							{
								//merge the selected units into the target army
								var selected_tile_ids = this.selected_army.getSelectedTileIds();
								this.ServerArmyMerge(this.selected_army, clicked_army, selected_tile_ids);
								
								this.RefreshUndeadStateUI();
							}
							else
							{
								this.showMessage(_('You must finish moving this army before merging it.'), 'error');
							}
						}
						else
						{
							this.showMessage(_('That army must finish its move before merging.'), 'error');
						}
					}
					else
					{
						//this.showMessage(_('Finish planning your current move before selecting another army.'), 'error');
						
						//change selection to the other army
						this.UnselectArmyStack();
						do_select = true;
					}
					
					if(do_select)
					{
						this.SelectArmyStack(clicked_army);
						this.SetPaymodeUndeadSelect();
						this.RefreshUndeadStateUI();
					}
				}
			},
		});
		
		return instance;
	}
);