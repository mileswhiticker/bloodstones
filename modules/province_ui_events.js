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
		
		var instance = declare("_province_ui_events", null, {
			//put your functions here
			
			onClickProvince : function(event)
			{
				console.log("page::onClickProvince()");
				event.stopPropagation();
				console.log(event);
				
				var province_area_element = $(event.target.id);
				var province_name = province_area_element.dataset.province_id;
				//const province_info = this.provinces_by_name[province_name];
				
				/*var province_info = window.gameui.provinces_by_name[province_name];
				this.DebugDrawMoveLinks(province_info);
				return;*/
				
				if(window.gameui.isCurrentPlayerActive())
				{
					console.log("check1");
					//im doing if..else chains here instead of string defines because it's a little easier and isn't much harder to read
					if(window.gameui.isCurrentPlayerUndeadState())
					{
						console.log("check1.1");
						window.gameui.TryQueueProvinceMoveUndead(province_name);
					}
					else if(window.gameui.isCurrentPlayerMoveMode())
					{
						console.log("check1.2");
						window.gameui.TryQueueProvinceMove(province_name);
					}
					else if(window.gameui.isCurrentPlayerCitadelState())
					{
						console.log("check1.3");
						window.gameui.EndCitadelState(province_name);
					}
					else if(window.gameui.isCurrentPlayerRetreatState())
					{
						console.log("check1.4");
						//is this a valid retreat province?
						for(var index in window.gameui.retreat_prov_options)
						{
							var retreat_option = window.gameui.retreat_prov_options[index];
							if(retreat_option.name == province_name)
							{
								//found it
								window.gameui.ServerRetreat(province_name);
								return;
							}
						}
					}
					else if(window.gameui.isCurrentPlayerWithdrawState())
					{
						console.log("check1.5");
						//is this a valid retreat province?
						for(var index in window.gameui.retreat_prov_options)
						{
							var retreat_option = window.gameui.retreat_prov_options[index];
							if(retreat_option.name == province_name)
							{
								//found it
								window.gameui.ServerWithdraw(province_name);
								return;
							}
						}
					}
					else if(window.gameui.isCurrentPlayerVillagesState())
					{
						console.log("check1.6");
						var province_info = window.gameui.provinces_by_name[province_name];
						window.gameui.TryQueueVillageBuild(province_info);
					}
					else
					{
						console.log("check1.7");
						//just unselect the current army, if there is one selected
						window.gameui.UnselectArmyStack();
					}
				}
				else
				{
					console.log("check2");
					//just unselect the current army, if there is one selected
					window.gameui.UnselectArmyStack();
				}
			},
			
			onDragEnterProvince : function(event)
			{
				//console.log("page::onDragEnterProvince() " + window.gameui.dragging_data_id);
				//console.log(event);
				if(window.gameui.isCurrentPlayerBuildMode())
				{
					//window.gameui.dragging_data_id
					//SetProvinceOverlay : function(province_info, overlay_type = PROV_NONE, label_type = LABEL_NONE, label_text = "")
					var check_string = null;
					if(window.gameui.dragging_data_id != null)
					{
						check_string = window.gameui.dragging_data_id.substring(0,16);
					}
					if(check_string == "player_hand_item")
					{
						//console.log(event);
						var prov_name = window.gameui.GetProvNameFromAreaElement(event.target.id);
						//console.log(prov_name);
						
						var province_info = window.gameui.provinces_by_name[prov_name]
						//console.log(province_info);
						//window.gameui.SetProvinceOverlay(province_info, window.gameui.GetProvinceBuildableHover(province_info));
						window.gameui.EnableProvinceBuildHover(prov_name);
					}
				}
				else if(window.gameui.isCurrentPlayerVillagesState())
				{
					if(window.gameui.dragging_data_id == "current_player_villages")
					{
						var prov_name = window.gameui.GetProvNameFromAreaElement(event.target.id);
						//var province_info = window.gameui.provinces_by_name[prov_name]
						window.gameui.EnableProvinceBuildHover(prov_name);
					}
				}
			},
			
			onDragLeaveProvince : function(event)
			{
				if(window.gameui.isCurrentPlayerBuildMode())
				{
					//console.log("page::onDragLeaveProvince() " + window.gameui.dragging_data_id);
					var check_string = null;
					if(window.gameui.dragging_data_id != null)
					{
						check_string = window.gameui.dragging_data_id.substring(0,16);
					}
					if(check_string == "player_hand_item")
					{
						//console.log(event);
						var prov_name = window.gameui.GetProvNameFromAreaElement(event.target.id);
						if(prov_name == window.gameui.pulsing_province_id)
						{
							//console.log(prov_name);
							
							var province_info = window.gameui.provinces_by_name[prov_name]
							//console.log(province_info);
							//window.gameui.SetProvinceOverlay(province_info, window.gameui.GetProvinceBuildableHover(province_info));
							window.gameui.DisableProvinceBuildHover(prov_name);
						}
					}
					//console.log(event);
				}
				else if(window.gameui.isCurrentPlayerVillagesState())
				{
					if(window.gameui.dragging_data_id == "current_player_villages")
					{
						var prov_name = window.gameui.GetProvNameFromAreaElement(event.target.id);
						//var province_info = window.gameui.provinces_by_name[prov_name]
						window.gameui.EnableProvinceBuildHover(prov_name);
					}
				}
			},
			
			EnableProvinceBuildHover : function(prov_name)
			{
				if(this.pulsing_province_id != null)
				{
					this.DisableProvinceBuildHover(this.pulsing_province_id);
				}
				if(this.pulsing_province_id == null)
				{
					//console.log("enabling hover " + prov_name);
					this.pulsing_province_id = prov_name;
					
					//var prov_area = dojo.byId(this.pulsing_province_id + "_area");
					//dojo.addClass(prov_area,"province_hover_anim");
					
				}
				else
				{
					console.log("WARNING: EnableProvinceBuildHover() but pulsing_province_id is not null: " + this.pulsing_province_id);
				}
			},
			
			DisableProvinceBuildHover : function(prov_name)
			{
				if(this.pulsing_province_id == prov_name)
				{
					//console.log("disabling hover " + prov_name);
					//var prov_area = dojo.byId(this.pulsing_province_id + "_area");
					//dojo.removeClass(prov_area,"province_hover_anim");
					
					this.pulsing_province_id = null;
				}
				else if(this.pulsing_province_id != null)
				{
					console.log("WARNING: DisableProvinceBuildHover(" + prov_name + ") but this.pulsing_province_id is: " + this.pulsing_province_id);
				}
				else
				{
					console.log("WARNING: DisableProvinceBuildHover(" + prov_name + ") but this.pulsing_province_id is: null");
				}
			},
			
			onDragOverProvince : function(event)
			{
				event.preventDefault();
				//console.log("page::onDragOverProvince() " + window.gameui.dragging_data_id);
				//window.gameui.pulsing_province_id = window.gameui.dragging_data_id;
			},
			
			onDropProvince : function(event)
			{
				event.preventDefault();
				
				var prov_name = window.gameui.GetProvNameFromAreaElement(event.target.id);
				var target_prov_id = window.gameui.GetProvinceIdFromName(prov_name);
				window.gameui.DisableProvinceBuildHover(prov_name);
				
				//console.log("page::onDropProvince() target_prov_id:" + target_prov_id);
				
				if(window.gameui.isCurrentPlayerBuildMode())
				{
					if(window.gameui.dragging_data_id != null)
					{
						var check_string = window.gameui.dragging_data_id.substring(0,16);
						if(check_string == "player_hand_item")
						{
							//check if this is a valid build province
							//todo: should this array window.gameui.buildable_provinces be indexed? that way we dont have to loop over it
							var found = false;
							var buildable_prov_id;
							for(var index in window.gameui.buildable_provinces)
							{
								buildable_prov_id = window.gameui.buildable_provinces[index];
								if(target_prov_id == buildable_prov_id)
								{
									//this one is buildable
									found = true;
									break;
								}
							}
							
							var success = false;
							if(found)
							{
								//can this type of unit be built in this province?
								var tile_id = check_string = window.gameui.dragging_data_id.substring(17);
								var tile_info = window.gameui.gamedatas.hand[tile_id];
								if(window.gameui.CanProvinceBuildTile(buildable_prov_id, tile_info))
								{
									success = true;
									//console.log("dropping tile_id:" + tile_id + " on prov_name:" + prov_name);
									window.gameui.QueueArmyBuild(prov_name, tile_id);
								}
								else
								{
									//show a warning message that this tile cant be built in this province
									window.gameui.showMessage(window.gameui.GetProvinceBuildFailString(),"error");
								}
							}
							else
							{
								var prov_info = window.gameui.GetProvinceById(target_prov_id);
								//console.log(target_prov_id);
								//console.log(prov_info);
								window.gameui.showMessage(window.gameui.GetProvinceBuildUnfoundString(prov_info.type),"error");
							}
							
							if(!success)
							{
								//todo: sfx here
								//
							}
						}
					}
					
				}
				else if(window.gameui.isCurrentPlayerVillagesState())
				{
					if(window.gameui.dragging_data_id == "current_player_villages")
					{
						var province_info = window.gameui.provinces_by_name[prov_name];
						window.gameui.TryQueueVillageBuild(province_info);
					}
				}
			},
			
			DebugDrawMoveLinks : function(prov_info)
			{
				console.log("page::DebugDrawMoveLinks(" + prov_info.name + ")");
				console.log(prov_info);
				this.ClearCanvas();
				this.SetProvinceOverlay(prov_info, PROV_MOVE1, LABEL_MOVECOST, ".");
				
				for(var linked_prov_index in prov_info.movement_link_paths)
				{
					var movement_link = prov_info.movement_link_paths[linked_prov_index];
					this.AddProvinceMoveLinkPath(movement_link.path_segments, PROV_MOVE1);
				}
			},
			
		});
			
		return instance;
	}
);
